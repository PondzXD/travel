
/*
=========================================================
Shop Favorites Service
=========================================================
แยกรายการโปรดร้านค้าออกจากสถานที่
แต่ใช้ account/session เดียวกัน
=========================================================
*/

const ShopFavoriteService = (() => {
  const KEY = "travel_demo_shop_favorites";

  function getMap() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function getCurrentUser() {
    return AuthService.getCurrentUser();
  }

  function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];

    const map = getMap();
    return map[user.id] || [];
  }

  function isFavorite(shopId) {
    return getFavorites().includes(shopId);
  }

  function toggle(shopId) {
    const user = getCurrentUser();

    if (!user) {
      throw new Error("LOGIN_REQUIRED");
    }

    const map = getMap();
    const set = new Set(map[user.id] || []);

    if (set.has(shopId)) {
      set.delete(shopId);
    } else {
      set.add(shopId);
    }

    map[user.id] = [...set];
    localStorage.setItem(KEY, JSON.stringify(map));

    return map[user.id];
  }

  return {
    getFavorites,
    isFavorite,
    toggle
  };
})();
