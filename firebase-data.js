(async () => {
  if (!window.FIREBASE_CONFIG?.enabled) {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
    window.dispatchEvent(new CustomEvent("cloud-data-ready"));
    return;
  }
  try {
    const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js");
    const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG.config);
    const db = getFirestore(app);
    const [placeSnap, shopSnap] = await Promise.all([
      getDocs(collection(db, "places")),
      getDocs(collection(db, "shops"))
    ]);
    const placeData = placeSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.visible !== false);
    if (placeData.length) SITE_DATA.places = placeData;
    const shopData = shopSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.visible !== false);
    if (shopData.length) window.SHOPS_DATA = shopData;
    window.dispatchEvent(new CustomEvent("places-data-updated", { detail: { count: SITE_DATA.places.length } }));
    window.dispatchEvent(new CustomEvent("shops-data-updated", { detail: { count: (window.SHOPS_DATA || []).length } }));
    window.dispatchEvent(new CustomEvent("cloud-data-ready"));
  } catch (e) {
    console.error("Firestore load failed; using bundled demo data", e);
  } finally {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
  }
})();
