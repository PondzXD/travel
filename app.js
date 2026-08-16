/*
=========================================================
ระบบหน้าเว็บ
=========================================================
*/

let currentLanguage = "th";
let selectedRegionId = "south";
let selectedProvinceId = "phatthalung";
let selectedCategory = "all";
let searchKeyword = "";
let currentPlaceId = null;
let authMode = "signin";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const UI_TEXT = {
  th: {
    siteName: "แนะนำสถานที่ท่องเที่ยวร้านค้าและสินค้า",
    places: "สถานที่",
    favorites: "รายการโปรด",

    signIn: "เข้าสู่ระบบ",
    signUp: "สมัครสมาชิก",
    signOut: "ออกจากระบบ",

    heroKicker: "EXPLORE THAILAND",
    heroTitle: "ค้นหาสถานที่<br>ร้านค้า และสินค้า",
    heroAccent: "ทั่วประเทศไทย",
    heroDescription:
      "ค้นหาสถานที่ท่องเที่ยว ร้านค้า และสินค้า เลือกตามภาค จังหวัด และหมวดหมู่ พร้อมดูรายละเอียดได้โดยไม่จำเป็นต้องเข้าสู่ระบบ",

    searchPlaceholder:
      "ค้นหาชื่อสถานที่ จังหวัด หรือหมวดหมู่...",
    searchButton: "ค้นหา",

    chooseRegion: "เลือกภาค",
    chooseRegionSub:
      "เลือกภาคและจังหวัดเพื่อดูสถานที่ที่สนใจ",
    chooseProvince: "เลือกจังหวัด",

    placesTitle: "สถานที่",
    placesSub:
      "รายละเอียดสถานที่สามารถดูได้โดยไม่ต้องเข้าสู่ระบบ",

    favoritesTitle: "รายการโปรด",
    favoritesSub:
      "สถานที่ที่คุณบันทึกไว้",

    categoryAll: "ทั้งหมด",
    categoryNature: "ธรรมชาติ",
    categoryHistory: "ประวัติศาสตร์",
    categoryActivity: "ที่เที่ยว & กิจกรรม",

    noData: "ยังไม่มีข้อมูลในส่วนนี้",
    noDataSub: "สามารถเพิ่มข้อมูลใหม่ได้ที่ data.js",

    noFavorites: "ยังไม่มีรายการโปรด",
    noFavoritesSub:
      "กด ♡ บนสถานที่ที่ชอบเพื่อบันทึกไว้ที่นี่",

    address: "ที่อยู่",
    hours: "เวลา",
    phone: "โทร",
    rating: "คะแนน",
    map: "เปิด Google Maps",

    addFavorite: "เพิ่มในรายการโปรด",
    removeFavorite: "นำออกจากรายการโปรด",
    loginToFavorite:
      "กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด",

    authTitleSignIn: "เข้าสู่ระบบ",
    authTitleSignUp: "สร้างบัญชีใหม่",
    authSubtitleSignIn:
      "เข้าสู่ระบบเพื่อบันทึกรายการโปรดของคุณ",
    authSubtitleSignUp:
      "สมัครสมาชิกเพื่อใช้งานรายการโปรด",

    google: "ดำเนินการต่อด้วย Google",
    facebook: "ดำเนินการต่อด้วย Facebook",
    or: "หรือ",

    username: "Username",
    password: "Password",
    confirmPassword: "ยืนยัน Password",

    signInButton: "เข้าสู่ระบบ",
    signUpButton: "สร้างบัญชี",

    demoNotice:
      "Username/Password ใช้งานได้ในโหมด Demo บนอุปกรณ์นี้ ส่วน Google และ Facebook ต้องตั้งค่า Firebase/OAuth ก่อนใช้งานจริง",

    usernameTooShort:
      "Username ต้องมีอย่างน้อย 3 ตัวอักษร",
    passwordTooShort:
      "Password ต้องมีอย่างน้อย 6 ตัวอักษร",
    usernameExists:
      "Username นี้ถูกใช้งานแล้ว",
    invalidLogin:
      "Username หรือ Password ไม่ถูกต้อง",
    passwordMismatch:
      "Password และยืนยัน Password ไม่ตรงกัน",
    socialNotConfigured:
      "ยังไม่ได้ตั้งค่า Firebase/OAuth สำหรับช่องทางนี้",
  },

  en: {
    siteName: "Travel, Shop & Product Recommendations",
    places: "Places",
    favorites: "Favorites",

    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",

    heroKicker: "EXPLORE THAILAND",
    heroTitle: "Discover Places,<br>Shops & Products",
    heroAccent: "Across Thailand",
    heroDescription:
      "Explore destinations, shops, and products by region, province, and category. Place details remain available without signing in.",

    searchPlaceholder:
      "Search place, province, or category...",
    searchButton: "Search",

    chooseRegion: "Choose Region",
    chooseRegionSub:
      "Choose a region and province to explore.",
    chooseProvince: "Choose Province",

    placesTitle: "Places",
    placesSub:
      "Place details are available without signing in.",

    favoritesTitle: "Favorites",
    favoritesSub:
      "Places saved to your account.",

    categoryAll: "All",
    categoryNature: "Nature",
    categoryHistory: "History",
    categoryActivity: "Attractions & Activities",

    noData: "No data available yet.",
    noDataSub: "Add new data in data.js",

    noFavorites: "No favorites yet.",
    noFavoritesSub:
      "Tap ♡ on a place to save it here.",

    address: "Address",
    hours: "Hours",
    phone: "Phone",
    rating: "Rating",
    map: "Open Google Maps",

    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",
    loginToFavorite:
      "Please sign in before adding favorites.",

    authTitleSignIn: "Sign in",
    authTitleSignUp: "Create an account",
    authSubtitleSignIn:
      "Sign in to save your favorite places.",
    authSubtitleSignUp:
      "Create an account to use favorites.",

    google: "Continue with Google",
    facebook: "Continue with Facebook",
    or: "or",

    username: "Username",
    password: "Password",
    confirmPassword: "Confirm password",

    signInButton: "Sign in",
    signUpButton: "Create account",

    demoNotice:
      "Username/password works as a local demo on this device. Google and Facebook require Firebase/OAuth configuration.",

    usernameTooShort:
      "Username must contain at least 3 characters.",
    passwordTooShort:
      "Password must contain at least 6 characters.",
    usernameExists:
      "This username is already in use.",
    invalidLogin:
      "Incorrect username or password.",
    passwordMismatch:
      "Passwords do not match.",
    socialNotConfigured:
      "Firebase/OAuth has not been configured for this provider.",
  },
};

