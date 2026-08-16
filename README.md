# Thailand Travel Guide - Structured Version

เวอร์ชันนี้แยกไฟล์เพื่อให้เพิ่มข้อมูลได้ง่าย

## โครงสร้าง

- `index.html` = โครงหน้าเว็บ
- `styles.css` = หน้าตาเว็บ
- `data.js` = ข้อมูลภาค จังหวัด สถานที่ และคำแปล
- `app.js` = ระบบค้นหา เปลี่ยนภาษา กรองข้อมูล และแสดงรายละเอียด

## เวลาจะเพิ่มสถานที่

แก้เฉพาะ `data.js`

ไปที่:

```js
places: [
```

แล้วเพิ่ม object ใหม่ เช่น:

```js
{
  id: "new-place",
  regionId: "south",
  provinceId: "phatthalung",
  category: "nature",

  name: {
    th: "ชื่อสถานที่",
    en: "Place Name"
  },

  district: {
    th: "อำเภอ...",
    en: "District..."
  },

  description: {
    th: "รายละเอียด",
    en: "Description"
  },

  address: {
    th: "ที่อยู่",
    en: "Address"
  },

  hours: {
    th: "08:00–17:00",
    en: "08:00–17:00"
  },

  phone: "012 345 6789",
  rating: 4.5,
  reviewCount: "100+",

  image: "https://example.com/photo.jpg",
  icon: "🌿",

  mapsUrl: "Google Maps URL",
  embedUrl: "Google Maps Embed URL"
}
```

## category ใช้อะไรได้บ้าง

```txt
nature
history
activity
```

## เวลาจะเพิ่มจังหวัด

แก้ที่ `regions` ใน `data.js`

ตัวอย่าง:

```js
{
  id: "south",
  name: {
    th: "ภาคใต้",
    en: "South"
  },

  provinces: [
    {
      id: "phatthalung",
      name: {
        th: "พัทลุง",
        en: "Phatthalung"
      }
    },

    {
      id: "songkhla",
      name: {
        th: "สงขลา",
        en: "Songkhla"
      }
    }
  ]
}
```

จากนั้นสถานที่ที่อยู่สงขลาให้ใช้:

```js
regionId: "south",
provinceId: "songkhla"
```

ระบบจะจัดสถานที่เข้าจังหวัดให้เอง


## ข้อมูลตัวอย่างปัจจุบัน

พัทลุงมีข้อมูลครบ 9 สถานที่

- ธรรมชาติ: ทะเลน้อย, อุทยานแห่งชาติเขาปู่–เขาย่า, น้ำตกเขาคราม
- ประวัติศาสตร์: วัดคูหาสวรรค์, วังเจ้าเมืองพัทลุง, วัดวัง
- ที่เที่ยว & กิจกรรม: หลาดใต้โหนด, นาโปแก, เดอลองการ์เด้น


# V5 - ระบบสมาชิกและรายการโปรด

## สิ่งที่เพิ่ม

- เปลี่ยนชื่อเว็บไซต์เป็น `แนะนำสถานที่ท่องเที่ยวร้านค้าและสินค้า`
- เมนูด้านบนเหลือ `สถานที่`
- ผู้ใช้ที่ไม่ได้ Login ยังดูรายละเอียดสถานที่และ Google Maps ได้
- Sign in
- Sign up
- Username + Password (Demo localStorage)
- Favorites หลัง Login
- ปุ่มหัวใจบนการ์ดและหน้า Detail
- Sign out
- UI ภาษา TH / ENG

## Google และ Facebook Login

หน้า UI มีปุ่ม Google และ Facebook ให้แล้ว แต่ OAuth จริงยังไม่เปิดใช้งาน

เหตุผลคือ Google/Facebook Login ต้องใช้ Firebase Authentication
หรือ backend OAuth และต้องมีค่า config ของโปรเจกต์จริง เช่น:

- Firebase API Key
- Auth Domain
- Project ID
- Google Provider
- Facebook App ID / App Secret

ไฟล์ `auth.js` มีตำแหน่งเตรียมไว้สำหรับเปลี่ยนไปใช้ Firebase Authentication

## สำคัญเกี่ยวกับ Username / Password

เวอร์ชันนี้เป็น Front-end Demo จึงใช้ localStorage เพื่อทดสอบ flow เท่านั้น

ห้ามใช้วิธีเก็บ password ใน localStorage สำหรับเว็บ Production

เว็บจริงควรใช้:

- Firebase Authentication
- Supabase Auth
- หรือ Backend + Database + Password Hashing


