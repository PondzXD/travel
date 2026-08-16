
let currentParentPlaceId = null;
let currentShopId = null;

let shopGalleryImages = [];
let shopGalleryIndex = 0;
let shopGalleryFallback = "🛍️";

let selectedShopReviewRating = 0;

function shopLocalized(value) {
  if (!value) return "";
  return value[currentLanguage] ?? value.th ?? value.en ?? "";
}

function getVisibleShops() {
  return (window.SHOPS_DATA || [])
    .filter(shop => shop.visible !== false);
}

function shopsNearPlace(placeId) {
  return getVisibleShops()
    .filter(shop =>
      Array.isArray(shop.nearbyPlaceIds) &&
      shop.nearbyPlaceIds.includes(placeId)
    )
    .sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
}

function shopPreviewImage(shop) {
  return (
    shop.image ||
    (Array.isArray(shop.gallery)
      ? shop.gallery[0]
      : "") ||
    ""
  );
}

function createShopCard(shop) {
  const img = shopPreviewImage(shop);
  const favorite =
    ShopFavoriteService.isFavorite(shop.id);

  return `
    <article
      class="shop-card"
      data-shop-id="${shop.id}"
    >
      <div class="shop-card-photo">
        ${
          img
            ? `<img src="${img}" alt="${shopLocalized(shop.name)}">`
            : `<div class="shop-fallback">${shop.icon || "🛍️"}</div>`
        }

        <button
          type="button"
          class="shop-card-favorite ${favorite ? "active" : ""}"
          data-shop-favorite="${shop.id}"
          title="Favorite"
        >
          ${favorite ? "♥" : "♡"}
        </button>
      </div>

      <div class="shop-card-body">
        <span class="shop-type-pill">
          ${shopLocalized(shop.type)}
        </span>

        <h3>${shopLocalized(shop.name)}</h3>

        <p>${shopLocalized(shop.products)}</p>

        <div class="shop-card-meta">
          <span>⭐ ${shop.rating ?? "-"}</span>
          <span>💬 ${shop.reviewCount ?? "-"}</span>
        </div>
      </div>
    </article>
  `;
}

function bindShopCards(container) {
  container
    .querySelectorAll("[data-shop-id]")
    .forEach(card => {
      card.addEventListener("click", () => {
        openShopDetail(card.dataset.shopId);
      });
    });

  container
    .querySelectorAll("[data-shop-favorite]")
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          toggleShopFavorite(
            button.dataset.shopFavorite
          );
        }
      );
    });
}

function openNearbyShops(placeId) {
  if (!placeId) return;

  currentParentPlaceId = placeId;

  const place =
    SITE_DATA.places.find(
      item => item.id === placeId
    );

  const list =
    shopsNearPlace(placeId);

  $("#nearbyShopTitle").textContent =
    currentLanguage === "th"
      ? "ร้านค้าใกล้เคียง"
      : "Nearby Shops";

  $("#nearbyShopSubtitle").textContent =
    place
      ? `${shopLocalized(place.name)} · ${list.length} ${
          currentLanguage === "th"
            ? "ร้าน"
            : "shops"
        }`
      : "";

  renderNearbyShopGrid(list);

  $("#placeModal")?.classList.remove("show");
  $("#nearbyShopModal")?.classList.add("show");
}

