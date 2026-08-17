/* Free-plan image patch: Firestore only, no Firebase Storage/Blaze required. */
(() => {
  const FIRESTORE = "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
  const FIREBASE = "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  let freeDb = null;
  let freeReady = false;

  async function freeInit() {
    if (freeReady) return;
    const { initializeApp, getApps, getApp } = await import(FIREBASE);
    const { getFirestore } = await import(FIRESTORE);
    const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG.config);
    freeDb = getFirestore(app);
    cloudDb = freeDb;
    freeReady = true;
  }

  window.initCloudPersistence = async function () { await freeInit(); };

  function compress(file, maxBytes = 45000, maxSide = 1200) {
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
          const draw = () => { ctx.clearRect(0,0,w,h); ctx.drawImage(img,0,0,w,h); data = canvas.toDataURL("image/jpeg", q); };
          draw();
          for (let i=0; i<8 && data.length*0.75 > maxBytes; i++) { q=Math.max(.25,q-.07); draw(); }
          let n=0;
          while (data.length*0.75 > maxBytes && n<4) { w=Math.max(240,Math.round(w*.8)); h=Math.max(240,Math.round(h*.8)); canvas.width=w; canvas.height=h; q=.55; draw(); n++; }
          resolve(data);
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  window.fileToDataURL = compress;
  window.uploadFile = async function (file) { return compress(file); };
  window.uploadDataUrl = async function (dataUrl) { return dataUrl; };
  window.uploadGalleryFiles = async function (files, pathPrefix, existing=[]) {
    const result = [...existing].filter(Boolean);
    for (const file of files || []) { if (result.length >= 8) break; result.push(await compress(file)); }
    return result.slice(0,8);
  };

  window.saveCloudDoc = async function (collectionName, id, data) {
    await freeInit();
    const { doc, setDoc } = await import(FIRESTORE);
    const imageStrings = [];
    const add = v => { if (typeof v === "string" && v.startsWith("data:image")) imageStrings.push(v); };
    add(data.image); (data.gallery || []).forEach(add); (data.productItems || []).forEach(p => add(p.image));
    const bytes = imageStrings.reduce((n,v) => n + Math.round(v.length*.75), 0);
    if (bytes > 760000) throw new Error("รูปทั้งหมดใหญ่เกินไปสำหรับ Firebase ฟรี กรุณาลดจำนวนรูปลง");
    await setDoc(doc(freeDb, collectionName, id), data, { merge:true });
  };
})();
