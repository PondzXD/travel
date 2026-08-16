

let galleryImages = [];
let galleryIndex = 0;
let galleryFallbackIcon = "📍";

function getPlaceGallery(place) {
  const list = Array.isArray(place.gallery)
    ? place.gallery.filter(Boolean)
    : [];

  if (list.length) return list;

  if (place.image) return [place.image];

  return [];
}

function showGalleryImage(index) {
  if (!$("#galleryImage")) return;

  if (!galleryImages.length) {
    $("#galleryImage").classList.add("hidden");
    $("#galleryFallback").classList.remove("hidden");
    $("#galleryFallback").textContent = galleryFallbackIcon;
    $("#galleryPrev").classList.add("hidden");
    $("#galleryNext").classList.add("hidden");
    $("#galleryCounter").textContent = "0 / 0";
    $("#galleryDots").innerHTML = "";
    return;
  }

  galleryIndex = (index + galleryImages.length) % galleryImages.length;

  const img = $("#galleryImage");
  const fallback = $("#galleryFallback");

  img.classList.remove("hidden");
  fallback.classList.add("hidden");

  img.onerror = () => {
    img.classList.add("hidden");
    fallback.classList.remove("hidden");
    fallback.textContent = galleryFallbackIcon;
  };

  img.onload = () => {
    img.classList.remove("hidden");
    fallback.classList.add("hidden");
  };

  img.src = galleryImages[galleryIndex];

  $("#galleryPrev").classList.toggle("hidden", galleryImages.length <= 1);
  $("#galleryNext").classList.toggle("hidden", galleryImages.length <= 1);
  $("#galleryCounter").textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

  $("#galleryDots").innerHTML = galleryImages
    .map((_, i) => `
      <button
        type="button"
        class="gallery-dot ${i === galleryIndex ? "active" : ""}"
        data-gallery-index="${i}"
        aria-label="Photo ${i + 1}"
      ></button>
    `)
    .join("");

  $("#galleryDots")
    .querySelectorAll("[data-gallery-index]")
    .forEach(dot => {
      dot.addEventListener("click", () => {
        showGalleryImage(Number(dot.dataset.galleryIndex));
      });
    });
}

function startPlaceGallery(place) {
  galleryImages = getPlaceGallery(place);
  galleryFallbackIcon = place.icon || "📍";
  galleryIndex = 0;
  showGalleryImage(0);
}

function createPlaceCard(place) {
  const province = getProvinceById(place.regionId, place.provinceId);
  const isFavorite = AuthService.isFavorite(place.id);

  const previewImage =
    place.image ||
    (Array.isArray(place.gallery) ? place.gallery[0] : "");

  const image = previewImage
    ? `<img
         src="${previewImage}"
         alt="${localized(place.name)}"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
       ><div class="place-fallback" style="display:none">${place.icon || "📍"}</div>`
    : `<div class="place-fallback">${place.icon || "📍"}</div>`;

  return `
    <article class="place-card" data-place-id="${place.id}">
      <div class="place-photo">${image}</div>
      <span class="place-tag">📍 ${localized(place.district)}</span>

      <button
        class="card-favorite-button ${isFavorite ? "active" : ""}"
        data-favorite-place-id="${place.id}"
        type="button"
      >${isFavorite ? "♥" : "♡"}</button>

      <div class="place-card-info">
        <h3>
          ${localized(place.name)}
          <span class="place-rating">★ ${place.rating ?? "-"}</span>
        </h3>
        <small>${localized(province?.name)} · ${categoryLabel(place.category)}</small>
      </div>
    </article>
  `;
}

function bindPlaceCards(container) {
  container.querySelectorAll("[data-place-id]").forEach(card => {
    card.addEventListener("click", () => openPlaceModal(card.dataset.placeId));
  });

  container.querySelectorAll("[data-favorite-place-id]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(button.dataset.favoritePlaceId);
    });
  });
}

