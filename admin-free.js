/* Admin dashboard - FREE Firebase plan, Firestore only (no Storage). */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let db = null;
let places = [];
let shops = [];
let editingPlace = null;
let editingShop = null;
let placeGallery = [];
let shopGallery = [];
let shopProducts = [];
let deleteType = null;
let deleteId = null;

async function initDb() {
  if (db) return db;
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg?.enabled || !cfg.config) throw new Error("FIREBASE_NOT_CONFIGURED");
  const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js");
  const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
  const app = getApps().length ? getApp() : initializeApp(cfg.config);
  db = getFirestore(app);
  return db;
}

async function fs() { await initDb(); return import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"); }

function showMsg(el, text="", type="") {
  if (!el) return;
  el.textContent = text;
  el.className = `msg ${type}`;
}

async function loadCloudData() {
  const { collection, getDocs } = await fs();
  const [pSnap, sSnap] = await Promise.all([
    getDocs(collection(db, "places")),
    getDocs(collection(db, "shops"))
  ]);
  places = pSnap.docs.map(d => ({ id:d.id, ...d.data() }));
  shops = sSnap.docs.map(d => ({ id:d.id, ...d.data() }));
}

function slug(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9ก-๙_-]/g,"").replace(/-+/g,"-") || `item-${Date.now()}`;
}