function renderNearbyShopGrid(list) {
  const grid = $("#nearbyShopGrid");

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛍️</div>
        <strong>
          ${
            currentLanguage === "th"
              ? "ยังไม่มีข้อมูลร้านค้าใกล้สถานที่นี้"
              : "No nearby shops yet"
          }
        </strong>
        <span>
          ${
            currentLanguage === "th"
              ? "Admin สามารถเพิ่มร้านค้าและผูกกับสถานที่นี้ได้"
              : "Admin can add shops and link them to this place."
          }
        </span>
      </div>
    `;
    return;
  }

  grid.innerHTML =
    list.map(createShopCard).join("");

  bindShopCards(grid);
}

function toggleShopFavorite(shopId) {
  if (!AuthService.getCurrentUser()) {
    openAuthModal("signin");

    if (typeof showAuthMessage === "function") {
      showAuthMessage(
        currentLanguage === "th"
          ? "กรุณาเข้าสู่ระบบก่อนเพิ่มร้านค้าในรายการโปรด"
          : "Please sign in before adding a shop to favorites.",
        "info"
      );
    }

    return;
  }

  ShopFavoriteService.toggle(shopId);

  updateShopFavoriteButton();
  renderFavoriteShops();

  if (currentParentPlaceId) {
    renderNearbyShopGrid(
      shopsNearPlace(currentParentPlaceId)
    );
  }
}

function updateShopFavoriteButton() {
  if (!$("#shopFavoriteButton") || !currentShopId) {
    return;
  }

  const favorite =
    ShopFavoriteService.isFavorite(
      currentShopId
    );

  $("#shopFavoriteButton").textContent =
    favorite ? "♥" : "♡";

  $("#shopFavoriteButton")
    .classList.toggle(
      "active",
      favorite
    );
}

function renderFavoriteShops() {
  const grid =
    $("#favoriteShopGrid");

  const block =
    $(".favorite-shop-block");

  if (!grid || !block) return;

  const user =
    AuthService.getCurrentUser();

  if (!user) {
    block.classList.add("hidden");
    return;
  }

  block.classList.remove("hidden");

  if ($("#favoriteShopsTitle")) {
    $("#favoriteShopsTitle").textContent =
      currentLanguage === "th"
        ? "ร้านค้าโปรด"
        : "Favorite Shops";
  }

  const ids =
    ShopFavoriteService.getFavorites();

  const shops =
    getVisibleShops()
      .filter(shop =>
        ids.includes(shop.id)
      );

  if (!shops.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <strong>
          ${
            currentLanguage === "th"
              ? "ยังไม่มีร้านค้าโปรด"
              : "No favorite shops yet"
          }
        </strong>
        <span>
          ${
            currentLanguage === "th"
              ? "กด ♡ ที่ร้านค้าที่ชอบเพื่อบันทึกไว้"
              : "Tap ♡ on a shop to save it."
          }
        </span>
      </div>
    `;
    return;
  }

  grid.innerHTML =
    shops.map(createShopCard).join("");

  bindShopCards(grid);
}

function getShopGallery(shop) {
  const list = [];

  if (shop.image) {
    list.push(shop.image);
  }

  if (Array.isArray(shop.gallery)) {
    for (const image of shop.gallery) {
      if (
        image &&
        !list.includes(image)
      ) {
        list.push(image);
      }
    }
  }

  return list;
}

function showShopGallery(index) {
  const img =
    $("#shopGalleryImage");

  const fallback =
    $("#shopGalleryFallback");

  if (!img || !fallback) return;

  if (!shopGalleryImages.length) {
    img.classList.add("hidden");
    fallback.classList.remove("hidden");
    fallback.textContent =
      shopGalleryFallback;

    $("#shopGalleryPrev")
      ?.classList.add("hidden");

    $("#shopGalleryNext")
      ?.classList.add("hidden");

    $("#shopGalleryCounter").textContent =
      "0 / 0";

    $("#shopGalleryDots").innerHTML = "";

    return;
  }

  shopGalleryIndex =
    (index + shopGalleryImages.length) %
    shopGalleryImages.length;

  img.src =
    shopGalleryImages[shopGalleryIndex];

  img.classList.remove("hidden");
  fallback.classList.add("hidden");

  img.onerror = () => {
    img.classList.add("hidden");
    fallback.classList.remove("hidden");
    fallback.textContent =
      shopGalleryFallback;
  };

  $("#shopGalleryPrev")
    ?.classList.toggle(
      "hidden",
      shopGalleryImages.length <= 1
    );

  $("#shopGalleryNext")
    ?.classList.toggle(
      "hidden",
      shopGalleryImages.length <= 1
    );

  $("#shopGalleryCounter").textContent =
    `${shopGalleryIndex + 1} / ${shopGalleryImages.length}`;

  $("#shopGalleryDots").innerHTML =
    shopGalleryImages
      .map(
        (_, i) => `
          <button
            type="button"
            class="gallery-dot ${
              i === shopGalleryIndex
                ? "active"
                : ""
            }"
            data-shop-gallery="${i}"
          ></button>
        `
      )
      .join("");

  $("#shopGalleryDots")
    .querySelectorAll(
      "[data-shop-gallery]"
    )
    .forEach(dot => {
      dot.addEventListener(
        "click",
        () => {
          showShopGallery(
            Number(
              dot.dataset.shopGallery
            )
          );
        }
      );
    });
}

function formatPrice(value) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return value || "-";
  }

  return `฿${number.toLocaleString(
    "th-TH"
  )}`;
}

