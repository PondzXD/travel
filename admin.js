
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234";
const SESSION_KEY = "travel_demo_admin_session";
const PLACES_KEY = "travel_demo_places";

let places = [];
let editing = null;
let gallery = [];
let pendingDelete = null;

function msg(el, text, type="") {
  el.textContent = text || "";
  el.className = `msg ${type}`;
}

function savePlaces() {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
  SITE_DATA.places = [...places];
}

function loadPlaces() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLACES_KEY));
    places = Array.isArray(saved) && saved.length
      ? saved
      : [...SITE_DATA.places];
  } catch {
    places = [...SITE_DATA.places];
  }
  renderList();
}

function login(e) {
  e.preventDefault();

  const user = $("#email").value.trim();
  const pass = $("#password").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem(SESSION_KEY, "true");
    showDash();
    loadPlaces();
    msg($("#loginMsg"), "");
    return;
  }

  msg($("#loginMsg"), "Username หรือ Password ไม่ถูกต้อง");
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  showLogin();
}

function showLogin() {
  $("#loginView").classList.remove("hidden");
  $("#dashboard").classList.add("hidden");
}

function showDash() {
  $("#loginView").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  $("#adminEmail").textContent = "admin (Demo)";
  showList();
}

function showList() {
  $("#listPage").classList.remove("hidden");
  $("#formPage").classList.add("hidden");
  $("#showList").classList.add("active");
  $("#addNew").classList.remove("active");
}

function showForm(place=null) {
  editing = place;
  $("#listPage").classList.add("hidden");
  $("#formPage").classList.remove("hidden");
  $("#showList").classList.remove("active");
  $("#addNew").classList.add("active");
  fillForm(place);
}

function fillRegions() {
  const html = SITE_DATA.regions
    .map(r => `<option value="${r.id}">${r.name.th}</option>`)
    .join("");

  $("#regionId").innerHTML = html;
  $("#regionFilter").innerHTML = '<option value="">ทุกภาค</option>' + html;

  fillProvinces();
  fillFilterProvinces();
}

function fillProvinces() {
  const r = SITE_DATA.regions.find(x => x.id === $("#regionId").value);
  $("#provinceId").innerHTML = (r?.provinces || [])
    .map(p => `<option value="${p.id}">${p.name.th}</option>`)
    .join("");
}

function fillFilterProvinces() {
  const rid = $("#regionFilter").value;
  const list = rid
    ? (SITE_DATA.regions.find(r => r.id === rid)?.provinces || [])
    : SITE_DATA.regions.flatMap(r => r.provinces);

  $("#provinceFilter").innerHTML =
    '<option value="">ทุกจังหวัด</option>' +
    list.map(p => `<option value="${p.id}">${p.name.th}</option>`).join("");
}

function regionName(p) {
  return SITE_DATA.regions.find(r => r.id === p.regionId)?.name?.th || p.regionId;
}

function provinceName(p) {
  return SITE_DATA.regions
    .flatMap(r => r.provinces)
    .find(x => x.id === p.provinceId)?.name?.th || p.provinceId;
}

function catName(c) {
  return {
    nature: "ธรรมชาติ",
    history: "ประวัติศาสตร์",
    activity: "ที่เที่ยว & กิจกรรม"
  }[c] || c;
}

function filtered() {
  const q = $("#search").value.trim().toLowerCase();
  const r = $("#regionFilter").value;
  const p = $("#provinceFilter").value;

  return places.filter(x => {
    const text = [
      x.name?.th,
      x.name?.en,
      x.district?.th,
      x.district?.en
    ].filter(Boolean).join(" ").toLowerCase();

    return (!q || text.includes(q))
      && (!r || x.regionId === r)
      && (!p || x.provinceId === p);
  });
}