# V6 - แยกหน้าเว็บ

## หน้า 1: index.html
หน้าแรกของเว็บ

- Hero
- Search
- สถานที่แนะนำ 4 แห่ง
- ไม่แสดงตัวเลือกภาค/จังหวัดบนหน้าแรก
- เมนู "สถานที่" จะไปหน้า places.html
- หาก Login แล้ว ยังสามารถดูรายการโปรดได้

สถานที่แนะนำ 4 แห่งแก้ได้ที่ `home.js`

```js
const recommendedIds = [
  "thale-noi",
  "khao-pu-khao-ya",
  "wat-khuha-sawan",
  "lad-tainod"
];
```

## หน้า 2: places.html

- เลือกภาค
- เลือกจังหวัด
- เลือกหมวดหมู่
- ค้นหา
- แสดงการ์ดสถานที่
- ดูรายละเอียด + Google Maps
- รายการโปรดเมื่อ Login

## ไฟล์ระบบ

- `data.js` ข้อมูลสถานที่
- `auth.js` ระบบสมาชิก
- `page-text.js` ข้อความ TH/ENG
- `common.js` ระบบร่วมทั้งสองหน้า
- `home.js` ระบบหน้าแรก
- `places.js` ระบบหน้าสถานที่
- `styles.css` CSS ทั้งระบบ


# V7 - แกลเลอรีรูปสถานที่ 3 รูป

หน้า Detail ของสถานที่มีแกลเลอรีพร้อมลูกศรซ้าย/ขวาแล้ว

## วิธีใส่รูป

นำไฟล์รูปไปใส่ใน:

```text
images/
└── phatthalung/
```

ตัวอย่างทะเลน้อย:

```text
images/phatthalung/thale-noi-1.jpg
images/phatthalung/thale-noi-2.jpg
images/phatthalung/thale-noi-3.jpg
```

ใน `data.js` จะมี:

```js
gallery: [
  "./images/phatthalung/thale-noi-1.jpg",
  "./images/phatthalung/thale-noi-2.jpg",
  "./images/phatthalung/thale-noi-3.jpg",
],
```

ถ้าต้องการ 4 หรือ 5 รูป สามารถเพิ่ม path ใน `gallery` ได้เลย
ระบบลูกศรและตัวนับรูปจะปรับตามจำนวนรูปอัตโนมัติ


# V8 - Search Autocomplete + Reviews

## Search autocomplete

เมื่อพิมพ์ เช่น:

```text
ทะเล
```

ระบบจะแสดงสถานที่ที่มีคำดังกล่าวใต้ช่องค้นหาทันที เช่น:

```text
ทะเลน้อย
...
```

เมื่อเพิ่มข้อมูลอื่น เช่น `ทะเลใหญ่` ลงใน `data.js`
ระบบจะแสดงเป็น suggestion ให้อัตโนมัติ

ระบบค้นหาจะตรวจ:
- ชื่อสถานที่ TH / ENG
- จังหวัด
- อำเภอ
- รายละเอียด
- หมวดหมู่

หน้าแรกสามารถกด suggestion แล้วระบบจะพาไป `places.html`
และเลือกสถานที่นั้นให้

## Reviews filter

หน้า `places.html` มีแท็บ:

```text
ทั้งหมด
ธรรมชาติ
ประวัติศาสตร์
ที่เที่ยว & กิจกรรม
รีวิว
```

เมื่อเลือก `รีวิว`:
- แสดงสถานที่ที่มีคะแนน
- เรียงคะแนนสูงไปต่ำ
- แสดง Rating
- แสดงจำนวน Review


# V9 - ใกล้ฉัน (Near Me)

หน้า `places.html` เพิ่มหมวดหมู่ `📍 ใกล้ฉัน`

เมื่อกด:
1. Browser จะขอสิทธิ์ตำแหน่ง
2. เว็บอ่านพิกัดปัจจุบันด้วย `navigator.geolocation`
3. คำนวณระยะทางจากผู้ใช้ถึงสถานที่
4. เรียงสถานที่ใกล้ที่สุดขึ้นก่อน
5. แสดงระยะทางบนการ์ด

ข้อมูลสถานที่ใหม่ควรเพิ่ม:
```js
lat: 7.7715,
lng: 100.1430,
```

หมายเหตุ: Geolocation ควรรันผ่าน localhost หรือ HTTPS


## Login system
ดูขั้นตอนตั้งค่า Google/Email และ Admin ที่ `LOGIN-SETUP.md`
