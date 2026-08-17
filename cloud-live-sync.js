// Refresh the visible UI whenever Firestore changes.
window.addEventListener("places-data-updated", () => {
  if (typeof renderPlaces === "function") renderPlaces();
  if (typeof renderRecommended === "function") renderRecommended();
  if (typeof renderFavorites === "function") renderFavorites();
});

window.addEventListener("shops-data-updated", () => {
  if (typeof renderNearbyShopGrid === "function" && typeof currentParentPlaceId !== "undefined" && currentParentPlaceId) {
    if (typeof shopsNearPlace === "function") renderNearbyShopGrid(shopsNearPlace(currentParentPlaceId));
  }
  if (typeof renderFavoriteShops === "function") renderFavoriteShops();
});
