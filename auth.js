/* Firebase Authentication bridge for the whole site. */
const AuthService = (() => {
  const SESSION_KEY = "travel_app_session";
  const FAVORITES_KEY = "travel_app_favorites";
  let firebasePromise = null;
  let firebaseAuth = null;
  let firebaseDb = null;

  function cachedUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }

  function cacheUser(user) {
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: user.uid || user.id,
      uid: user.uid || user.id,
      username: user.displayName || user.username || user.email || "User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      provider: user.providerData?.[0]?.providerId || user.provider || "password"
    }));
  }

  async function initFirebase() {
    if (firebasePromise) return firebasePromise;
    firebasePromise = (async () => {
      // รองรับทั้ง firebase-config.js แบบใหม่ (window.FIREBASE_CONFIG)
      // และแบบเดิมที่ประกาศ const firebaseConfig โดยตรง
      const cfg = window.FIREBASE_CONFIG || (typeof firebaseConfig !== "undefined" ? { enabled: true, config: firebaseConfig } : null);
      if (!cfg?.enabled || !cfg?.config) throw new Error("FIREBASE_NOT_CONFIGURED");
      const [{ initializeApp }, authMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js")
      ]);
      const app = initializeApp(cfg.config);
      firebaseAuth = authMod.getAuth(app);

      authMod.onAuthStateChanged(firebaseAuth, user => {
        cacheUser(user);
        window.dispatchEvent(new CustomEvent("auth-state-changed", { detail: { user } }));
      });
      return { authMod };
    })();
    return firebasePromise;
  }

  function getCurrentUser() { return cachedUser(); }

  async function signUp(email, password, displayName = "") {
    const { authMod } = await initFirebase();
    if (!email || !email.includes("@")) throw new Error("INVALID_EMAIL");
    if (password.length < 6) throw new Error("PASSWORD_TOO_SHORT");
    const cred = await authMod.createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    if (displayName.trim()) await authMod.updateProfile(cred.user, { displayName: displayName.trim() });
    cacheUser(cred.user);
    return getCurrentUser();
  }

  async function signIn(email, password) {
    const { authMod } = await initFirebase();
    if (!email || !email.includes("@")) throw new Error("INVALID_EMAIL");
    const cred = await authMod.signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    cacheUser(cred.user);
    return getCurrentUser();
  }

  async function signInWithGoogle() {
    const { authMod } = await initFirebase();
    const provider = new authMod.GoogleAuthProvider();
    const result = await authMod.signInWithPopup(firebaseAuth, provider);
    cacheUser(result.user);
    return getCurrentUser();
  }

  async function signOut() {
    try {
      await initFirebase();
      if (firebaseAuth) await firebaseAuth.signOut();
    } finally {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new CustomEvent("auth-state-changed", { detail: { user: null } }));
    }
  }

  async function isAdmin(user = getCurrentUser()) {
    if (!user) return false;
    const configured = (window.FIREBASE_CONFIG?.adminEmails || window.ADMIN_EMAILS || [])
      .map(x => String(x).trim().toLowerCase())
      .filter(Boolean);
    const email = String(user.email || '').trim().toLowerCase();
    return !!email && configured.includes(email);
  }

  function getFavoriteMap() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {}; }
    catch { return {}; }
  }
  function getFavorites() {
    const user = getCurrentUser();
    return user ? (getFavoriteMap()[user.id] || []) : [];
  }
  function isFavorite(placeId) { return getFavorites().includes(placeId); }
  function toggleFavorite(placeId) {
    const user = getCurrentUser();
    if (!user) throw new Error("LOGIN_REQUIRED");
    const map = getFavoriteMap();
    const favorites = new Set(map[user.id] || []);
    favorites.has(placeId) ? favorites.delete(placeId) : favorites.add(placeId);
    map[user.id] = [...favorites];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(map));
    return [...favorites];
  }

  async function setExternalUser(user) { cacheUser(user); return getCurrentUser(); }

  return { initFirebase, getCurrentUser, signUp, signIn, signOut, signInWithGoogle, setExternalUser, isAdmin, getFavorites, isFavorite, toggleFavorite };
})();
