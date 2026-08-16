
let reviewType = "place";
let reviewId = "";
let reviewParentPlace = "";
let reviewRating = 0;

function reviewLoc(value) {
  if (!value) return "";

  return (
    value[currentLanguage] ??
    value.th ??
    value.en ??
    ""
  );
}

function getReviewTarget() {
  if (reviewType === "shop") {
    return (window.SHOPS_DATA || [])
      .find(item => item.id === reviewId);
  }

  return SITE_DATA.places
    .find(item => item.id === reviewId);
}

function updatePageStars() {
  document
    .querySelectorAll("[data-page-star]")
    .forEach(button => {
      const value =
        Number(button.dataset.pageStar);

      button.textContent =
        value <= reviewRating
          ? "★"
          : "☆";

      button.classList.toggle(
        "active",
        value <= reviewRating
      );
    });
}

function applyReviewPageLanguage() {
  if ($("#navPlaces")) {
    $("#navPlaces").textContent =
      t("placesNav");
  }

  if ($("#navFavorites")) {
    $("#navFavorites").textContent =
      t("favoritesNav");
  }

  renderReviewPage();
}

function renderReviewPage() {
  const target =
    getReviewTarget();

  if (!target) {
    $("#reviewTargetCard").innerHTML = `
      <div class="empty-state">
        <strong>
          ${
            currentLanguage === "th"
              ? "ไม่พบข้อมูล"
              : "Item not found"
          }
        </strong>
      </div>
    `;

    return;
  }

  const reviews =
    ReviewService.get(
      reviewType,
      reviewId
    );

  const summary =
    ReviewService.summary(
      reviewType,
      reviewId
    );

  const mine =
    ReviewService.findMine(
      reviewType,
      reviewId
    );

  const icon =
    target.icon ||
    (reviewType === "shop"
      ? "🛍️"
      : "📍");

  const image =
    target.image ||
    target.gallery?.[0] ||
    "";

  $("#reviewPageTitle").textContent =
    currentLanguage === "th"
      ? "รีวิว"
      : "Reviews";

  $("#reviewBackButton").textContent =
    currentLanguage === "th"
      ? "← กลับ"
      : "← Back";

  $("#reviewPageSummary").innerHTML =
    summary.count
      ? `
        <strong>${summary.average}</strong>
        <span>
          ★ · ${summary.count}
          ${
            currentLanguage === "th"
              ? "รีวิว"
              : "reviews"
          }
        </span>
      `
      : `
        <strong>—</strong>
        <span>
          ${
            currentLanguage === "th"
              ? "ยังไม่มีรีวิว"
              : "No reviews yet"
          }
        </span>
      `;

  $("#reviewTargetCard").innerHTML = `
    <div class="review-target-image">
      ${
        image
          ? `<img src="${image}" alt="">`
          : `<span>${icon}</span>`
      }
    </div>

    <div>
      <small>
        ${
          reviewType === "shop"
            ? (
              currentLanguage === "th"
                ? "ร้านค้า"
                : "Shop"
            )
            : (
              currentLanguage === "th"
                ? "สถานที่"
                : "Place"
            )
        }
      </small>

      <h2>
        ${reviewLoc(target.name)}
      </h2>

      <p>
        ${
          reviewLoc(target.description) ||
          reviewLoc(target.type) ||
          ""
        }
      </p>
    </div>
  `;

  $("#reviewPageList").innerHTML =
    reviews.length
      ? reviews
          .map(review => `
            <article class="review-item">

              <div class="review-item-head">

                <strong>
                  ${review.username}
                </strong>

                <span>
                  ${"★".repeat(review.rating)}
                  ${"☆".repeat(
                    5 - review.rating
                  )}
                </span>

              </div>

              <p>
                ${review.text || ""}
              </p>

              <small>
                ${new Date(
                  review.updatedAt ||
                  review.createdAt
                ).toLocaleDateString(
                  currentLanguage === "th"
                    ? "th-TH"
                    : "en-US"
                )}
              </small>

            </article>
          `)
          .join("")
      : `
        <div class="review-empty">
          ${
            currentLanguage === "th"
              ? "ยังไม่มีรีวิว คุณสามารถเป็นคนแรกได้"
              : "No reviews yet. You can be the first."
          }
        </div>
      `;

  const user =
    AuthService.getCurrentUser();

  const reviewFormWrap =
    $("#reviewFormWrap");

  if (reviewFormWrap) {
    reviewFormWrap.classList.toggle(
      "hidden",
      !user
    );
  }

  $("#reviewLoginHint").textContent = "";

  $("#reviewFormHeading").textContent =
    mine
      ? currentLanguage === "th"
        ? "แก้ไขรีวิวของคุณ"
        : "Edit your review"
      : currentLanguage === "th"
        ? "แชร์ประสบการณ์ของคุณ"
        : "Share your experience";

  $("#submitPageReview").textContent =
    mine
      ? currentLanguage === "th"
        ? "อัปเดตรีวิว"
        : "Update Review"
      : currentLanguage === "th"
        ? "ส่งรีวิว"
        : "Submit Review";

  $("#pageReviewText").placeholder =
    currentLanguage === "th"
      ? "เขียนรีวิวเกี่ยวกับที่นี่..."
      : "Write your review...";

  reviewRating =
    mine?.rating || 0;

  $("#pageReviewText").value =
    mine?.text || "";

  updatePageStars();
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initCommon();

    const params =
      new URLSearchParams(
        window.location.search
      );

    reviewType =
      params.get("type") === "shop"
        ? "shop"
        : "place";

    reviewId =
      params.get("id") || "";

    reviewParentPlace =
      params.get("place") || "";

    $("#reviewBackButton")
      .addEventListener(
        "click",
        () => {

          if (reviewType === "shop") {
            const query =
              `./places.html?shop=${encodeURIComponent(reviewId)}` +
              (
                reviewParentPlace
                  ? `&place=${encodeURIComponent(reviewParentPlace)}`
                  : ""
              );

            window.location.href =
              query;

            return;
          }

          window.location.href =
            `./places.html?place=${encodeURIComponent(reviewId)}`;
        }
      );

    document
      .querySelectorAll(
        "[data-page-star]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            if (
              !AuthService
                .getCurrentUser()
            ) {
              openAuthModal(
                "signin"
              );

              return;
            }

            reviewRating =
              Number(
                button.dataset.pageStar
              );

            updatePageStars();
          }
        );
      });

    $("#submitPageReview")
      .addEventListener(
        "click",
        () => {

          if (
            !AuthService
              .getCurrentUser()
          ) {
            openAuthModal(
              "signin"
            );

            return;
          }

          if (!reviewRating) {
            $("#pageReviewMessage")
              .textContent =
                currentLanguage === "th"
                  ? "กรุณาเลือกดาวก่อน"
                  : "Please choose a rating";

            return;
          }

          ReviewService.add({
            targetType:
              reviewType,

            targetId:
              reviewId,

            rating:
              reviewRating,

            text:
              $("#pageReviewText").value
          });

          $("#pageReviewMessage")
            .textContent =
              currentLanguage === "th"
                ? "บันทึกรีวิวเรียบร้อย ✓"
                : "Review saved ✓";

          renderReviewPage();
        }
      );

    // Make TH/ENG refresh this page too
    $("#thButton")
      ?.addEventListener(
        "click",
        () =>
          setTimeout(
            applyReviewPageLanguage,
            0
          )
      );

    $("#enButton")
      ?.addEventListener(
        "click",
        () =>
          setTimeout(
            applyReviewPageLanguage,
            0
          )
      );

    document.addEventListener(
      "click",
      event => {
        if (
          event.target.closest(
            "#authSubmitButton, #signOutButton"
          )
        ) {
          setTimeout(
            renderReviewPage,
            120
          );
        }
      }
    );

    renderReviewPage();
  }
);