function t(key) {
  return UI_TEXT[currentLanguage][key] || key;
}

function localized(value) {
  if (!value) return "";

  return (
    value[currentLanguage] ??
    value.th ??
    value.en ??
    ""
  );
}

function getRegionById(regionId) {
  return SITE_DATA.regions.find(
    (region) => region.id === regionId
  );
}

function getProvinceById(regionId, provinceId) {
  return getRegionById(regionId)?.provinces.find(
    (province) => province.id === provinceId
  );
}

function categoryLabel(category) {
  const values = {
    nature:
      currentLanguage === "th"
        ? "ธรรมชาติ"
        : "Nature",

    history:
      currentLanguage === "th"
        ? "ประวัติศาสตร์"
        : "History",

    activity:
      currentLanguage === "th"
        ? "ที่เที่ยว & กิจกรรม"
        : "Attractions & Activities",
  };

  return values[category] || category;
}


/* ======================================================
   LANGUAGE
====================================================== */

function setLanguage(language) {
  currentLanguage = language;

  document.documentElement.lang = language;
  document.title = t("siteName");

  $("#siteName").textContent = t("siteName");

  $("#navPlaces").textContent = t("places");
  $("#navFavorites").textContent = t("favorites");

  $("#openSignIn").textContent = t("signIn");
  $("#openSignUp").textContent = t("signUp");
  $("#signOutButton").textContent = t("signOut");

  $("#heroKicker").textContent = t("heroKicker");
  $("#heroTitle").innerHTML = t("heroTitle");
  $("#heroAccent").textContent = t("heroAccent");
  $("#heroDescription").textContent =
    t("heroDescription");

  $("#heroSearchInput").placeholder =
    t("searchPlaceholder");

  $("#heroSearchButton").textContent =
    t("searchButton");

  $("#placeSearch").placeholder =
    t("searchPlaceholder");

  $("#chooseRegionTitle").textContent =
    t("chooseRegion");

  $("#chooseRegionSub").textContent =
    t("chooseRegionSub");

  $("#chooseProvinceTitle").textContent =
    t("chooseProvince");

  $("#placesTitle").textContent =
    t("placesTitle");

  $("#placesSub").textContent =
    t("placesSub");

  $("#favoritesTitle").textContent =
    t("favoritesTitle");

  $("#favoritesSub").textContent =
    t("favoritesSub");

  $("#filterAll").textContent =
    t("categoryAll");

  $("#filterNature").textContent =
    t("categoryNature");

  $("#filterHistory").textContent =
    t("categoryHistory");

  $("#filterActivity").textContent =
    t("categoryActivity");

  $("#footerText").textContent =
    t("siteName") + " • Demo";

  $("#thButton").classList.toggle(
    "active",
    language === "th"
  );

  $("#enButton").classList.toggle(
    "active",
    language === "en"
  );

  updateAuthText();
  renderRegions();
  renderProvinces();
  renderPlaces();
  renderFavorites();
  updateAuthUI();
}


