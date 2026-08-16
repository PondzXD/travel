
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const PLACES_KEY = "travel_demo_places";
const SHOPS_KEY = "travel_demo_shops";

let places = [];
let shops = [];

let editingPlace = null;
let editingShop = null;
let placeGallery = [];
let shopGallery = [];
let shopProducts = [];

let deleteType = null;
let deleteId = null;

function message(el, text="", type="") {
  el.textContent = text;
  el.className = `msg ${type}`;
}

function readStorage() {
  try {
    const p = JSON.parse(localStorage.getItem(PLACES_KEY));
    places = Array.isArray(p) && p.length ? p : [...SITE_DATA.places];
  } catch { places = [...SITE_DATA.places]; }

  try {
    const s = JSON.parse(localStorage.getItem(SHOPS_KEY));
    shops = Array.isArray(s) && s.length ? s : [...DEFAULT_SHOPS];
  } catch { shops = [...DEFAULT_SHOPS]; }
}

function savePlaces() {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

function saveShops() {
  localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
}

async function requireAdmin() {
  if (!window.FIREBASE_CONFIG?.enabled) {
    $("#adminAuthStatus").textContent = "ยังไม่ได้เปิดใช้งาน Firebase";
    message($("#loginMsg"), "กรุณาใส่ Firebase Web Config ก่อน", "");
    return false;
  }
  try {
    await AuthService.initFirebase();
    const user = AuthService.getCurrentUser();
    if (!user) {
      window.location.replace("./login.html?mode=signin");
      return false;
    }
    const admin = await AuthService.isAdmin(user);
    if (!admin) {
      message($("#loginMsg"), "บัญชีนี้ไม่มีสิทธิ์ Admin");
      setTimeout(() => window.location.replace("./index.html"), 900);
      return false;
    }
    showDashboard(user);
    return true;
  } catch (e) {
    console.error(e);
    $("#adminAuthStatus").textContent = "ตรวจสอบ Firebase ไม่สำเร็จ";
    message($("#loginMsg"), e.message || "ไม่สามารถตรวจสอบสิทธิ์ได้");
    return false;
  }
}

async function logout() {
  await AuthService.signOut();
  window.location.replace("./login.html?mode=signin");
}

function showDashboard(user) {
  readStorage();
  $("#loginView").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  const label = user?.email || user?.username || "Admin";
  const small = $(".topbar small");
  if (small) small.textContent = label + " (Admin)";
  showView("places");
}

function showView(view) {
  ["placeListView","placeFormView","shopListView","shopFormView"]
    .forEach(id => $("#"+id).classList.add("hidden"));

  $$(".nav").forEach(b => b.classList.remove("active"));

  if (view === "places") {
    $("#placeListView").classList.remove("hidden");
    $('[data-view="places"]').classList.add("active");
    renderPlaceList();
  }

  if (view === "add-place") {
    $("#placeFormView").classList.remove("hidden");
    $('[data-view="add-place"]').classList.add("active");
    fillPlaceForm();
  }

  if (view === "shops") {
    $("#shopListView").classList.remove("hidden");
    $('[data-view="shops"]').classList.add("active");
    fillShopPlaceFilter();
    renderShopList();
  }

  if (view === "add-shop") {
    $("#shopFormView").classList.remove("hidden");
    $('[data-view="add-shop"]').classList.add("active");
    fillShopForm();
  }
}

function slug(text) {
  return text.trim().toLowerCase()
    .replace(/\s+/g,"-")
    .replace(/[^a-z0-9ก-๙_-]/g,"")
    .replace(/-+/g,"-")
    || `item-${Date.now()}`;
}

function fileToDataURL(file) {
  return new Promise((resolve,reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function previewImage(url, target) {
  $(target).innerHTML = url ? `<img src="${url}">` : "";
}

function renderGallery(arr, target, removePrefix) {
  $(target).innerHTML = arr.map((url,i) => `
    <div class="gitem">
      <img src="${url}">
      <button type="button" data-${removePrefix}="${i}">×</button>
    </div>
  `).join("");

  $$(`[data-${removePrefix}]`).forEach(b => {
    b.onclick = () => {
      arr.splice(Number(b.dataset[removePrefix]),1);
      renderGallery(arr,target,removePrefix);
    };
  });
}

/* ---------------- PLACES ---------------- */

function fillPlaceRegions() {
  $("#pRegion").innerHTML = SITE_DATA.regions
    .map(r => `<option value="${r.id}">${r.name.th}</option>`)
    .join("");
  fillPlaceProvinces();
}

function fillPlaceProvinces() {
  const region = SITE_DATA.regions.find(r => r.id === $("#pRegion").value);
  $("#pProvince").innerHTML = (region?.provinces || [])
    .map(p => `<option value="${p.id}">${p.name.th}</option>`)
    .join("");
}

function provinceName(id) {
  return SITE_DATA.regions.flatMap(r => r.provinces)
    .find(p => p.id === id)?.name?.th || id;
}

function regionName(id) {
  return SITE_DATA.regions.find(r => r.id === id)?.name?.th || id;
}

function catName(c) {
  return {nature:"ธรรมชาติ",history:"ประวัติศาสตร์",activity:"ที่เที่ยว & กิจกรรม"}[c] || c;
}

function renderPlaceList() {
  const q = $("#placeSearchAdmin").value.trim().toLowerCase();

  const list = places.filter(p =>
    !q || [
      p.name?.th,p.name?.en,p.district?.th,p.district?.en
    ].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  $("#adminPlaceList").innerHTML = list.length
    ? list.map(p => {
        const img = p.image || p.gallery?.[0] || "";
        return `
          <article class="data-row">
            <div class="thumb">${img ? `<img src="${img}">` : (p.icon || "📍")}</div>
            <div class="data-main">
              <strong>${p.name?.th || "-"}</strong>
              <span>${regionName(p.regionId)} / ${provinceName(p.provinceId)} / ${catName(p.category)}</span>
              <span class="status ${p.visible===false?"off":""}">${p.visible===false?"ซ่อน":"แสดง"}</span>
            </div>
            <div class="row-actions">
              <button data-edit-place="${p.id}">แก้ไข</button>
              <button class="del" data-del-place="${p.id}">ลบ</button>
            </div>
          </article>`;
      }).join("")
    : '<div class="empty">ยังไม่มีข้อมูลสถานที่</div>';

  $$("[data-edit-place]").forEach(b => b.onclick = () => {
    editingPlace = places.find(p => p.id === b.dataset.editPlace);
    $("#placeListView").classList.add("hidden");
    $("#placeFormView").classList.remove("hidden");
    fillPlaceForm(editingPlace);
  });

  $$("[data-del-place]").forEach(b => b.onclick = () =>
    openDelete("place", b.dataset.delPlace)
  );
}

function fillPlaceForm(p=null) {
  editingPlace = p;
  placeGallery = [...(p?.gallery || [])];
  $("#placeForm").reset();
  $("#placeFormTitle").textContent = p ? "แก้ไขสถานที่" : "เพิ่มสถานที่";
  $("#placeEditId").value = p?.id || "";

  fillPlaceRegions();
  $("#pRegion").value = p?.regionId || "south";
  fillPlaceProvinces();
  $("#pProvince").value = p?.provinceId || $("#pProvince").options[0]?.value || "";

  $("#pCategory").value = p?.category || "nature";
  $("#pNameTh").value = p?.name?.th || "";
  $("#pNameEn").value = p?.name?.en || "";
  $("#pDistrictTh").value = p?.district?.th || "";
  $("#pDistrictEn").value = p?.district?.en || "";
  $("#pDescTh").value = p?.description?.th || "";
  $("#pDescEn").value = p?.description?.en || "";
  $("#pAddressTh").value = p?.address?.th || "";
  $("#pAddressEn").value = p?.address?.en || "";
  $("#pOpen").value = p?.openTime || "";
  $("#pClose").value = p?.closeTime || "";
  $("#pPhone").value = p?.phone || "";
  $("#pIcon").value = p?.icon || "";
  $("#pRating").value = p?.rating ?? "";
  $("#pReviews").value = p?.reviewCount || "";
  $("#pLat").value = p?.lat ?? "";
  $("#pLng").value = p?.lng ?? "";
  $("#pHoursTh").value = p?.hours?.th || "";
  $("#pHoursEn").value = p?.hours?.en || "";
  $("#pMaps").value = p?.mapsUrl || "";
  $("#pEmbed").value = p?.embedUrl || "";
  $("#pVisible").checked = p?.visible !== false;
  $("#pFeatured").checked = p?.featured === true;

  previewImage(p?.image || "", "#pCoverPreview");
  renderGallery(placeGallery, "#pGalleryPreview", "rm-place-gallery");
  $("#pCover").value = "";
  $("#pGalleryFiles").value = "";
  message($("#placeMsg"));
}

async function savePlace(e) {
  e.preventDefault();

  const id = $("#placeEditId").value ||
    slug($("#pNameEn").value || $("#pNameTh").value);

  let image = editingPlace?.image || "";
  if ($("#pCover").files[0]) image = await fileToDataURL($("#pCover").files[0]);

  for (const f of [...$("#pGalleryFiles").files]) {
    placeGallery.push(await fileToDataURL(f));
  }

  const data = {
    id,
    regionId: $("#pRegion").value,
    provinceId: $("#pProvince").value,
    category: $("#pCategory").value,
    name: {th:$("#pNameTh").value.trim(),en:$("#pNameEn").value.trim()},
    district: {th:$("#pDistrictTh").value.trim(),en:$("#pDistrictEn").value.trim()},
    description: {th:$("#pDescTh").value.trim(),en:$("#pDescEn").value.trim()},
    address: {th:$("#pAddressTh").value.trim(),en:$("#pAddressEn").value.trim()},
    openTime: $("#pOpen").value,
    closeTime: $("#pClose").value,
    hours: {th:$("#pHoursTh").value.trim(),en:$("#pHoursEn").value.trim()},
    phone: $("#pPhone").value.trim(),
    icon: $("#pIcon").value.trim() || "📍",
    rating: $("#pRating").value ? Number($("#pRating").value) : 0,
    reviewCount: $("#pReviews").value.trim(),
    lat: $("#pLat").value ? Number($("#pLat").value) : null,
    lng: $("#pLng").value ? Number($("#pLng").value) : null,
    mapsUrl: $("#pMaps").value.trim(),
    embedUrl: $("#pEmbed").value.trim(),
    image,
    gallery: placeGallery,
    visible: $("#pVisible").checked,
    featured: $("#pFeatured").checked
  };

  const i = places.findIndex(p => p.id === id);
  i >= 0 ? places[i] = data : places.push(data);
  savePlaces();
  message($("#placeMsg"),"บันทึกเรียบร้อย","success");
  renderPlaceList();
  setTimeout(() => showView("places"),250);
}

/* ---------------- SHOPS ---------------- */

function fillShopPlaceCheckboxes(selected=[]) {
  $("#nearbyPlaceCheckboxes").innerHTML = places.map(p => `
    <label class="place-check">
      <input type="checkbox" value="${p.id}" ${selected.includes(p.id) ? "checked" : ""}>
      <span>${p.name?.th || p.id}</span>
    </label>
  `).join("");
}

function selectedNearbyPlaces() {
  return [...$("#nearbyPlaceCheckboxes").querySelectorAll('input[type="checkbox"]:checked')]
    .map(x => x.value);
}

function fillShopPlaceFilter() {
  $("#shopPlaceFilter").innerHTML =
    '<option value="">ทุกสถานที่</option>' +
    places.map(p => `<option value="${p.id}">${p.name?.th || p.id}</option>`).join("");
}

function shopPlaceNames(shop) {
  return (shop.nearbyPlaceIds || [])
    .map(id => places.find(p => p.id === id)?.name?.th || id)
    .join(", ");
}

function renderShopList() {
  const q = $("#shopSearchAdmin").value.trim().toLowerCase();
  const placeId = $("#shopPlaceFilter").value;

  const list = shops.filter(s => {
    const text = [
      s.name?.th,s.name?.en,s.type?.th,s.type?.en,s.products?.th
    ].filter(Boolean).join(" ").toLowerCase();

    return (!q || text.includes(q))
      && (!placeId || (s.nearbyPlaceIds || []).includes(placeId));
  });

  $("#adminShopList").innerHTML = list.length
    ? list.map(s => {
        const img = s.image || s.gallery?.[0] || "";
        return `
          <article class="data-row">
            <div class="thumb">${img ? `<img src="${img}">` : (s.icon || "🛍️")}</div>
            <div class="data-main">
              <strong>${s.name?.th || "-"}</strong>
              <span>${s.type?.th || "-"} · ใกล้: ${shopPlaceNames(s) || "ยังไม่ได้เลือกสถานที่"}</span>
              <span class="status ${s.visible===false?"off":""}">${s.visible===false?"ซ่อน":"แสดง"}</span>
            </div>
            <div class="row-actions">
              <button data-edit-shop="${s.id}">แก้ไข</button>
              <button class="del" data-del-shop="${s.id}">ลบ</button>
            </div>
          </article>`;
      }).join("")
    : '<div class="empty">ยังไม่มีข้อมูลร้านค้า</div>';

  $$("[data-edit-shop]").forEach(b => b.onclick = () => {
    editingShop = shops.find(s => s.id === b.dataset.editShop);
    $("#shopListView").classList.add("hidden");
    $("#shopFormView").classList.remove("hidden");
    fillShopForm(editingShop);
  });

  $$("[data-del-shop]").forEach(b => b.onclick = () =>
    openDelete("shop",b.dataset.delShop)
  );
}


function renderProductEditor() {
  $("#productEditorList").innerHTML = shopProducts.length
    ? shopProducts.map((item, index) => `
        <article class="product-editor-card" data-product-index="${index}">
          <div class="product-editor-top">
            <strong>สินค้า #${index + 1}</strong>
            <button
              type="button"
              class="secondary small"
              data-remove-product="${index}"
            >
              ลบ
            </button>
          </div>

          <div class="grid2">
            <label>ชื่อสินค้า TH
              <input
                data-product-field="nameTh"
                data-product-index="${index}"
                value="${item.name?.th || ""}"
              >
            </label>

            <label>Product Name EN
              <input
                data-product-field="nameEn"
                data-product-index="${index}"
                value="${item.name?.en || ""}"
              >
            </label>

            <label>ราคา
              <input
                type="number"
                min="0"
                step=".01"
                data-product-field="price"
                data-product-index="${index}"
                value="${item.price ?? ""}"
              >
            </label>

            <label>รูปสินค้า
              <input
                type="file"
                accept="image/*"
                data-product-image="${index}"
              >
            </label>

            <label>รายละเอียด TH
              <textarea
                data-product-field="descTh"
                data-product-index="${index}"
              >${item.description?.th || ""}</textarea>
            </label>

            <label>Description EN
              <textarea
                data-product-field="descEn"
                data-product-index="${index}"
              >${item.description?.en || ""}</textarea>
            </label>
          </div>

          <div class="product-admin-preview">
            ${
              item.image
                ? `<img src="${item.image}" alt="">`
                : ""
            }
          </div>
        </article>
      `).join("")
    : '<div class="empty">ยังไม่มีสินค้า กด “+ เพิ่มสินค้า”</div>';

  $$("[data-remove-product]").forEach(button => {
    button.onclick = () => {
      shopProducts.splice(Number(button.dataset.removeProduct), 1);
      renderProductEditor();
    };
  });

  $$("[data-product-field]").forEach(input => {
    input.oninput = () => {
      const index = Number(input.dataset.productIndex);
      const field = input.dataset.productField;
      const item = shopProducts[index];

      if (field === "nameTh") item.name.th = input.value;
      if (field === "nameEn") item.name.en = input.value;
      if (field === "price") item.price = input.value ? Number(input.value) : 0;
      if (field === "descTh") item.description.th = input.value;
      if (field === "descEn") item.description.en = input.value;
    };
  });

  $$("[data-product-image]").forEach(input => {
    input.onchange = async () => {
      const index = Number(input.dataset.productImage);
      const file = input.files[0];

      if (!file) return;

      shopProducts[index].image = await fileToDataURL(file);
      renderProductEditor();
    };
  });
}

function addProductItem() {
  shopProducts.push({
    id: `product-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    name: { th: "", en: "" },
    price: 0,
    description: { th: "", en: "" },
    image: ""
  });

  renderProductEditor();
}


function fillShopForm(s=null) {
  editingShop = s;
  shopGallery = [...(s?.gallery || [])];
  shopProducts = JSON.parse(JSON.stringify(s?.productItems || []));
  $("#shopForm").reset();
  $("#shopFormTitle").textContent = s ? "แก้ไขร้านค้า" : "เพิ่มร้านค้า";
  $("#shopEditId").value = s?.id || "";

  $("#sNameTh").value = s?.name?.th || "";
  $("#sNameEn").value = s?.name?.en || "";
  $("#sTypeTh").value = s?.type?.th || "";
  $("#sTypeEn").value = s?.type?.en || "";
  $("#sDescTh").value = s?.description?.th || "";
  $("#sDescEn").value = s?.description?.en || "";
  $("#sProductsTh").value = s?.products?.th || "";
  $("#sProductsEn").value = s?.products?.en || "";
  $("#sAddressTh").value = s?.address?.th || "";
  $("#sAddressEn").value = s?.address?.en || "";
  $("#sPhone").value = s?.contact?.phone || "";
  $("#sFacebook").value = s?.contact?.facebook || "";
  $("#sLine").value = s?.contact?.line || "";
  $("#sWebsite").value = s?.contact?.website || "";
  $("#sOpen").value = s?.openTime || "";
  $("#sClose").value = s?.closeTime || "";
  $("#sHoursTh").value = s?.hours?.th || "";
  $("#sHoursEn").value = s?.hours?.en || "";
  $("#sRating").value = s?.rating ?? "";
  $("#sReviews").value = s?.reviewCount || "";
  $("#sLat").value = s?.lat ?? "";
  $("#sLng").value = s?.lng ?? "";
  $("#sIcon").value = s?.icon || "🛍️";
  $("#sMaps").value = s?.mapsUrl || "";
  $("#sEmbed").value = s?.embedUrl || "";
  $("#sVisible").checked = s?.visible !== false;

  fillShopPlaceCheckboxes(s?.nearbyPlaceIds || []);

  previewImage(s?.image || "", "#sCoverPreview");
  renderGallery(shopGallery,"#sGalleryPreview","rm-shop-gallery");
  renderProductEditor();
  $("#sCover").value = "";
  $("#sGalleryFiles").value = "";
  message($("#shopMsg"));
}

async function saveShop(e) {
  e.preventDefault();

  const id = $("#shopEditId").value ||
    slug($("#sNameEn").value || $("#sNameTh").value);

  let image = editingShop?.image || "";
  if ($("#sCover").files[0]) image = await fileToDataURL($("#sCover").files[0]);

  for (const f of [...$("#sGalleryFiles").files]) {
    shopGallery.push(await fileToDataURL(f));
  }

  const data = {
    id,
    nearbyPlaceIds: selectedNearbyPlaces(),
    name: {th:$("#sNameTh").value.trim(),en:$("#sNameEn").value.trim()},
    type: {th:$("#sTypeTh").value.trim(),en:$("#sTypeEn").value.trim()},
    description: {th:$("#sDescTh").value.trim(),en:$("#sDescEn").value.trim()},
    products: {th:$("#sProductsTh").value.trim(),en:$("#sProductsEn").value.trim()},
    productItems: shopProducts,
    address: {th:$("#sAddressTh").value.trim(),en:$("#sAddressEn").value.trim()},
    contact: {
      phone: $("#sPhone").value.trim(),
      facebook: $("#sFacebook").value.trim(),
      line: $("#sLine").value.trim(),
      website: $("#sWebsite").value.trim()
    },
    openTime: $("#sOpen").value,
    closeTime: $("#sClose").value,
    hours: {th:$("#sHoursTh").value.trim(),en:$("#sHoursEn").value.trim()},
    rating: $("#sRating").value ? Number($("#sRating").value) : 0,
    reviewCount: $("#sReviews").value.trim(),
    lat: $("#sLat").value ? Number($("#sLat").value) : null,
    lng: $("#sLng").value ? Number($("#sLng").value) : null,
    icon: $("#sIcon").value.trim() || "🛍️",
    mapsUrl: $("#sMaps").value.trim(),
    embedUrl: $("#sEmbed").value.trim(),
    image,
    gallery: shopGallery,
    visible: $("#sVisible").checked
  };

  const i = shops.findIndex(s => s.id === id);
  i >= 0 ? shops[i] = data : shops.push(data);
  saveShops();
  message($("#shopMsg"),"บันทึกร้านค้าเรียบร้อย","success");
  fillShopPlaceFilter();
  renderShopList();
  setTimeout(() => showView("shops"),250);
}

/* ---------------- DELETE ---------------- */

function openDelete(type,id) {
  deleteType = type;
  deleteId = id;

  const item = type === "place"
    ? places.find(x => x.id === id)
    : shops.find(x => x.id === id);

  $("#deleteTitle").textContent = type === "place" ? "ลบสถานที่?" : "ลบร้านค้า?";
  $("#deleteName").textContent = item?.name?.th || "";
  $("#deleteModal").classList.remove("hidden");
}

function closeDelete() {
  deleteType = null;
  deleteId = null;
  $("#deleteModal").classList.add("hidden");
}

function confirmDelete() {
  if (deleteType === "place") {
    places = places.filter(p => p.id !== deleteId);

    // Remove deleted place from shop relations
    shops = shops.map(s => ({
      ...s,
      nearbyPlaceIds: (s.nearbyPlaceIds || []).filter(id => id !== deleteId)
    }));

    savePlaces();
    saveShops();
    renderPlaceList();
  }

  if (deleteType === "shop") {
    shops = shops.filter(s => s.id !== deleteId);
    saveShops();
    renderShopList();
  }

  closeDelete();
}

/* ---------------- EVENTS ---------------- */

// ผูก event ของหลังบ้านโดยตรง ไม่พึ่ง bind() จากไฟล์ admin.js รุ่นเก่า
function bind() {
  document.querySelectorAll(".nav").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  $("#logout")?.addEventListener("click", logout);
  $("#quickAddPlace")?.addEventListener("click", () => showView("add-place"));
  $("#quickAddShop")?.addEventListener("click", () => showView("add-shop"));

  $("#backFromPlace")?.addEventListener("click", () => showView("places"));
  $("#cancelPlace")?.addEventListener("click", () => showView("places"));
  $("#backFromShop")?.addEventListener("click", () => showView("shops"));
  $("#cancelShop")?.addEventListener("click", () => showView("shops"));

  $("#placeSearchAdmin")?.addEventListener("input", renderPlaceList);
  $("#shopSearchAdmin")?.addEventListener("input", renderShopList);
  $("#shopPlaceFilter")?.addEventListener("change", renderShopList);

  $("#pRegion")?.addEventListener("change", fillPlaceProvinces);
  $("#placeForm")?.addEventListener("submit", savePlace);
  $("#shopForm")?.addEventListener("submit", saveShop);

  $("#pCover")?.addEventListener("change", e => {
    const f = e.target.files?.[0];
    if (f) previewImage(URL.createObjectURL(f), "#pCoverPreview");
  });

  $("#pGalleryFiles")?.addEventListener("change", e => {
    const previews = [...(e.target.files || [])].map(f => URL.createObjectURL(f));
    renderGallery([...placeGallery, ...previews], "#pGalleryPreview", "rm-place-gallery");
  });

  $("#sCover")?.addEventListener("change", e => {
    const f = e.target.files?.[0];
    if (f) previewImage(URL.createObjectURL(f), "#sCoverPreview");
  });

  $("#sGalleryFiles")?.addEventListener("change", e => {
    const previews = [...(e.target.files || [])].map(f => URL.createObjectURL(f));
    renderGallery([...shopGallery, ...previews], "#sGalleryPreview", "rm-shop-gallery");
  });

  $("#addProductItem")?.addEventListener("click", addProductItem);
  $("#confirmDelete")?.addEventListener("click", confirmDelete);
  $("#cancelDelete")?.addEventListener("click", closeDelete);
}

document.addEventListener("DOMContentLoaded", async () => {
  bind();
  await requireAdmin();
});