function renderShopProducts(shop) {
  const grid =
    $("#shopProductGrid");

  if (!grid) return;

  const items =
    Array.isArray(shop.productItems)
      ? shop.productItems
      : [];

  $("#shopProductsTitle").textContent =
    currentLanguage === "th"
      ? "สินค้า"
      : "Products";

  if (!items.length) {
    grid.innerHTML = `
      <div class="product-empty">
        ${
          currentLanguage === "th"
            ? "ยังไม่มีข้อมูลสินค้า"
            : "No product information yet"
        }
      </div>
    `;

    return;
  }

  grid.innerHTML =
    items
      .map(item => `
        <article class="product-card">

          <div class="product-image">
            ${
              item.image
                ? `<img src="${item.image}" alt="${shopLocalized(item.name)}">`
                : `<div class="product-fallback">🛒</div>`
            }
          </div>

          <div class="product-info">

            <h4>
              ${shopLocalized(item.name)}
            </h4>

            <p>
              ${shopLocalized(
                item.description
              )}
            </p>

            <strong>
              ${formatPrice(item.price)}
            </strong>

          </div>

        </article>
      `)
      .join("");
}

function updateShopStars() {
  $$("#shopStarInput [data-star]")
    .forEach(button => {
      const value =
        Number(button.dataset.star);

      button.textContent =
        value <=
        selectedShopReviewRating
          ? "★"
          : "☆";

      button.classList.toggle(
        "active",
        value <=
          selectedShopReviewRating
      );
    });
}

function renderShopReviews(shopId) {
  const summary = ReviewService.summary("shop", shopId);
  const shop = getVisibleShops().find(item => item.id === shopId);

  if ($("#shopRating") && shop) {
    $("#shopRating").innerHTML =
      `⭐ <b>${currentLanguage === "th" ? "คะแนน:" : "Rating:"}</b> ${shop.rating ?? "-"}
       · 💬 ${shop.reviewCount ?? "0"}
       · ${currentLanguage === "th" ? "รีวิวในเว็บ" : "website reviews"} ${summary.count}`;
  }

  const reviewButton = $("#openShopReviews");
  if (reviewButton) {
    reviewButton.textContent = currentLanguage === "th"
      ? `⭐ ดูรีวิว (${summary.count})`
      : `⭐ Reviews (${summary.count})`;

    reviewButton.onclick = () => {
      window.location.href =
        `./reviews.html?type=shop&id=${encodeURIComponent(shopId)}${
          currentParentPlaceId ? `&place=${encodeURIComponent(currentParentPlaceId)}` : ""
        }`;
    };
  }
}

function openShopDetail(shopId) {
  const shop =
    getVisibleShops()
      .find(
        item => item.id === shopId
      );

  if (!shop) return;

  currentShopId = shopId;

  shopGalleryImages =
    getShopGallery(shop);

  shopGalleryFallback =
    shop.icon || "🛍️";

  showShopGallery(0);

  $("#shopType").textContent =
    shopLocalized(shop.type);

  $("#shopName").textContent =
    shopLocalized(shop.name);

  $("#shopSub").textContent =
    currentLanguage === "th"
      ? "ร้านค้าใกล้สถานที่ท่องเที่ยว"
      : "Shop near tourist attraction";

  $("#shopDescription").textContent =
    shopLocalized(shop.description);

  $("#shopProducts").innerHTML =
    `🛒 <b>${
      currentLanguage === "th"
        ? "สินค้า/บริการ:"
        : "Products / Services:"
    }</b> ${shopLocalized(shop.products)}`;

  $("#shopAddress").innerHTML =
    `📍 <b>${
      currentLanguage === "th"
        ? "ที่อยู่:"
        : "Address:"
    }</b> ${shopLocalized(shop.address)}`;

  $("#shopHours").innerHTML =
    `🕒 <b>${
      currentLanguage === "th"
        ? "เวลา:"
        : "Hours:"
    }</b> ${shopLocalized(shop.hours)}`;

  const contacts = [];

  if (shop.contact?.phone) {
    contacts.push(
      `☎️ ${shop.contact.phone}`
    );
  }

  if (shop.contact?.facebook) {
    contacts.push(
      `Facebook: ${shop.contact.facebook}`
    );
  }

  if (shop.contact?.line) {
    contacts.push(
      `LINE: ${shop.contact.line}`
    );
  }

  if (shop.contact?.website) {
    contacts.push(
      `Website: ${shop.contact.website}`
    );
  }

  $("#shopContact").innerHTML =
    `<b>${
      currentLanguage === "th"
        ? "ช่องทางติดต่อ:"
        : "Contact:"
    }</b><br>${
      contacts.length
        ? contacts.join("<br>")
        : "—"
    }`;

  $("#shopMaps").href =
    shop.mapsUrl || "#";

  $("#shopMap").src =
    shop.embedUrl || "";

  renderShopProducts(shop);
  renderShopReviews(shopId);
  updateShopFavoriteButton();

  $("#nearbyShopModal")
    ?.classList.remove("show");

  $("#shopDetailModal")
    ?.classList.add("show");
}