/* ======================================================
   REGION / PROVINCE
====================================================== */

function renderRegions() {
  $("#regionGrid").innerHTML =
    SITE_DATA.regions
      .map((region) => {
        return `
          <button
            class="region-card ${
              region.id === selectedRegionId
                ? "active"
                : ""
            }"
            data-region-id="${region.id}"
          >
            <span class="region-icon">
              ${region.icon}
            </span>

            <span>
              <strong>
                ${localized(region.name)}
              </strong>

              <small>
                ${region.provinces.length}
                ${
                  currentLanguage === "th"
                    ? "จังหวัด"
                    : " provinces"
                }
              </small>
            </span>

            <span class="region-arrow">›</span>
          </button>
        `;
      })
      .join("");

  $$("[data-region-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRegionId =
        button.dataset.regionId;

      selectedProvinceId =
        getRegionById(
          selectedRegionId
        )?.provinces[0]?.id || "";

      searchKeyword = "";

      $("#placeSearch").value = "";
      $("#heroSearchInput").value = "";

      renderRegions();
      renderProvinces();
      renderPlaces();
    });
  });
}

function renderProvinces() {
  const region =
    getRegionById(selectedRegionId);

  if (!region) return;

  $("#provinceList").innerHTML =
    region.provinces
      .map((province) => {
        return `
          <button
            class="province-pill ${
              province.id === selectedProvinceId
                ? "active"
                : ""
            }"
            data-province-id="${province.id}"
          >
            ${localized(province.name)}
          </button>
        `;
      })
      .join("");

  $$("[data-province-id]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        selectedProvinceId =
          button.dataset.provinceId;

        searchKeyword = "";
        $("#placeSearch").value = "";
        $("#heroSearchInput").value = "";

        renderProvinces();
        renderPlaces();
      });
    }
  );
}


/* ======================================================
   PLACE FILTER
====================================================== */