function openPlaceModal(placeId) {
  const place = SITE_DATA.places.find(p => p.id === placeId);
  if (!place) return;

  currentPlaceId = placeId;
  startPlaceGallery(place);

  const province = getProvinceById(place.regionId, place.provinceId);

  $("#modalCategory").textContent = categoryLabel(place.category);
  $("#modalName").textContent = localized(place.name);
  $("#modalSub").textContent = `${localized(province?.name)} · ${localized(place.district)}`;
  $("#modalDescription").textContent = localized(place.description);
  $("#modalRating").innerHTML = `⭐ <b>${t("rating")}:</b> ${place.rating ?? "-"} · ${place.reviewCount ?? "-"}`;
  $("#modalAddress").innerHTML = `📍 <b>${t("address")}:</b> ${localized(place.address)}`;
  $("#modalHours").innerHTML = `🕒 <b>${t("hours")}:</b> ${localized(place.hours)}`;
  $("#modalPhone").innerHTML = `☎️ <b>${t("phone")}:</b> ${place.phone || "—"}`;
  $("#modalMaps").textContent = t("map");
  $("#modalMaps").href = place.mapsUrl || "#";
  $("#modalMap").src = place.embedUrl || "";

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

  const place =
    SITE_DATA.places.find(
      item => item.id === currentPlaceId
    );

  if (!place) return;

  const favorite =
    AuthService.isFavorite(currentPlaceId);

  $("#modalFavoriteButton").textContent =
    favorite ? "♥" : "♡";

  $("#modalFavoriteButton")
    .classList.toggle(
      "active",
      favorite
    );

  const reviewSummary =
    ReviewService.summary(
      "place",
      currentPlaceId
    );

  const reviewButton =
    $("#openPlaceReviews");

  if (reviewButton) {
    reviewButton.textContent =
      currentLanguage === "th"
        ? `⭐ ดูรีวิว (${reviewSummary.count})`
        : `⭐ Reviews (${reviewSummary.count})`;

    reviewButton.onclick = () => {
      window.location.href =
        `./reviews.html?type=place&id=${encodeURIComponent(currentPlaceId)}`;
    };
  }
}

function toggleFavorite(placeId) {
  if (!AuthService.getCurrentUser()) {
    openAuthModal("signin");
    showAuthMessage(t("loginToFavorite"), "info");
    return;
  }

  AuthService.toggleFavorite(placeId);

  if (typeof renderPlaces === "function") renderPlaces();
  if (typeof renderRecommended === "function") renderRecommended();
  renderFavorites();
  updateModalFavoriteButton();
}

