
let currentLanguage = localStorage.getItem("travel_lang") || "th";
let authMode = "signin";
let currentPlaceId = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function t(key) {
  return PAGE_TEXT[currentLanguage][key] || key;
}

function localized(value) {
  if (!value) return "";
  return value[currentLanguage] ?? value.th ?? value.en ?? "";
}

function getRegionById(regionId) {
  return SITE_DATA.regions.find(r => r.id === regionId);
}

function getProvinceById(regionId, provinceId) {
  return getRegionById(regionId)?.provinces.find(p => p.id === provinceId);
}

function categoryLabel(category) {
  const m = {
    nature: currentLanguage === "th" ? "ธรรมชาติ" : "Nature",
    history: currentLanguage === "th" ? "ประวัติศาสตร์" : "History",
    activity: currentLanguage === "th" ? "ที่เที่ยว & กิจกรรม" : "Attractions & Activities"
  };
  return m[category] || category;
}

function setBaseLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("travel_lang", lang);
  document.documentElement.lang = lang;
  document.title = t("siteName");

  if ($("#siteName")) $("#siteName").textContent = t("siteName");
  if ($("#navPlaces")) $("#navPlaces").textContent = t("placesNav");
  if ($("#navFavorites")) $("#navFavorites").textContent = t("favoritesNav");
  if ($("#openSignIn")) $("#openSignIn").textContent = t("signIn");
  if ($("#openSignUp")) $("#openSignUp").textContent = t("signUp");
  if ($("#signOutButton")) $("#signOutButton").textContent = t("signOut");

  if ($("#thButton")) $("#thButton").classList.toggle("active", lang === "th");
  if ($("#enButton")) $("#enButton").classList.toggle("active", lang === "en");

  updateAuthText();
  updateAuthUI();
}

function updateAuthUI() {
  const user = AuthService.getCurrentUser();

  if ($("#guestActions")) $("#guestActions").classList.toggle("hidden", !!user);
  if ($("#userActions")) $("#userActions").classList.toggle("hidden", !user);

  $$(".auth-only").forEach(el => el.classList.toggle("hidden", !user));

  if (user && $("#currentUserName")) {
    $("#currentUserName").textContent = user.username;
  }
}

function updateAuthText() {
  if (!$("#authModal")) return;

  $("#authTitle").textContent = authMode === "signin" ? t("authTitleSignIn") : t("authTitleSignUp");
  $("#authSubtitle").textContent = authMode === "signin" ? t("authSubtitleSignIn") : t("authSubtitleSignUp");
  $("#signInTab").textContent = t("signIn");
  $("#signUpTab").textContent = t("signUp");
  $("#googleText").textContent = t("google");
  $("#facebookText").textContent = t("facebook");
  $("#orText").textContent = t("or");
  $("#usernameLabel").textContent = t("username");
  $("#passwordLabel").textContent = t("password");
  $("#confirmPasswordLabel").textContent = t("confirmPassword");
  $("#authSubmitButton").textContent = authMode === "signin" ? t("signInButton") : t("signUpButton");
  $("#authDemoNotice").textContent = t("demoNotice");

  $("#confirmPasswordWrap").classList.toggle("hidden", authMode === "signin");
  $("#signInTab").classList.toggle("active", authMode === "signin");
  $("#signUpTab").classList.toggle("active", authMode === "signup");
}

function showAuthMessage(message, type="error") {
  if (!$("#authMessage")) return;
  $("#authMessage").textContent = message;
  $("#authMessage").className = `auth-message ${type}`;
}

function openAuthModal(mode="signin") {
  window.location.href = `./login.html?mode=${mode === "signup" ? "signup" : "signin"}`;
}

function closeAuthModal() {
  $("#authModal")?.classList.remove("show");
  showAuthMessage("");
}

function getAuthErrorMessage(error) {
  const m = {
    USERNAME_TOO_SHORT: t("usernameTooShort"),
    PASSWORD_TOO_SHORT: t("passwordTooShort"),
    USERNAME_EXISTS: t("usernameExists"),
    INVALID_LOGIN: t("invalidLogin"),
    GOOGLE_NOT_CONFIGURED: t("socialNotConfigured"),
    FACEBOOK_NOT_CONFIGURED: t("socialNotConfigured")
  };
  return m[error.message] || error.message;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const username = $("#authUsername").value;
  const password = $("#authPassword").value;

  try {
    if (authMode === "signup") {
      const confirm = $("#authConfirmPassword").value;
      if (password !== confirm) {
        showAuthMessage(t("passwordMismatch"));
        return;
      }
      await AuthService.signUp(username, password);
    } else {
      await AuthService.signIn(username, password);
    }

    closeAuthModal();
    updateAuthUI();

    if (typeof renderFavorites === "function") renderFavorites();
    if (typeof renderFavoriteShops === "function") renderFavoriteShops();
    if (typeof renderPlaces === "function") renderPlaces();
    if (typeof renderRecommended === "function") renderRecommended();

  } catch (error) {
    showAuthMessage(getAuthErrorMessage(error));
  }
}

async function socialLogin(provider) {
  try {
    if (provider === "google") await AuthService.signInWithGoogle();
    else await AuthService.signInWithFacebook();

    closeAuthModal();
    updateAuthUI();
  } catch (error) {
    showAuthMessage(getAuthErrorMessage(error));
  }
}

function bindCommonEvents() {
  $("#thButton")?.addEventListener("click", () => {
    setBaseLanguage("th");
    if (typeof applyPageLanguage === "function") applyPageLanguage();
  });
  $("#enButton")?.addEventListener("click", () => {
    setBaseLanguage("en");
    if (typeof applyPageLanguage === "function") applyPageLanguage();
  });

  $("#openSignIn")?.addEventListener("click", () => { window.location.href = "./login.html?mode=signin"; });
  $("#openSignUp")?.addEventListener("click", () => { window.location.href = "./login.html?mode=signup"; });
  $("#signInTab")?.addEventListener("click", () => { authMode="signin"; showAuthMessage(""); updateAuthText(); });
  $("#signUpTab")?.addEventListener("click", () => { authMode="signup"; showAuthMessage(""); updateAuthText(); });
  $("#closeAuthModal")?.addEventListener("click", closeAuthModal);
  $("#authModal")?.addEventListener("click", e => { if (e.target.id === "authModal") closeAuthModal(); });
  $("#authForm")?.addEventListener("submit", handleAuthSubmit);
  $("#googleAuthButton")?.addEventListener("click", () => socialLogin("google"));
  $("#facebookAuthButton")?.addEventListener("click", () => socialLogin("facebook"));

  $("#signOutButton")?.addEventListener("click", async () => {
    await AuthService.signOut();
    updateAuthUI();
    if (typeof renderFavorites === "function") renderFavorites();
    if (typeof renderFavoriteShops === "function") renderFavoriteShops();
    if (typeof renderPlaces === "function") renderPlaces();
    if (typeof renderRecommended === "function") renderRecommended();
  });
}

async function initCommon() {
  bindCommonEvents();
  setBaseLanguage(currentLanguage);
  if (window.FIREBASE_CONFIG?.enabled) {
    try { await AuthService.initFirebase(); } catch (e) { console.warn("Firebase Auth unavailable", e); }
  }
  window.addEventListener("auth-state-changed", () => updateAuthUI());
}
