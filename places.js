

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

  container.innerHTML = list
    .map(place => {
      let card = createPlaceCard(place);

      if (selectedCategory === "reviews") {
        card = card.replace(
          "</article>",
          `
            <div class="review-summary">
              <span>⭐ ${place.rating ?? "-"}</span>
              <span>💬 ${place.reviewCount ?? "0"} ${t("reviewCountLabel")}</span>
            </div>
          </article>`
        );
      }

      if (selectedCategory === "nearby" && Number.isFinite(place._distanceKm)) {
        const distance = place._distanceKm < 1
          ? `${Math.round(place._distanceKm * 1000)} m`
          : `${place._distanceKm.toFixed(1)} km`;

        card = card.replace(
          "</article>",
          `<div class="nearby-distance">📍 ${distance} ${t("distanceLabel")}</div></article>`
        );
      }

      return card;
    })
    .join("");

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

let selectedRegionId = "south";
let selectedProvinceId = "phatthalung";
let selectedCategory = "all";
let searchKeyword = "";
let userLocation = null;

function applyPageLanguage() {
  $("#chooseRegionTitle").textContent = t("chooseRegion");
  $("#chooseRegionSub").textContent = t("chooseRegionSub");
  $("#chooseProvinceTitle").textContent = t("chooseProvince");
  $("#placesTitle").textContent = t("placeTitle");
  $("#placesSub").textContent = t("placeSub");

  $("#placeSearch").placeholder = t("searchPlaceholder");

  $("#filterAll").textContent = t("categoryAll");
  $("#filterNature").textContent = t("categoryNature");
  $("#filterHistory").textContent = t("categoryHistory");
  $("#filterActivity").textContent = t("categoryActivity");
  $("#filterReviews").textContent = t("categoryReviews");
  $("#nearMeText").textContent = t("categoryNearMe");

  if ($("#favoritesTitle")) $("#favoritesTitle").textContent = t("favoritesTitle");
  if ($("#favoritesSub")) $("#favoritesSub").textContent = t("favoritesSub");
  $("#footerText").textContent = t("siteName") + " • Demo";

  renderRegions();
  renderProvinces();
  renderPlaces();
  renderFavorites();
}

function renderRegions() {
  $("#regionGrid").innerHTML = SITE_DATA.regions.map(region => `
    <button
      class="region-card ${region.id === selectedRegionId ? "active" : ""}"
      data-region-id="${region.id}"
    >
      <span class="region-icon">${region.icon}</span>
      <span>
        <strong>${localized(region.name)}</strong>
        <small>${region.provinces.length} ${currentLanguage === "th" ? "จังหวัด" : "provinces"}</small>
      </span>
      <span class="region-arrow">›</span>
    </button>
  `).join("");

  $$("[data-region-id]").forEach(button => {
    button.addEventListener("click", () => {
      selectedRegionId = button.dataset.regionId;
      selectedProvinceId = getRegionById(selectedRegionId)?.provinces[0]?.id || "";
      searchKeyword = "";
      $("#placeSearch").value = "";
      renderRegions();
      renderProvinces();
      renderPlaces();
    });
  });
}

function renderProvinces() {
  const region = getRegionById(selectedRegionId);
  if (!region) return;

  $("#provinceList").innerHTML = region.provinces.map(province => `
    <button
      class="province-pill ${province.id === selectedProvinceId ? "active" : ""}"
      data-province-id="${province.id}"
    >${localized(province.name)}</button>
  `).join("");

  $$("[data-province-id]").forEach(button => {
    button.addEventListener("click", () => {
      selectedProvinceId = button.dataset.provinceId;
      searchKeyword = "";
      $("#placeSearch").value = "";
      renderProvinces();
      renderPlaces();
    });
  });
}


