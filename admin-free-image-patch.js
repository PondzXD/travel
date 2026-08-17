/* Free-plan image patch: Firestore only, no Firebase Storage/Blaze required. */
(() => {
  const FIRESTORE = "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
  const FIREBASE = "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  let freeDb = null;
  let freeReady = false;
  let saving = false;

  async function freeInit() {
    if (freeReady) return;
    const { initializeApp, getApps, getApp } = await import(FIREBASE);
    const { getFirestore } = await import(FIRESTORE);
    const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG.config);
    freeDb = getFirestore(app);
    // Keep the variable used by the existing admin code in sync.
    window.cloudDb = freeDb;
    freeReady = true;
  }

  // These are used by code that resolves functions through window.
  window.initCloudPersistence = async () => freeInit();

  function compress(file, maxBytes = 42000, maxSide = 1200) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let w = img.width, h = img.height;
          const scale = Math.min(1, maxSide / Math.max(w, h));
          w = Math.max(1, Math.round(w * scale));
          h = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d", { alpha:false });
          let q = 0.78, data;
          const draw = () => { ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h); data=canvas.toDataURL("image/jpeg",q); };
          draw();
          for (let i=0;i<9 && data.length*0.75>maxBytes;i++){q=Math.max(.22,q-.07);draw();}
          let n=0;
          while(data.length*0.75>maxBytes && n<5){w=Math.max(220,Math.round(w*.78));h=Math.max(220,Math.round(h*.78));canvas.width=w;canvas.height=h;q=.52;draw();n++;}
          resolve(data);
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  window.fileToDataURL = compress;
  window.uploadFile = async file => compress(file);
  window.uploadDataUrl = async dataUrl => dataUrl;
  window.uploadGalleryFiles = async (files, pathPrefix, existing=[]) => {
    const result=[...existing].filter(Boolean);
    for(const file of files||[]){ if(result.length>=8) break; result.push(await compress(file)); }
    return result.slice(0,8);
  };

  window.saveCloudDoc = async (collectionName,id,data) => {
    await freeInit();
    const {doc,setDoc}=await import(FIRESTORE);
    const imageStrings=[];
    const add=v=>{if(typeof v==="string"&&v.startsWith("data:image"))imageStrings.push(v);};
    add(data.image);(data.gallery||[]).forEach(add);(data.productItems||[]).forEach(p=>add(p.image));
    const bytes=imageStrings.reduce((n,v)=>n+Math.round(v.length*.75),0);
    if(bytes>800000) throw new Error("รูปทั้งหมดใหญ่เกินไปสำหรับ Firebase ฟรี กรุณาลดจำนวนรูปลง");
    await setDoc(doc(freeDb,collectionName,id),data,{merge:true});
  };

  async function savePlaceFree(form) {
    await freeInit();
    const {doc,setDoc}=await import(FIRESTORE);
    const editId=form.querySelector('#placeEditId')?.value||'';
    const th=form.querySelector('#pNameTh')?.value.trim()||'';
    const en=form.querySelector('#pNameEn')?.value.trim()||'';
    const id=editId||((en||th)?(en||th).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9ก-๙_-]/g,'').replace(/-+/g,'-'):('item-'+Date.now()));
    const cover=form.querySelector('#pCover')?.files?.[0];
    const galleryFiles=[...(form.querySelector('#pGalleryFiles')?.files||[])];
    const old=window.places?.find?.(p=>p.id===id)||null;
    let image=old?.image||'';
    if(cover) image=await compress(cover);
    const gallery=[...(old?.gallery||[])];
    for(const f of galleryFiles){if(gallery.length>=8)break;gallery.push(await compress(f));}
    const val=id2=>form.querySelector(id2)?.value?.trim()||'';
    const num=id2=>val(id2)===''?null:Number(val(id2));
    const data={id,regionId:val('#pRegion')||'south',provinceId:val('#pProvince'),category:val('#pCategory')||'nature',name:{th,en},district:{th:val('#pDistrictTh'),en:val('#pDistrictEn')},description:{th:val('#pDescTh'),en:val('#pDescEn')},address:{th:val('#pAddressTh'),en:val('#pAddressEn')},openTime:val('#pOpen'),closeTime:val('#pClose'),phone:val('#pPhone'),icon:val('#pIcon')||'📍',rating:num('#pRating')??0,reviewCount:val('#pReviews'),lat:num('#pLat'),lng:num('#pLng'),hours:{th:val('#pHoursTh'),en:val('#pHoursEn')},mapsUrl:val('#pMaps'),embedUrl:val('#pEmbed'),image,gallery,visible:!!form.querySelector('#pVisible')?.checked,featured:!!form.querySelector('#pFeatured')?.checked};
    const total=(image?Math.round(image.length*.75):0)+gallery.reduce((n,v)=>n+Math.round(v.length*.75),0);
    if(total>800000) throw new Error('รูปใหญ่เกินไป กรุณาใช้รูปน้อยลงหรือรูปเล็กลง');
    await setDoc(doc(freeDb,'places',id),data,{merge:true});
    const msg=form.querySelector('#placeMsg'); if(msg){msg.textContent='บันทึกสถานที่เรียบร้อยแล้ว';msg.className='msg success';}
    setTimeout(()=>{if(typeof window.showView==='function')window.showView('places');else location.reload();},500);
  }

  // Capture the submit before the old admin-v11 handler reaches the Firebase Storage code.
  // This is deliberately registered at script load time.
  document.addEventListener('submit', async event => {
    const form=event.target;
    if(!form || form.id!=='placeForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(saving)return;
    saving=true;
    const button=form.querySelector('button[type="submit"]');
    const oldText=button?.textContent;
    if(button){button.disabled=true;button.textContent='กำลังบันทึก...';}
    try{await savePlaceFree(form);}
    catch(err){console.error(err);const msg=form.querySelector('#placeMsg');if(msg){msg.textContent=err?.message||'บันทึกไม่สำเร็จ';msg.className='msg error';}}
    finally{saving=false;if(button){button.disabled=false;button.textContent=oldText||'บันทึกสถานที่';}}
  }, true);
})();
