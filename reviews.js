/* Shared Review Service - Firestore, so reviews are visible to everyone. */
const ReviewService = (() => {
  const COLLECTION = "reviews";
  let db = null;
  let ready = false;
  let reviewsCache = [];

  async function init() {
    if (ready) return;
    if (!window.FIREBASE_CONFIG?.enabled) throw new Error("FIREBASE_NOT_CONFIGURED");
    const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js");
    const { getFirestore, collection, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const app = getApps().length ? getApp() : initializeApp(window.FIREBASE_CONFIG.config);
    db = getFirestore(app);
    onSnapshot(collection(db, COLLECTION), snap => {
      reviewsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      window.dispatchEvent(new CustomEvent("reviews-data-updated"));
    }, error => console.error("Review realtime sync failed", error));
    ready = true;
  }

  function all() { return [...reviewsCache]; }

  function get(targetType, targetId) {
    return all().filter(review => review.targetType === targetType && review.targetId === targetId);
  }

  function findMine(targetType, targetId) {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    return all().find(review => review.targetType === targetType && review.targetId === targetId && review.userId === user.id) || null;
  }

  async function add({ targetType, targetId, rating, text }) {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error("LOGIN_REQUIRED");

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error("INVALID_RATING");
    }

    await init();
    const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const existing = findMine(targetType, targetId);
    const now = new Date().toISOString();
    const id = existing?.id || `review_${targetType}_${targetId}_${user.id}`;

    const review = {
      id,
      targetType,
      targetId,
      userId: user.id,
      username: user.username || user.email || "User",
      rating: numericRating,
      text: String(text || "").trim(),
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    await setDoc(doc(db, COLLECTION, id), review, { merge: true });
    return review;
  }

  function summary(targetType, targetId) {
    const list = get(targetType, targetId);
    if (!list.length) return { average: null, count: 0 };
    const average = list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / list.length;
    return { average: Number(average.toFixed(1)), count: list.length };
  }

  // Start the realtime listener as early as possible. UI can render from cache and refresh on event.
  init().catch(error => console.error("Review service init failed", error));

  return { init, all, get, findMine, add, summary };
})();