function returnToParentPlace() {
  $("#nearbyShopModal")
    ?.classList.remove("show");

  $("#shopDetailModal")
    ?.classList.remove("show");

  if (currentParentPlaceId) {
    openPlaceModal(
      currentParentPlaceId
    );
  }
}

function closeShopDetail() {
  $("#shopDetailModal")
    ?.classList.remove("show");

  if ($("#shopMap")) {
    $("#shopMap").src = "";
  }

  if (currentParentPlaceId) {
    renderNearbyShopGrid(
      shopsNearPlace(
        currentParentPlaceId
      )
    );

    $("#nearbyShopModal")
      ?.classList.add("show");
  }
}

function submitShopReview() {
  if (!currentShopId) {
    return;
  }

  const user =
    AuthService.getCurrentUser();

  if (!user) {
    openAuthModal("signin");
    return;
  }

  if (!selectedShopReviewRating) {
    $("#shopReviewMessage").textContent =
      currentLanguage === "th"
        ? "กรุณาเลือกคะแนนดาว 1–5 ดาว"
        : "Please select a 1–5 star rating.";

    return;
  }

  try {
    ReviewService.add({
      targetType: "shop",
      targetId: currentShopId,
      rating:
        selectedShopReviewRating,
      text:
        $("#shopReviewText").value
    });

    renderShopReviews(
      currentShopId
    );

    $("#shopReviewMessage").textContent =
      currentLanguage === "th"
        ? "บันทึกรีวิวเรียบร้อย ✓"
        : "Review saved ✓";

  } catch (error) {
    console.error(error);

    $("#shopReviewMessage").textContent =
      currentLanguage === "th"
        ? "ไม่สามารถบันทึกรีวิวได้"
        : "Could not save review.";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    $("#openNearbyShops")
      ?.addEventListener(
        "click",
        () => {
          if (currentPlaceId) {
            openNearbyShops(
              currentPlaceId
            );
          }
        }
      );

    $("#closeNearbyShopModal")
      ?.addEventListener(
        "click",
        () => {
          $("#nearbyShopModal")
            ?.classList.remove("show");

          if (currentParentPlaceId) {
            openPlaceModal(
              currentParentPlaceId
            );
          }
        }
      );

    $("#closeShopDetailModal")
      ?.addEventListener(
        "click",
        closeShopDetail
      );

    $("#backToPlaceFromShopList")
      ?.addEventListener(
        "click",
        returnToParentPlace
      );

    $("#backToPlaceFromShopDetail")
      ?.addEventListener(
        "click",
        returnToParentPlace
      );

    $("#shopGalleryPrev")
      ?.addEventListener(
        "click",
        () =>
          showShopGallery(
            shopGalleryIndex - 1
          )
      );

    $("#shopGalleryNext")
      ?.addEventListener(
        "click",
        () =>
          showShopGallery(
            shopGalleryIndex + 1
          )
      );

    $("#shopFavoriteButton")
      ?.addEventListener(
        "click",
        () => {
          if (currentShopId) {
            toggleShopFavorite(
              currentShopId
            );
          }
        }
      );

    $$("#shopStarInput [data-star]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            if (
              !AuthService.getCurrentUser()
            ) {
              openAuthModal("signin");
              return;
            }

            selectedShopReviewRating =
              Number(
                button.dataset.star
              );

            updateShopStars();
          }
        );
      });

    $("#submitShopReview")
      ?.addEventListener(
        "click",
        submitShopReview
      );

    $("#nearbyShopModal")
      ?.addEventListener(
        "click",
        event => {
          if (
            event.target.id ===
            "nearbyShopModal"
          ) {
            $("#nearbyShopModal")
              .classList.remove("show");

            if (currentParentPlaceId) {
              openPlaceModal(
                currentParentPlaceId
              );
            }
          }
        }
      );

    $("#shopDetailModal")
      ?.addEventListener(
        "click",
        event => {
          if (
            event.target.id ===
            "shopDetailModal"
          ) {
            closeShopDetail();
          }
        }
      );

    // ให้ร้านโปรดแสดงทันทีถ้าผู้ใช้มี session อยู่แล้ว
    renderFavoriteShops();

    // หลัง login / logout common.js จะ render favorite สถานที่
    // ใช้ event click delayed update เป็น fallback
    document.addEventListener(
      "click",
      event => {
        if (
          event.target.closest(
            "#authSubmitButton, #signOutButton"
          )
        ) {
          setTimeout(
            renderFavoriteShops,
            100
          );
        }
      }
    );
  }
);
