
try {
  const savedShops = JSON.parse(localStorage.getItem("travel_demo_shops"));

  if (
    Array.isArray(savedShops) &&
    savedShops.length
  ) {
    window.SHOPS_DATA = savedShops;
  } else {
    window.SHOPS_DATA = [...DEFAULT_SHOPS];
  }
} catch (error) {
  window.SHOPS_DATA = [...DEFAULT_SHOPS];
}