function getFilteredPlaces() {
  const keyword =
    searchKeyword.trim().toLowerCase();

  return SITE_DATA.places.filter((place) => {
    const matchRegion =
      place.regionId === selectedRegionId;

    const matchProvince = keyword
      ? true
      : place.provinceId ===
        selectedProvinceId;

    const matchCategory =
      selectedCategory === "all" ||
      place.category === selectedCategory;

    const province =
      getProvinceById(
        place.regionId,
        place.provinceId
      );

    const searchableText = [
      place.name?.th,
      place.name?.en,
      place.district?.th,
      place.district?.en,
      place.description?.th,
      place.description?.en,
      province?.name?.th,
      province?.name?.en,
      place.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch =
      !keyword ||
      searchableText.includes(keyword);

    return (
      matchRegion &&
      matchProvince &&
      matchCategory &&
      matchSearch
    );
  });
}

function createPlaceCard(place) {
  const province =
    getProvinceById(
      place.regionId,
      place.provinceId
    );

  const isFavorite =
    AuthService.isFavorite(place.id);

  const image = place.image
    ? `
      <img
        src="${place.image}"
        alt="${localized(place.name)}"
      >
    `
    : `
      <div class="place-fallback">
        ${place.icon || "📍"}
      </div>
    `;

  return `
    <article
      class="place-card"
      data-place-id="${place.id}"
    >

      <div class="place-photo">
        ${image}
      </div>

      <span class="place-tag">
        📍 ${localized(place.district)}
      </span>

      <button
        class="card-favorite-button ${
          isFavorite ? "active" : ""
        }"
        data-favorite-place-id="${place.id}"
        type="button"
        title="Favorite"
      >
        ${isFavorite ? "♥" : "♡"}
      </button>

      <div class="place-card-info">

        <h3>
          ${localized(place.name)}

          <span class="place-rating">
            ★ ${place.rating ?? "-"}
          </span>
        </h3>

        <small>
          ${localized(province?.name)}
          ·
          ${categoryLabel(place.category)}
        </small>

      </div>

    </article>
  `;
}

function bindPlaceCards(container) {
  container
    .querySelectorAll("[data-place-id]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        openPlaceModal(
          card.dataset.placeId
        );
      });
    });

  container
    .querySelectorAll(
      "[data-favorite-place-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          toggleFavorite(
            button.dataset.favoritePlaceId
          );
        }
      );
    });
}

