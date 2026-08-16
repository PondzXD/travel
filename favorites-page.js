
function favoriteLocalized(value) {
  if (!value) return "";

  return (
    value[currentLanguage] ??
    value.th ??
    value.en ??
    ""
  );
}

function renderFavoritesPage() {
  const user =
    AuthService.getCurrentUser();

  $("#favoritesGuest")
    .classList.toggle(
      "hidden",
      !!user
    );

  $("#favoritesContent")
    .classList.toggle(
      "hidden",
      !user
    );

  if (!user) {
    return;
  }


  // ---------------------------
  // Favorite places
  // ---------------------------

  const placeIds =
    AuthService.getFavorites();

  const places =
    SITE_DATA.places.filter(
      place =>
        placeIds.includes(place.id)
    );

  $("#favoritePlacePageGrid")
    .innerHTML =
      places.length
        ? places
            .map(place => {

              const image =
                place.image ||
                place.gallery?.[0] ||
                "";

              return `
                <article
                  class="favorite-page-card"
                  data-favorite-place="${place.id}"
                >

                  <div class="favorite-page-image">

                    ${
                      image
                        ? `<img src="${image}" alt="">`
                        : `<div class="favorite-page-fallback">${place.icon || "📍"}</div>`
                    }

                  </div>

                  <div class="favorite-page-info">

                    <span class="modal-category">
                      📍 ${
                        currentLanguage === "th"
                          ? "สถานที่"
                          : "Place"
                      }
                    </span>

                    <h3>
                      ${favoriteLocalized(place.name)}
                    </h3>

                    <p>
                      ${favoriteLocalized(place.district)}
                    </p>

                    <strong>
                      ★ ${place.rating ?? "-"}
                    </strong>

                  </div>

                </article>
              `;
            })
            .join("")
        : `
          <div class="empty-state">
            <div class="empty-icon">♡</div>
            <strong>
              ${
                currentLanguage === "th"
                  ? "ยังไม่มีสถานที่โปรด"
                  : "No favorite places yet"
              }
            </strong>
          </div>
        `;


  // ---------------------------
  // Favorite shops
  // ---------------------------

  const shopIds =
    ShopFavoriteService
      .getFavorites();

  const shops =
    (window.SHOPS_DATA || [])
      .filter(
        shop =>
          shop.visible !== false &&
          shopIds.includes(shop.id)
      );

  $("#favoriteShopPageGrid")
    .innerHTML =
      shops.length
        ? shops
            .map(shop => {

              const image =
                shop.image ||
                shop.gallery?.[0] ||
                "";

              return `
                <article
                  class="favorite-page-card"
                  data-favorite-shop="${shop.id}"
                >

                  <div class="favorite-page-image">

                    ${
                      image
                        ? `<img src="${image}" alt="">`
                        : `<div class="favorite-page-fallback">${shop.icon || "🛍️"}</div>`
                    }

                  </div>

                  <div class="favorite-page-info">

                    <span class="modal-category">
                      🛍️ ${
                        currentLanguage === "th"
                          ? "ร้านค้า"
                          : "Shop"
                      }
                    </span>

                    <h3>
                      ${favoriteLocalized(shop.name)}
                    </h3>

                    <p>
                      ${favoriteLocalized(shop.type)}
                    </p>

                    <strong>
                      ★ ${shop.rating ?? "-"}
                    </strong>

                  </div>

                </article>
              `;
            })
            .join("")
        : `
          <div class="empty-state">
            <div class="empty-icon">♡</div>
            <strong>
              ${
                currentLanguage === "th"
                  ? "ยังไม่มีร้านค้าโปรด"
                  : "No favorite shops yet"
              }
            </strong>
          </div>
        `;


  document
    .querySelectorAll(
      "[data-favorite-place]"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {
          window.location.href =
            `./places.html?place=${encodeURIComponent(card.dataset.favoritePlace)}`;
        }
      );
    });


  document
    .querySelectorAll(
      "[data-favorite-shop]"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {
          window.location.href =
            `./places.html?shop=${encodeURIComponent(card.dataset.favoriteShop)}`;
        }
      );
    });
}

function applyFavoritesPageLanguage() {
  $("#favoritesPageTitle")
    .textContent =
      currentLanguage === "th"
        ? "รายการโปรด"
        : "Favorites";

  $("#favoritesPageSub")
    .textContent =
      currentLanguage === "th"
        ? "สถานที่และร้านค้าที่คุณบันทึกไว้"
        : "Places and shops you saved";

  $("#favoritesGuestTitle")
    .textContent =
      currentLanguage === "th"
        ? "เข้าสู่ระบบเพื่อดูรายการโปรด"
        : "Sign in to view your favorites";

  $("#favoritesLoginButton")
    .textContent =
      currentLanguage === "th"
        ? "เข้าสู่ระบบ"
        : "Sign in";

  $("#favPlacesHeading")
    .textContent =
      currentLanguage === "th"
        ? "📍 สถานที่โปรด"
        : "📍 Favorite Places";

  $("#favShopsHeading")
    .textContent =
      currentLanguage === "th"
        ? "🛍️ ร้านค้าโปรด"
        : "🛍️ Favorite Shops";

  renderFavoritesPage();
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initCommon();

    $("#favoritesLoginButton")
      .addEventListener(
        "click",
        () =>
          openAuthModal(
            "signin"
          )
      );

    $("#thButton")
      ?.addEventListener(
        "click",
        () =>
          setTimeout(
            applyFavoritesPageLanguage,
            0
          )
      );

    $("#enButton")
      ?.addEventListener(
        "click",
        () =>
          setTimeout(
            applyFavoritesPageLanguage,
            0
          )
      );

    // Refresh after auth events
    document.addEventListener(
      "click",
      event => {

        if (
          event.target.closest(
            "#authSubmitButton, #signOutButton"
          )
        ) {
          setTimeout(
            renderFavoritesPage,
            100
          );
        }
      }
    );

    applyFavoritesPageLanguage();
  }
);