function renderList() {
  const list = filtered();

  if (!list.length) {
    $("#placeList").innerHTML = '<div class="empty">ยังไม่มีข้อมูลสถานที่</div>';
    return;
  }

  $("#placeList").innerHTML = list.map(p => {
    const thumb = p.image
      ? `<img src="${p.image}">`
      : p.gallery?.[0]
        ? `<img src="${p.gallery[0]}">`
        : (p.icon || "📍");

    return `
      <article class="row">
        <div class="thumb">${thumb}</div>

        <div class="row-main">
          <strong>${p.name?.th || "-"}</strong>
          <span>${regionName(p)} / ${provinceName(p)} / ${catName(p.category)}</span>
          <span class="status ${p.visible === false ? "off" : ""}">
            ${p.visible === false ? "ซ่อน" : "แสดง"}
          </span>
        </div>

        <div class="row-actions">
          <button data-edit="${p.id}">แก้ไข</button>
          <button class="del" data-del="${p.id}">ลบ</button>
        </div>
      </article>
    `;
  }).join("");

  $$("[data-edit]").forEach(b => {
    b.onclick = () => showForm(places.find(p => p.id === b.dataset.edit));
  });

  $$("[data-del]").forEach(b => {
    b.onclick = () => openDelete(b.dataset.del);
  });
}

function fillForm(p=null) {
  $("#placeForm").reset();
  editing = p;
  gallery = [...(p?.gallery || [])];

  $("#formTitle").textContent = p ? "แก้ไขสถานที่" : "เพิ่มสถานที่";
  $("#placeId").value = p?.id || "";
  $("#nameTh").value = p?.name?.th || "";
  $("#nameEn").value = p?.name?.en || "";

  $("#regionId").value = p?.regionId || "south";
  fillProvinces();

  $("#provinceId").value = p?.provinceId || $("#provinceId").options[0]?.value || "";
  $("#category").value = p?.category || "nature";

  $("#districtTh").value = p?.district?.th || "";
  $("#districtEn").value = p?.district?.en || "";

  $("#descTh").value = p?.description?.th || "";
  $("#descEn").value = p?.description?.en || "";

  $("#addressTh").value = p?.address?.th || "";
  $("#addressEn").value = p?.address?.en || "";

  $("#openTime").value = p?.openTime || "";
  $("#closeTime").value = p?.closeTime || "";

  $("#phone").value = p?.phone || "";
  $("#icon").value = p?.icon || "";

  $("#hoursTh").value = p?.hours?.th || "";
  $("#hoursEn").value = p?.hours?.en || "";

  $("#rating").value = p?.rating ?? "";
  $("#reviewCount").value = p?.reviewCount || "";

  $("#lat").value = p?.lat ?? "";
  $("#lng").value = p?.lng ?? "";

  $("#mapsUrl").value = p?.mapsUrl || "";
  $("#embedUrl").value = p?.embedUrl || "";

  $("#visible").checked = p?.visible !== false;
  $("#featured").checked = p?.featured === true;

  renderCover(p?.image || "");
  renderGallery();

  $("#coverFile").value = "";
  $("#galleryFiles").value = "";

  msg($("#formMsg"), "");
}

function renderCover(url) {
  $("#coverPreview").innerHTML = url ? `<img src="${url}">` : "";
}

function renderGallery() {
  $("#galleryPreview").innerHTML = gallery.map((u, i) => `
    <div class="gitem">
      <img src="${u}">
      <button type="button" data-rm="${i}">×</button>
    </div>
  `).join("");

  $$("[data-rm]").forEach(b => {
    b.onclick = () => {
      gallery.splice(Number(b.dataset.rm), 1);
      renderGallery();
    };
  });
}