function renderPlaces() {
  const places = getFilteredPlaces();

  const container = $("#placeGrid");

  if (!places.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧭</div>
        <strong>${t("noData")}</strong>
        <span>${t("noDataSub")}</span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    places.map(createPlaceCard).join("");

  bindPlaceCards(container);
}


/* ======================================================
   DETAILS
====================================================== */

function openPlaceModal(placeId) {
  const place = SITE_DATA.places.find(
    (item) => item.id === placeId
  );

  if (!place) return;

  currentPlaceId = placeId;

  const province =
    getProvinceById(
      place.regionId,
      place.provinceId
    );

  $("#modalCategory").textContent =
    categoryLabel(place.category);

  $("#modalName").textContent =
    localized(place.name);

  $("#modalSub").textContent =
    `${localized(province?.name)} · ` +
    `${localized(place.district)}`;

  $("#modalDescription").textContent =
    localized(place.description);

  $("#modalRating").innerHTML = `
    ⭐ <b>${t("rating")}:</b>
    ${place.rating ?? "-"}
    ·
    ${place.reviewCount ?? "-"}
  `;

  $("#modalAddress").innerHTML = `
    📍 <b>${t("address")}:</b>
    ${localized(place.address)}
  `;

  $("#modalHours").innerHTML = `
    🕒 <b>${t("hours")}:</b>
    ${localized(place.hours)}
  `;

  $("#modalPhone").innerHTML = `
    ☎️ <b>${t("phone")}:</b>
    ${place.phone || "—"}
  `;

  $("#modalMaps").textContent =
    t("map");

  $("#modalMaps").href =
    place.mapsUrl || "#";

  $("#modalMap").src =
    place.embedUrl || "";

  updateModalFavoriteButton();

  $("#placeModal").classList.add("show");
}

function closePlaceModal() {
  $("#placeModal").classList.remove("show");
  $("#modalMap").src = "";
  currentPlaceId = null;
}

function updateModalFavoriteButton() {
  if (!currentPlaceId) return;

  const button =
    $("#modalFavoriteButton");

  const favorite =
    AuthService.isFavorite(
      currentPlaceId
    );

  button.textContent =
    favorite ? "♥" : "♡";

  button.classList.toggle(
    "active",
    favorite
  );

  button.title =
    favorite
      ? t("removeFavorite")
      : t("addFavorite");
}


/* ======================================================
   FAVORITES
====================================================== */

function toggleFavorite(placeId) {
  if (!AuthService.getCurrentUser()) {
    openAuthModal("signin");
    showAuthMessage(
      t("loginToFavorite"),
      "info"
    );
    return;
  }

  AuthService.toggleFavorite(placeId);

  renderPlaces();
  renderFavorites();
  updateModalFavoriteButton();
}

function renderFavorites() {
  const user =
    AuthService.getCurrentUser();

  const section =
    $("#favorites");

  if (!user) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  const favoriteIds =
    AuthService.getFavorites();

  const favoritePlaces =
    SITE_DATA.places.filter((place) =>
      favoriteIds.includes(place.id)
    );

  const container =
    $("#favoriteGrid");

  if (!favoritePlaces.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <strong>${t("noFavorites")}</strong>
        <span>${t("noFavoritesSub")}</span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    favoritePlaces
      .map(createPlaceCard)
      .join("");

  bindPlaceCards(container);
}


/* ======================================================
   AUTH UI
====================================================== */

function updateAuthUI() {
  const user =
    AuthService.getCurrentUser();

  $(".auth-only")?.classList.toggle(
    "hidden",
    !user
  );

  $$(".auth-only").forEach((element) => {
    element.classList.toggle(
      "hidden",
      !user
    );
  });

  $("#guestActions").classList.toggle(
    "hidden",
    !!user
  );

  $("#userActions").classList.toggle(
    "hidden",
    !user
  );

  if (user) {
    $("#currentUserName").textContent =
      user.username;

    renderFavorites();
  }
}

function updateAuthText() {
  $("#authTitle").textContent =
    authMode === "signin"
      ? t("authTitleSignIn")
      : t("authTitleSignUp");

  $("#authSubtitle").textContent =
    authMode === "signin"
      ? t("authSubtitleSignIn")
      : t("authSubtitleSignUp");

  $("#signInTab").textContent =
    t("signIn");

  $("#signUpTab").textContent =
    t("signUp");

  $("#googleText").textContent =
    t("google");

  $("#facebookText").textContent =
    t("facebook");

  $("#orText").textContent =
    t("or");

  $("#usernameLabel").textContent =
    t("username");

  $("#passwordLabel").textContent =
    t("password");

  $("#confirmPasswordLabel").textContent =
    t("confirmPassword");

  $("#authSubmitButton").textContent =
    authMode === "signin"
      ? t("signInButton")
      : t("signUpButton");

  $("#authDemoNotice").textContent =
    t("demoNotice");

  $("#confirmPasswordWrap")
    .classList.toggle(
      "hidden",
      authMode === "signin"
    );

  $("#signInTab").classList.toggle(
    "active",
    authMode === "signin"
  );

  $("#signUpTab").classList.toggle(
    "active",
    authMode === "signup"
  );
}

function openAuthModal(mode = "signin") {
  authMode = mode;

  $("#authForm").reset();
  showAuthMessage("");

  updateAuthText();

  $("#authModal").classList.add("show");
}

function closeAuthModal() {
  $("#authModal").classList.remove("show");
  showAuthMessage("");
}

function showAuthMessage(
  message,
  type = "error"
) {
  const element =
    $("#authMessage");

  element.textContent = message;
  element.className =
    `auth-message ${type}`;
}

function getAuthErrorMessage(error) {
  const map = {
    USERNAME_TOO_SHORT:
      t("usernameTooShort"),

    PASSWORD_TOO_SHORT:
      t("passwordTooShort"),

    USERNAME_EXISTS:
      t("usernameExists"),

    INVALID_LOGIN:
      t("invalidLogin"),

    GOOGLE_NOT_CONFIGURED:
      t("socialNotConfigured"),

    FACEBOOK_NOT_CONFIGURED:
      t("socialNotConfigured"),
  };

  return (
    map[error.message] ||
    error.message
  );
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const username =
    $("#authUsername").value;

  const password =
    $("#authPassword").value;

  try {
    if (authMode === "signup") {
      const confirmPassword =
        $("#authConfirmPassword").value;

      if (password !== confirmPassword) {
        showAuthMessage(
          t("passwordMismatch")
        );
        return;
      }

      AuthService.signUp(
        username,
        password
      );
    } else {
      AuthService.signIn(
        username,
        password
      );
    }

    closeAuthModal();
    updateAuthUI();
    renderPlaces();
    renderFavorites();

  } catch (error) {
    showAuthMessage(
      getAuthErrorMessage(error)
    );
  }
}

async function socialLogin(provider) {
  try {
    if (provider === "google") {
      await AuthService.signInWithGoogle();
    } else {
      await AuthService.signInWithFacebook();
    }

    closeAuthModal();
    updateAuthUI();
  } catch (error) {
    showAuthMessage(
      getAuthErrorMessage(error)
    );
  }
}


/* ======================================================
   SEARCH
====================================================== */

function runSearch(keyword) {
  searchKeyword = keyword;

  $("#placeSearch").value =
    keyword;

  $("#heroSearchInput").value =
    keyword;

  renderPlaces();

  $("#places").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}


/* ======================================================
   EVENTS
====================================================== */

function bindEvents() {
  $("#thButton").addEventListener(
    "click",
    () => setLanguage("th")
  );

  $("#enButton").addEventListener(
    "click",
    () => setLanguage("en")
  );

  $("#heroSearchButton").addEventListener(
    "click",
    () =>
      runSearch(
        $("#heroSearchInput").value
      )
  );

  $("#heroSearchInput").addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        runSearch(
          event.target.value
        );
      }
    }
  );

  $("#placeSearch").addEventListener(
    "input",
    (event) => {
      searchKeyword =
        event.target.value;

      renderPlaces();
    }
  );

  $("#clearSearch").addEventListener(
    "click",
    () => {
      searchKeyword = "";

      $("#placeSearch").value = "";
      $("#heroSearchInput").value = "";

      renderPlaces();
    }
  );

  $$(".filter-button").forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          $$(".filter-button")
            .forEach((item) =>
              item.classList.remove(
                "active"
              )
            );

          button.classList.add(
            "active"
          );

          selectedCategory =
            button.dataset.category;

          renderPlaces();
        }
      );
    }
  );

  $("#placeModal").addEventListener(
    "click",
    (event) => {
      if (
        event.target.id ===
        "placeModal"
      ) {
        closePlaceModal();
      }
    }
  );

  $("#closeModal").addEventListener(
    "click",
    closePlaceModal
  );

  $("#modalFavoriteButton")
    .addEventListener(
      "click",
      () => {
        if (currentPlaceId) {
          toggleFavorite(
            currentPlaceId
          );
        }
      }
    );


  // AUTH

  $("#openSignIn").addEventListener(
    "click",
    () => openAuthModal("signin")
  );

  $("#openSignUp").addEventListener(
    "click",
    () => openAuthModal("signup")
  );

  $("#signInTab").addEventListener(
    "click",
    () => {
      authMode = "signin";
      showAuthMessage("");
      updateAuthText();
    }
  );

  $("#signUpTab").addEventListener(
    "click",
    () => {
      authMode = "signup";
      showAuthMessage("");
      updateAuthText();
    }
  );

  $("#closeAuthModal")
    .addEventListener(
      "click",
      closeAuthModal
    );

  $("#authModal").addEventListener(
    "click",
    (event) => {
      if (
        event.target.id ===
        "authModal"
      ) {
        closeAuthModal();
      }
    }
  );

  $("#authForm").addEventListener(
    "submit",
    handleAuthSubmit
  );

  $("#googleAuthButton")
    .addEventListener(
      "click",
      () =>
        socialLogin("google")
    );

  $("#facebookAuthButton")
    .addEventListener(
      "click",
      () =>
        socialLogin("facebook")
    );

  $("#signOutButton")
    .addEventListener(
      "click",
      () => {
        AuthService.signOut();

        updateAuthUI();
        renderPlaces();

        document
          .getElementById("places")
          .scrollIntoView({
            behavior: "smooth",
          });
      }
    );
}


/* ======================================================
   START
====================================================== */

function startApp() {
  bindEvents();
  setLanguage("th");
  updateAuthUI();
}

document.addEventListener(
  "DOMContentLoaded",
  startApp
);
