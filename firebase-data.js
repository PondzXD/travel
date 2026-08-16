(async () => {
  if (!window.FIREBASE_CONFIG?.enabled) {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
    return;
  }
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js");
    const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const app = initializeApp(window.FIREBASE_CONFIG.config);
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, "places"));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.visible !== false);
    if (data.length) SITE_DATA.places = data;
    window.dispatchEvent(new CustomEvent("places-data-updated", { detail: { count: SITE_DATA.places.length } }));
  } catch (e) {
    console.error("Firestore load failed; using data.js", e);
  } finally {
    window.dispatchEvent(new CustomEvent("places-data-ready"));
  }
})();