function slug(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9ก-๙_-]/g, "")
    .replace(/-+/g, "-")
    || `place-${Date.now()}`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function save(e) {
  e.preventDefault();

  const btn = $("#save");
  btn.disabled = true;
  btn.textContent = "กำลังบันทึก...";

  try {
    const id = $("#placeId").value
      || slug($("#nameEn").value || $("#nameTh").value);

    let image = editing?.image || "";

    const cover = $("#coverFile").files[0];
    if (cover) {
      image = await fileToDataURL(cover);
    }

    for (const file of [...$("#galleryFiles").files]) {
      gallery.push(await fileToDataURL(file));
    }

    const data = {
      id,
      regionId: $("#regionId").value,
      provinceId: $("#provinceId").value,
      category: $("#category").value,

      name: {
        th: $("#nameTh").value.trim(),
        en: $("#nameEn").value.trim()
      },

      district: {
        th: $("#districtTh").value.trim(),
        en: $("#districtEn").value.trim()
      },

      description: {
        th: $("#descTh").value.trim(),
        en: $("#descEn").value.trim()
      },

      address: {
        th: $("#addressTh").value.trim(),
        en: $("#addressEn").value.trim()
      },

      openTime: $("#openTime").value,
      closeTime: $("#closeTime").value,

      hours: {
        th: $("#hoursTh").value.trim(),
        en: $("#hoursEn").value.trim()
      },

      phone: $("#phone").value.trim(),
      icon: $("#icon").value.trim() || "📍",

      rating: $("#rating").value ? Number($("#rating").value) : 0,
      reviewCount: $("#reviewCount").value.trim(),

      lat: $("#lat").value ? Number($("#lat").value) : null,
      lng: $("#lng").value ? Number($("#lng").value) : null,

      mapsUrl: $("#mapsUrl").value.trim(),
      embedUrl: $("#embedUrl").value.trim(),

      image,
      gallery,

      visible: $("#visible").checked,
      featured: $("#featured").checked
    };

    const index = places.findIndex(p => p.id === id);

    if (index >= 0) {
      places[index] = data;
    } else {
      places.push(data);
    }

    savePlaces();
    msg($("#formMsg"), "บันทึกเรียบร้อย", "success");
    renderList();

    setTimeout(showList, 300);

  } catch (err) {
    console.error(err);
    msg($("#formMsg"), "บันทึกไม่สำเร็จ อาจเป็นเพราะรูปมีขนาดใหญ่เกิน localStorage");
  } finally {
    btn.disabled = false;
    btn.textContent = "บันทึกข้อมูล";
  }
}

function openDelete(id) {
  pendingDelete = id;
  $("#deleteName").textContent = places.find(p => p.id === id)?.name?.th || "";
  $("#deleteModal").classList.remove("hidden");
}

function closeDelete() {
  pendingDelete = null;
  $("#deleteModal").classList.add("hidden");
}

function doDelete() {
  if (!pendingDelete) return;

  places = places.filter(p => p.id !== pendingDelete);
  savePlaces();
  closeDelete();
  renderList();
}

function bind() {
  $("#loginForm").onsubmit = login;
  $("#logout").onclick = logout;

  $("#addTop").onclick = () => showForm();
  $("#addNew").onclick = () => showForm();
  $("#showList").onclick = showList;

  $("#back").onclick = showList;
  $("#cancel").onclick = showList;

  $("#regionId").onchange = fillProvinces;

  $("#regionFilter").onchange = () => {
    fillFilterProvinces();
    renderList();
  };

  $("#provinceFilter").onchange = renderList;
  $("#search").oninput = renderList;

  $("#placeForm").onsubmit = save;

  $("#coverFile").onchange = e => {
    const f = e.target.files[0];
    if (f) renderCover(URL.createObjectURL(f));
  };

  $("#galleryFiles").onchange = e => {
    const previews = [...e.target.files].map(f => URL.createObjectURL(f));

    $("#galleryPreview").innerHTML = [
      ...gallery,
      ...previews
    ].map(u => `
      <div class="gitem">
        <img src="${u}">
      </div>
    `).join("");
  };

  $("#confirmDelete").onclick = doDelete;
  $("#cancelDelete").onclick = closeDelete;
}

document.addEventListener("DOMContentLoaded", () => {
  bind();
  fillRegions();

  if (localStorage.getItem(SESSION_KEY) === "true") {
    showDash();
    loadPlaces();
  } else {
    showLogin();
  }
});