function renderFavorites() {
  const user = AuthService.getCurrentUser();
  const section = $("#favorites");
  if (!section) return;

  if (!user) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  const ids = AuthService.getFavorites();
  const list = SITE_DATA.places.filter(p => ids.includes(p.id));
  const container = $("#favoriteGrid");

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <strong>${t("noFavorites")}</strong>
        <span>${t("noFavoritesSub")}</span>
      </div>`;
    return;
  }

  container.innerHTML = list.map(createPlaceCard).join("");
  bindPlaceCards(container);
}

function bindPlaceModalEvents() {
  $("#closeModal")?.addEventListener("click", closePlaceModal);
  $("#placeModal")?.addEventListener("click", e => {
    if (e.target.id === "placeModal") closePlaceModal();
  });
  $("#modalFavoriteButton")?.addEventListener("click", () => {
    if (currentPlaceId) toggleFavorite(currentPlaceId);
  });

  $("#galleryPrev")?.addEventListener("click", (event) => {
    event.stopPropagation();
    showGalleryImage(galleryIndex - 1);
  });

  $("#galleryNext")?.addEventListener("click", (event) => {
    event.stopPropagation();
    showGalleryImage(galleryIndex + 1);
  });
}


function getSearchMatches(keyword, limit = 8) {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];

  return SITE_DATA.places
    .filter(place => {
      const province = getProvinceById(place.regionId, place.provinceId);

      const text = [
        place.name?.th,
        place.name?.en,
        place.district?.th,
        place.district?.en,
        province?.name?.th,
        province?.name?.en,
        place.description?.th,
        place.description?.en
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    })
    .slice(0, limit);
}


function getUnifiedSearchMatches(keyword, limit = 10) {
  const q = (keyword || "").trim().toLowerCase();
  if (!q) return [];

  const placeResults = SITE_DATA.places
    .filter(place => place.visible !== false)
    .filter(place => {
      const province = getProvinceById(place.regionId, place.provinceId);
      const text = [
        localized(place.name),
        place.name?.th,
        place.name?.en,
        localized(place.district),
        localized(province?.name),
        categoryLabel(place.category)
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    })
    .map(place => ({ kind: "place", item: place }));

  const shopResults = (window.SHOPS_DATA || [])
    .filter(shop => shop.visible !== false)
    .filter(shop => {
      const text = [
        shopLocalized(shop.name),
        shop.name?.th,
        shop.name?.en,
        shopLocalized(shop.type),
        shopLocalized(shop.products),
        shopLocalized(shop.address)
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    })
    .map(shop => ({ kind: "shop", item: shop }));

  return [...placeResults, ...shopResults].slice(0, limit);
}

function unifiedSuggestionHtml(result) {
  if (result.kind === "shop") {
    const shop = result.item;
    return `
      <button class="suggestion-item" type="button"
        data-unified-kind="shop" data-unified-id="${shop.id}">
        <span class="suggestion-icon">${shop.icon || "🛍️"}</span>
        <span class="suggestion-main">
          <strong>${shopLocalized(shop.name)}</strong>
          <small>🛍️ ${currentLanguage === "th" ? "ร้านค้า" : "Shop"} · ${shopLocalized(shop.type)}</small>
        </span>
        <span class="suggestion-rating">★ ${shop.rating ?? "-"}</span>
      </button>`;
  }

  const place = result.item;
  const province = getProvinceById(place.regionId, place.provinceId);
  return `
    <button class="suggestion-item" type="button"
      data-unified-kind="place" data-unified-id="${place.id}">
      <span class="suggestion-icon">${place.icon || "📍"}</span>
      <span class="suggestion-main">
        <strong>${localized(place.name)}</strong>
        <small>📍 ${localized(province?.name)} · ${categoryLabel(place.category)}</small>
      </span>
      <span class="suggestion-rating">★ ${place.rating ?? "-"}</span>
    </button>`;
}

function bindUnifiedSuggestions(box) {
  box.querySelectorAll("[data-unified-kind]").forEach(button => {
    button.addEventListener("click", () => {
      const kind = button.dataset.unifiedKind;
      const id = button.dataset.unifiedId;

      if (kind === "shop") {
        window.location.href = `./places.html?shop=${encodeURIComponent(id)}`;
      } else {
        window.location.href = `./places.html?place=${encodeURIComponent(id)}`;
      }
    });
  });
}

function hideHeroSuggestions() {
  $("#heroSuggestions")?.classList.add("hidden");
}

function renderHeroSuggestions(keyword) {
  const box = $("#heroSuggestions");
  if (!box) return;

  const matches = getUnifiedSearchMatches(keyword);

  if (!keyword.trim() || !matches.length) {
    hideHeroSuggestions();
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `
    <div class="suggestion-heading">${t("searchSuggestionTitle")}</div>
    ${matches.map(unifiedSuggestionHtml).join("")}
  `;

  box.classList.remove("hidden");
  bindUnifiedSuggestions(box);
}


function applyPageLanguage() {
  $("#heroKicker").textContent = t("homeKicker");
  $("#heroTitle").innerHTML = t("homeTitle");
  $("#heroAccent").textContent = t("homeAccent");
  $("#heroDescription").textContent = t("homeDescription");
  $("#heroSearchInput").placeholder = t("searchPlaceholder");
  $("#heroSearchButton").textContent = t("searchButton");

  $("#recommendedTitle").textContent = t("recommendedTitle");
  $("#recommendedSub").textContent = t("recommendedSub");
  $("#viewAllPlaces").textContent = t("viewAll");

  if ($("#favoritesTitle")) $("#favoritesTitle").textContent = t("favoritesTitle");
  if ($("#favoritesSub")) $("#favoritesSub").textContent = t("favoritesSub");
  $("#footerText").textContent = t("siteName") + " • Demo";

  renderRecommended();
  renderFavorites();
}

function renderRecommended() {
  const featured = SITE_DATA.places.filter(place => place.featured === true);

  const fallbackIds = [
    "thale-noi",
    "khao-pu-khao-ya",
    "wat-khuha-sawan",
    "lad-tainod"
  ];

  const fallback = fallbackIds
    .map(id => SITE_DATA.places.find(place => place.id === id))
    .filter(Boolean);

  const list = featured.length ? featured.slice(0, 4) : fallback.slice(0, 4);

  const container = $("#recommendedGrid");
  container.innerHTML = list.map(createPlaceCard).join("");
  bindPlaceCards(container);
}

function goToSearch() {
  const q = $("#heroSearchInput").value.trim();
  const url = q
    ? `./places.html?q=${encodeURIComponent(q)}`
    : "./places.html";
  window.location.href = url;
}

document.addEventListener("DOMContentLoaded", () => {
  initCommon();
  bindPlaceModalEvents();

  $("#heroSearchButton").addEventListener("click", goToSearch);

  $("#heroSearchInput").addEventListener("input", e => {
    renderHeroSuggestions(e.target.value);
  });

  $("#heroSearchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      hideHeroSuggestions();
      goToSearch();
    }

    if (e.key === "Escape") {
      hideHeroSuggestions();
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-autocomplete-wrap")) {
      hideHeroSuggestions();
    }
  });

  applyPageLanguage();
});


window.addEventListener("places-data-updated", () => {
  if (typeof applyPageLanguage === "function") applyPageLanguage();
});