function compressImage(file, maxBytes=45000, maxSide=1200) {
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onerror=reject;
    r.onload=()=>{
      const img=new Image(); img.onerror=reject;
      img.onload=()=>{
        let w=img.width,h=img.height;
        const scale=Math.min(1,maxSide/Math.max(w,h)); w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
        const c=document.createElement("canvas"); c.width=w; c.height=h; const ctx=c.getContext("2d",{alpha:false});
        let q=.78,data="";
        const draw=()=>{ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);data=c.toDataURL("image/jpeg",q);};
        draw();
        for(let i=0;i<8 && data.length*.75>maxBytes;i++){q=Math.max(.25,q-.07);draw();}
        for(let i=0;i<4 && data.length*.75>maxBytes;i++){w=Math.max(240,Math.round(w*.8));h=Math.max(240,Math.round(h*.8));c.width=w;c.height=h;q=.55;draw();}
        resolve(data);
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}

async function uploadLike(file){ return file ? compressImage(file) : ""; }
async function getGallery(files, existing=[]) {
  const out=[...existing].filter(Boolean);
  for(const f of files || []) { if(out.length>=8) break; out.push(await uploadLike(f)); }
  return out;
}

async function saveDoc(collectionName,id,data){
  const { doc, setDoc }=await fs();
  // Firestore document max is 1 MiB; keep image payload conservative.
  const strings=[];
  const add=v=>{if(typeof v==="string" && v.startsWith("data:image")) strings.push(v);};
  add(data.image); (data.gallery||[]).forEach(add); (data.productItems||[]).forEach(p=>add(p.image));
  const approx=strings.reduce((n,v)=>n+Math.round(v.length*.75),0);
  if(approx>760000) throw new Error("รูปทั้งหมดใหญ่เกินไป กรุณาลดจำนวนรูปหรือจำนวน Gallery");
  await setDoc(doc(db,collectionName,id),data,{merge:true});
}

async function deleteDocCloud(collectionName,id){ const {doc,deleteDoc}=await fs(); await deleteDoc(doc(db,collectionName,id)); }

function regionName(id){return window.SITE_DATA?.regions?.find(r=>r.id===id)?.name?.th||id||"-";}
function provinceName(id){return window.SITE_DATA?.regions?.flatMap(r=>r.provinces||[]).find(p=>p.id===id)?.name?.th||id||"-";}

function showView(view){
  ["placeListView","placeFormView","shopListView","shopFormView"].forEach(id=>$("#"+id)?.classList.add("hidden"));
  $$(".nav").forEach(b=>b.classList.remove("active"));
  if(view==="places"){ $("#placeListView")?.classList.remove("hidden"); $('[data-view="places"]')?.classList.add("active"); renderPlaceList(); }
  if(view==="add-place"){ $("#placeFormView")?.classList.remove("hidden"); $('[data-view="add-place"]')?.classList.add("active"); fillPlaceForm(); }
  if(view==="shops"){ $("#shopListView")?.classList.remove("hidden"); $('[data-view="shops"]')?.classList.add("active"); renderShopList(); }
  if(view==="add-shop"){ $("#shopFormView")?.classList.remove("hidden"); $('[data-view="add-shop"]')?.classList.add("active"); fillShopForm(); }
}

function renderPlaceList(){
  const q=( $("#placeSearchAdmin")?.value || "" ).trim().toLowerCase();
  const list=places.filter(p=>!q||[p.name?.th,p.name?.en,p.district?.th,p.district?.en].filter(Boolean).join(" ").toLowerCase().includes(q));
  const box=$("#adminPlaceList"); if(!box) return;
  box.innerHTML=list.length?list.map(p=>`<article class="data-row"><div class="thumb">${p.image||p.gallery?.[0]?`<img src="${p.image||p.gallery?.[0]}">`:(p.icon||"📍")}</div><div class="data-main"><strong>${p.name?.th||p.name?.en||"ไม่มีชื่อ"}</strong><span>${regionName(p.regionId)} / ${provinceName(p.provinceId)}</span></div><div class="row-actions"><button type="button" data-edit-place="${p.id}">แก้ไข</button><button type="button" class="del" data-del-place="${p.id}">ลบ</button></div></article>`).join(""):'<div class="empty">ยังไม่มีข้อมูลสถานที่</div>';
  $$('[data-edit-place]').forEach(b=>b.onclick=()=>{editingPlace=places.find(p=>p.id===b.dataset.editPlace);showView("add-place");fillPlaceForm(editingPlace);});
  $$('[data-del-place]').forEach(b=>b.onclick=()=>openDelete("place",b.dataset.delPlace));
}

function fillRegions(selected="south",province=""){
  const regionEl=$("#pRegion"), provEl=$("#pProvince"); if(!regionEl||!provEl) return;
  regionEl.innerHTML=(SITE_DATA.regions||[]).map(r=>`<option value="${r.id}">${r.name.th}</option>`).join("");
  regionEl.value=selected || regionEl.options[0]?.value || "";
  const r=SITE_DATA.regions.find(x=>x.id===regionEl.value);
  provEl.innerHTML=(r?.provinces||[]).map(p=>`<option value="${p.id}">${p.name.th}</option>`).join("");
  if(province) provEl.value=province;
}

function fillPlaceForm(p=null){
  editingPlace=p; placeGallery=[...(p?.gallery||[])]; $("#placeForm")?.reset();
  $("#placeFormTitle").textContent=p?"แก้ไขสถานที่":"เพิ่มสถานที่";
  $("#placeEditId").value=p?.id||"";
  fillRegions(p?.regionId||"south",p?.provinceId||"");
  $("#pCategory").value=p?.category||"nature";
  $("#pNameTh").value=p?.name?.th||""; $("#pNameEn").value=p?.name?.en||"";
  $("#pDistrictTh").value=p?.district?.th||""; $("#pDistrictEn").value=p?.district?.en||"";
  $("#pDescTh").value=p?.description?.th||""; $("#pDescEn").value=p?.description?.en||"";
  $("#pAddressTh").value=p?.address?.th||""; $("#pAddressEn").value=p?.address?.en||"";
  $("#pOpen").value=p?.openTime||""; $("#pClose").value=p?.closeTime||""; $("#pPhone").value=p?.phone||""; $("#pIcon").value=p?.icon||"";
  $("#pRating").value=p?.rating??""; $("#pReviews").value=p?.reviewCount||""; $("#pLat").value=p?.lat??""; $("#pLng").value=p?.lng??"";
  $("#pHoursTh").value=p?.hours?.th||""; $("#pHoursEn").value=p?.hours?.en||""; $("#pMaps").value=p?.mapsUrl||""; $("#pEmbed").value=p?.embedUrl||"";
  $("#pVisible").checked=p?.visible!==false; $("#pFeatured").checked=p?.featured===true;
  $("#pCoverPreview").innerHTML=p?.image?`<img src="${p.image}">`:""; $("#pGalleryPreview").innerHTML=placeGallery.map(u=>`<img src="${u}">`).join("");
  showMsg($("#placeMsg"));
}

async function savePlace(e){
  e.preventDefault();
  const button=$("#placeForm button[type=submit]"); if(button) button.disabled=true;
  try{
    const id=$("#placeEditId").value || slug($("#pNameEn").value || $("#pNameTh").value);
    let image=editingPlace?.image||"";
    const cover=$("#pCover")?.files?.[0]; if(cover) image=await uploadLike(cover);
    placeGallery=await getGallery([...( $("#pGalleryFiles")?.files || [])],placeGallery);
    const data={
      id, regionId:$("#pRegion").value||"", provinceId:$("#pProvince").value||"", category:$("#pCategory").value||"nature",
      name:{th:$("#pNameTh").value.trim(),en:$("#pNameEn").value.trim()},
      district:{th:$("#pDistrictTh").value.trim(),en:$("#pDistrictEn").value.trim()},
      description:{th:$("#pDescTh").value.trim(),en:$("#pDescEn").value.trim()},
      address:{th:$("#pAddressTh").value.trim(),en:$("#pAddressEn").value.trim()},
      hours:{th:$("#pHoursTh").value.trim(),en:$("#pHoursEn").value.trim()},
      openTime:$("#pOpen").value||"", closeTime:$("#pClose").value||"", phone:$("#pPhone").value.trim(), icon:$("#pIcon").value.trim()||"📍",
      rating:$("#pRating").value?Number($("#pRating").value):0, reviewCount:$("#pReviews").value.trim(), lat:$("#pLat").value?Number($("#pLat").value):null, lng:$("#pLng").value?Number($("#pLng").value):null,
      mapsUrl:$("#pMaps").value.trim(), embedUrl:$("#pEmbed").value.trim(), image, gallery:placeGallery, visible:$("#pVisible").checked, featured:$("#pFeatured").checked
    };
    await saveDoc("places",id,data);
    const i=places.findIndex(p=>p.id===id); if(i>=0) places[i]=data; else places.unshift(data);
    showMsg($("#placeMsg"),"บันทึกสถานที่เรียบร้อยแล้ว","success");
    renderPlaceList();
  }catch(err){ console.error(err); showMsg($("#placeMsg"),err.message||"บันทึกไม่สำเร็จ"); }
  finally{ if(button) button.disabled=false; }
}

function renderShopList(){
  const box=$("#adminShopList"); if(!box) return;
  box.innerHTML=shops.length?shops.map(s=>`<article class="data-row"><div class="thumb">${s.image||s.gallery?.[0]?`<img src="${s.image||s.gallery?.[0]}">`:(s.icon||"🛍️")}</div><div class="data-main"><strong>${s.name?.th||s.name?.en||"ไม่มีชื่อ"}</strong><span>${s.type?.th||s.type?.en||"ร้านค้า"}</span></div><div class="row-actions"><button type="button" data-edit-shop="${s.id}">แก้ไข</button><button type="button" class="del" data-del-shop="${s.id}">ลบ</button></div></article>`).join(""):'<div class="empty">ยังไม่มีข้อมูลร้านค้า</div>';
  $$('[data-edit-shop]').forEach(b=>b.onclick=()=>{editingShop=shops.find(s=>s.id===b.dataset.editShop);showView("add-shop");fillShopForm(editingShop);});
  $$('[data-del-shop]').forEach(b=>b.onclick=()=>openDelete("shop",b.dataset.delShop));
}

function fillShopForm(s=null){
  editingShop=s; shopGallery=[...(s?.gallery||[])]; shopProducts=JSON.parse(JSON.stringify(s?.productItems||[])); $("#shopForm")?.reset();
  $("#shopFormTitle").textContent=s?"แก้ไขร้านค้า":"เพิ่มร้านค้า"; $("#shopEditId").value=s?.id||"";
  const ids=s?.nearbyPlaceIds||[];
  $("#nearbyPlaceCheckboxes").innerHTML=places.map(p=>`<label><input type="checkbox" value="${p.id}" ${ids.includes(p.id)?"checked":""}> ${p.name?.th||p.name?.en||p.id}</label>`).join("");
  const set=(id,v)=>{const e=$(id);if(e)e.value=v||"";};
  set("#sNameTh",s?.name?.th);set("#sNameEn",s?.name?.en);set("#sTypeTh",s?.type?.th);set("#sTypeEn",s?.type?.en);set("#sDescTh",s?.description?.th);set("#sDescEn",s?.description?.en);set("#sProductsTh",s?.products?.th);set("#sProductsEn",s?.products?.en);set("#sAddressTh",s?.address?.th);set("#sAddressEn",s?.address?.en);set("#sPhone",s?.contact?.phone);set("#sFacebook",s?.contact?.facebook);set("#sLine",s?.contact?.line);set("#sWebsite",s?.contact?.website);set("#sOpen",s?.openTime);set("#sClose",s?.closeTime);set("#sRating",s?.rating);set("#sReviews",s?.reviewCount);set("#sLat",s?.lat);set("#sLng",s?.lng);set("#sIcon",s?.icon||"🛍️");set("#sHoursTh",s?.hours?.th);set("#sHoursEn",s?.hours?.en);set("#sMaps",s?.mapsUrl);set("#sEmbed",s?.embedUrl);$("#sVisible").checked=s?.visible!==false;
  $("#sCoverPreview").innerHTML=s?.image?`<img src="${s.image}">`:""; $("#sGalleryPreview").innerHTML=shopGallery.map(u=>`<img src="${u}">`).join("");
}

async function saveShop(e){
  e.preventDefault();
  const button=$("#shopForm button[type=submit]"); if(button)button.disabled=true;
  try{
    const id=$("#shopEditId").value||slug($("#sNameEn").value||$("#sNameTh").value);
    let image=editingShop?.image||""; const cover=$("#sCover")?.files?.[0]; if(cover)image=await uploadLike(cover);
    shopGallery=await getGallery([...( $("#sGalleryFiles")?.files || [])],shopGallery);
    const nearby=[...$("#nearbyPlaceCheckboxes").querySelectorAll('input:checked')].map(x=>x.value);
    const data={id,nearbyPlaceIds:nearby,name:{th:$("#sNameTh").value.trim(),en:$("#sNameEn").value.trim()},type:{th:$("#sTypeTh").value.trim(),en:$("#sTypeEn").value.trim()},description:{th:$("#sDescTh").value.trim(),en:$("#sDescEn").value.trim()},products:{th:$("#sProductsTh").value.trim(),en:$("#sProductsEn").value.trim()},address:{th:$("#sAddressTh").value.trim(),en:$("#sAddressEn").value.trim()},contact:{phone:$("#sPhone").value.trim(),facebook:$("#sFacebook").value.trim(),line:$("#sLine").value.trim(),website:$("#sWebsite").value.trim()},openTime:$("#sOpen").value||"",closeTime:$("#sClose").value||"",hours:{th:$("#sHoursTh").value.trim(),en:$("#sHoursEn").value.trim()},rating:$("#sRating").value?Number($("#sRating").value):0,reviewCount:$("#sReviews").value.trim(),lat:$("#sLat").value?Number($("#sLat").value):null,lng:$("#sLng").value?Number($("#sLng").value):null,icon:$("#sIcon").value.trim()||"🛍️",mapsUrl:$("#sMaps").value.trim(),embedUrl:$("#sEmbed").value.trim(),image,gallery:shopGallery,productItems:shopProducts,visible:$("#sVisible").checked};
    await saveDoc("shops",id,data); const i=shops.findIndex(s=>s.id===id);if(i>=0)shops[i]=data;else shops.unshift(data);showMsg($("#shopMsg"),"บันทึกร้านค้าเรียบร้อยแล้ว","success");renderShopList();
  }catch(err){console.error(err);showMsg($("#shopMsg"),err.message||"บันทึกไม่สำเร็จ");}finally{if(button)button.disabled=false;}
}

function openDelete(type,id){deleteType=type;deleteId=id;const item=type==="place"?places.find(x=>x.id===id):shops.find(x=>x.id===id);$("#deleteTitle").textContent=type==="place"?"ลบสถานที่?":"ลบร้านค้า?";$("#deleteName").textContent=item?.name?.th||item?.name?.en||"";$("#deleteModal").classList.remove("hidden");}
function closeDelete(){$("#deleteModal").classList.add("hidden");deleteType=null;deleteId=null;}
async function confirmDelete(){try{if(deleteType){await deleteDocCloud(deleteType==="place"?"places":"shops",deleteId);if(deleteType==="place")places=places.filter(x=>x.id!==deleteId);else shops=shops.filter(x=>x.id!==deleteId);renderPlaceList();renderShopList();}}catch(e){console.error(e);}finally{closeDelete();}}

async function startAdmin(){
  try{
    if(!window.FIREBASE_CONFIG?.enabled) throw new Error("FIREBASE_NOT_CONFIGURED");
    await AuthService.initFirebase();
    const user=AuthService.getCurrentUser();
    if(!user){window.location.replace("./login.html?mode=signin");return;}
    if(!(await AuthService.isAdmin(user))){showMsg($("#loginMsg"),"บัญชีนี้ไม่มีสิทธิ์ Admin");setTimeout(()=>window.location.replace("./index.html"),1000);return;}
    await loadCloudData();
    $("#loginView").classList.add("hidden");$("#dashboard").classList.remove("hidden");
    showView("places");
  }catch(e){console.error(e);$("#adminAuthStatus").textContent="ตรวจสอบ Firebase ไม่สำเร็จ";showMsg($("#loginMsg"),e.message||"เกิดข้อผิดพลาด");}
}

document.addEventListener("DOMContentLoaded",()=>{
  $("#logout")?.addEventListener("click",async()=>{await AuthService.signOut();location.href="./login.html?mode=signin";});
  $("#quickAddPlace")?.addEventListener("click",()=>showView("add-place"));$("#quickAddShop")?.addEventListener("click",()=>showView("add-shop"));
  $("#backFromPlace")?.addEventListener("click",()=>showView("places"));$("#cancelPlace")?.addEventListener("click",()=>showView("places"));$("#backFromShop")?.addEventListener("click",()=>showView("shops"));$("#cancelShop")?.addEventListener("click",()=>showView("shops"));
  $("#placeSearchAdmin")?.addEventListener("input",renderPlaceList);$("#placeForm")?.addEventListener("submit",savePlace);$("#shopForm")?.addEventListener("submit",saveShop);$("#confirmDelete")?.addEventListener("click",confirmDelete);$("#cancelDelete")?.addEventListener("click",closeDelete);
  $("#pRegion")?.addEventListener("change",()=>fillRegions($("#pRegion").value,""));
  $$(".nav").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  startAdmin();
});
