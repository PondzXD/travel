(async () => {
  if (!window.FIREBASE_CONFIG?.enabled) {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
    return;
  }
  try {
    const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js");
    const { getFirestore, collection, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG.config);
    const db = getFirestore(app);

    onSnapshot(collection(db, "places"), snap => {
      SITE_DATA.places = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.visible !== false);
      window.dispatchEvent(new CustomEvent("places-data-updated", {
        detail: { count: SITE_DATA.places.length }
      }));
    }, e => console.error("Places realtime sync failed", e));

    onSnapshot(collection(db, "shops"), snap => {
      window.SHOPS_DATA = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.visible !== false);
      window.dispatchEvent(new CustomEvent("shops-data-updated", {
        detail: { count: window.SHOPS_DATA.length }
      }));
    }, e => console.error("Shops realtime sync failed", e));

    window.dispatchEvent(new CustomEvent("cloud-data-ready"));
  } catch (e) {
    console.error("Firestore realtime setup failed; using bundled demo data", e);
  } finally {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
  }
})();
