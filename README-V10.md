# V10 — Admin Dashboard + Firebase

เวอร์ชันนี้เพิ่มระบบหลังบ้านสำหรับจัดการสถานที่โดยใช้ Firebase Authentication + Cloud Firestore + Cloud Storage

## ไฟล์สำคัญ

- `admin.html` หน้า Login / Dashboard หลังบ้าน
- `admin.js` เพิ่ม แก้ ลบ และ Upload รูป
- `admin.css` หน้าตาหลังบ้าน
- `firebase-config.js` ใส่ Firebase Web config
- `firebase-data.js` หน้าเว็บหลักอ่านสถานที่จาก Firestore
- `firestore.rules` กฎ Firestore
- `storage.rules` กฎ Storage
- `admin-import.html` Import ข้อมูลเดิมจาก `data.js` เข้า Firestore ครั้งแรก

## 1) ตั้งค่า Firebase

สร้าง Firebase Project และ Web App จากนั้นแก้ `firebase-config.js`

```js
window.FIREBASE_CONFIG = {
  enabled: true,
  config: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
};
```

## 2) เปิด Email/Password Authentication

Firebase Console > Authentication > Sign-in method > Email/Password > Enable

สร้างบัญชี Admin เช่น `admin@example.com`

## 3) กำหนดสิทธิ์ Admin

ดู UID ของบัญชี Admin จาก Authentication แล้วสร้าง Firestore document:

```text
admins/{ADMIN_UID}
```

ตัวอย่างข้อมูล:

```json
{
  "email": "admin@example.com",
  "role": "admin"
}
```

## 4) Firestore

สร้าง Cloud Firestore แล้วนำเนื้อหาใน `firestore.rules` ไป Publish

Collection หลัก:

```text
places/{placeId}
admins/{uid}
```

ผู้ใช้ทั่วไปอ่าน `places` ได้ แต่เฉพาะ UID ที่มีใน `admins` จึงเพิ่ม/แก้/ลบได้

## 5) Storage

เปิด Firebase Storage และนำ `storage.rules` ไป Publish

รูปจะถูกเก็บประมาณ:

```text
places/{placeId}/cover/...
places/{placeId}/gallery/...
```

## 6) ย้ายข้อมูลพัทลุงเดิมเข้า Firestore

เปิด `admin-import.html`

Login ด้วย Admin แล้วกด Import ระบบจะส่งข้อมูลจาก `data.js` เข้า `places` ใน Firestore

## 7) เข้าใช้งานหลังบ้าน

เปิด `admin.html`

หลัง Login สามารถ:

- เพิ่มสถานที่
- แก้ชื่อ TH / EN
- เลือกภาค / จังหวัด / หมวดหมู่
- แก้รายละเอียด / ที่อยู่
- เวลาเปิด / ปิด
- เบอร์โทร
- Rating / จำนวนรีวิว
- Latitude / Longitude
- Google Maps URL / Embed URL
- Upload รูปหน้าปก
- Upload Gallery หลายรูป
- ซ่อน / แสดงสถานที่
- ตั้งเป็นสถานที่แนะนำหน้าแรก
- ลบสถานที่

## การทำงานของหน้าเว็บหลัก

ถ้า `firebase-config.js` ตั้ง `enabled: true` หน้า `index.html` และ `places.html` จะอ่านข้อมูลจาก Firestore

ถ้ายังไม่ได้ตั้ง Firebase ระบบจะ fallback ไปใช้ `data.js` เดิม จึงยังเปิดเว็บทดลองได้

## หมายเหตุด้านความปลอดภัย

Admin password ไม่ได้ถูกเขียนไว้ใน JavaScript หน้าเว็บ แต่ใช้ Firebase Authentication และ Rules ควบคุมสิทธิ์การเขียนข้อมูล
