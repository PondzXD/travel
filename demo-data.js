
try {
  const saved = JSON.parse(localStorage.getItem("travel_demo_places"));
  if (Array.isArray(saved) && saved.length) {
    SITE_DATA.places = saved;
  }
} catch (error) {
  console.warn("Cannot load demo places", error);
}