function getPlaceCoordinates(place) {
  // รองรับข้อมูลแบบ lat/lng หรือ latitude/longitude
  const lat = Number(place.lat ?? place.latitude);
  const lng = Number(place.lng ?? place.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function distanceKm(a, b) {
  const R = 6371;
  const rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function requestNearMe() {
  if (!navigator.geolocation) {
    alert(t("nearMeUnavailable"));
    return;
  }

  const button = $("#filterNearMe");
  if (button) button.classList.add("loading");

  navigator.geolocation.getCurrentPosition(
    position => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      selectedCategory = "nearby";
      searchKeyword = "";
      $("#placeSearch").value = "";
      $$(".filter-button").forEach(b => b.classList.remove("active"));
      $("#filterNearMe").classList.add("active");
      $("#filterNearMe").classList.remove("loading");
      renderPlaces();
    },
    () => {
      if (button) button.classList.remove("loading");
      alert(t("nearMePermission"));
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

function getFilteredPlaces() {
  const q = searchKeyword.trim().toLowerCase();

  let result = SITE_DATA.places.filter(place => {
    // ตอนค้นหา ให้ค้นหาทั่วทุกภาค/ทุกจังหวัด
    // ถ้าไม่ได้ค้นหา จึงกรองตามภาคและจังหวัดที่เลือก
    const regionOk = q
      ? true
      : place.regionId === selectedRegionId;

    const provinceOk = q
      ? true
      : place.provinceId === selectedProvinceId;

    const categoryOk =
      selectedCategory === "all" ||
      selectedCategory === "reviews" ||
      selectedCategory === "nearby" ||
      place.category === selectedCategory;

    const province =
      getProvinceById(
        place.regionId,
        place.provinceId
      );

    const hay = [
      place.name?.th,
      place.name?.en,
      place.district?.th,
      place.district?.en,
      place.description?.th,
      place.description?.en,
      province?.name?.th,
      province?.name?.en,
      categoryLabel(place.category)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      regionOk &&
      provinceOk &&
      categoryOk &&
      (!q || hay.includes(q))
    );
  });

  // แท็บรีวิว = แสดงสถานที่ที่มีคะแนน โดยเรียงคะแนนมากไปน้อย
  if (selectedCategory === "reviews") {
    result = result
      .filter(place => Number(place.rating) > 0)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  if (selectedCategory === "nearby" && userLocation) {
    result = SITE_DATA.places
      .map(place => {
        const coords = getPlaceCoordinates(place);
        return coords
          ? { ...place, _distanceKm: distanceKm(userLocation, coords) }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a._distanceKm - b._distanceKm);
  }

  return result;
}

function renderPlaces() {
  const list = getFilteredPlaces();
  const container = $("#placeGrid");

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧭</div>
        <strong>${t("noData")}</strong>
        <span>${t("noDataSub")}</span>
      </div>`;
    return;
  }

  container.innerHTML = list.map(createPlaceCard).join("");
  bindPlaceCards(container);
}


function getPlaceSearchMatches(keyword, limit = 10) {
  const q = keyword.trim().toLowerCase();

  if (!q) return [];

  return SITE_DATA.places
    .filter(place => {
      const province =
        getProvinceById(
          place.regionId,
          place.provinceId
        );

      const text = [
        place.name?.th,
        place.name?.en,
        place.district?.th,
        place.district?.en,
        province?.name?.th,
        province?.name?.en,
        place.description?.th,
        place.description?.en,
        categoryLabel(place.category)
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

function hidePlaceSuggestions() {
  $("#placeSuggestions")?.classList.add("hidden");
}

function renderPlaceSuggestions(keyword) {
  const box = $("#placeSuggestions");
  if (!box) return;

  const matches = getUnifiedSearchMatches(keyword);

  if (!keyword.trim() || !matches.length) {
    box.innerHTML = "";
    hidePlaceSuggestions();
    return;
  }

  box.innerHTML = `
    <div class="suggestion-heading">${t("searchSuggestionTitle")}</div>
    ${matches.map(unifiedSuggestionHtml).join("")}
  `;

  box.classList.remove("hidden");
  bindUnifiedSuggestions(box);
}


function readSearchFromUrl() {
  const params =
    new URLSearchParams(location.search);
  const shopParam =
    params.get("shop");

  const placeId =
    params.get("place") || "";

  if (shopParam) {
    const shop =
      (window.SHOPS_DATA || [])
        .find(
          item =>
            item.id === shopParam
        );

    const parentId =
      placeId ||
      shop?.nearbyPlaceIds?.[0] ||
      "";

    if (parentId) {
      currentParentPlaceId =
        parentId;
    }

    setTimeout(
      () =>
        openShopDetail(
          shopParam
        ),
      80
    );
  }

  const q =
    params.get("q") || "";

  if (placeId) {
    const place =
      SITE_DATA.places.find(
        item => item.id === placeId
      );

    if (place) {
      selectedRegionId =
        place.regionId;

      selectedProvinceId =
        place.provinceId;

      searchKeyword =
        localized(place.name);

      $("#placeSearch").value =
        localized(place.name);

      return;
    }
  }

  if (q) {
    searchKeyword = q;
    $("#placeSearch").value = q;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCommon();
  bindPlaceModalEvents();
  readSearchFromUrl();

  $("#placeSearch").addEventListener("input", e => {
    searchKeyword = e.target.value;

    renderPlaceSuggestions(
      e.target.value
    );

    renderPlaces();
  });

  $("#placeSearch").addEventListener(
    "keydown",
    e => {
      if (e.key === "Escape") {
        hidePlaceSuggestions();
      }
    }
  );

  document.addEventListener("click", e => {
    if (!e.target.closest(".place-search-wrap")) {
      hidePlaceSuggestions();
    }
  });

  $("#clearSearch").addEventListener("click", () => {
    searchKeyword = "";
    $("#placeSearch").value = "";
    hidePlaceSuggestions();

    history.replaceState(
      {},
      "",
      "./places.html"
    );

    renderPlaces();
  });

  $$(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.category === "nearby") {
        requestNearMe();
        return;
      }

      $$(".filter-button").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      selectedCategory = button.dataset.category;
      renderPlaces();
    });
  });

  applyPageLanguage();
});


window.addEventListener("places-data-updated", () => {
  if (typeof applyPageLanguage === "function") applyPageLanguage();
});
