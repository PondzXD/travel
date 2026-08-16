# Thailand Travel Guide — Login Setup

## สิ่งที่ระบบใช้
- Firebase Authentication: Email/Password + Google
- Admin routing: `firebase-config.js` → `adminEmails`
- Firestore/Storage security: allowlist เดียวกันใน `firestore.rules` และ `storage.rules`
- Firestore `admins/{uid}` รองรับการขยาย Admin ในอนาคต แต่สร้างจาก client ไม่ได้

## Admin ที่ตั้งค่าไว้
- `norrawit.pangpond@gmail.com`
- `admin@thailandtravel.com`

## ก่อนใช้งาน
1. Firebase Console → Authentication → Sign-in method → เปิด Email/Password และ Google
2. Authentication → Settings → Authorized domains → เพิ่มโดเมนที่ใช้จริง เช่น `localhost` และโดเมน Hosting ของคุณ
3. Authentication → Users → Add user เพื่อสร้าง `admin@thailandtravel.com` หากต้องการใช้บัญชีนี้แบบ Email/Password
4. ถ้าใช้ Google ให้ Google account ต้องตรงกับอีเมลใน `adminEmails`
5. Deploy `firestore.rules` และ `storage.rules`

## การทำงาน
- Admin email → `admin.html`
- User ทั่วไป → `index.html`
- ถ้าเปิด `admin.html` ตรง ๆ ระบบจะตรวจสิทธิ์อีกครั้ง
- ต่อให้แก้ JavaScript ฝั่งเครื่องเอง Firebase Rules ยังบล็อกการเขียน Places/Shops/Storage สำหรับคนที่ไม่ใช่ Admin

## หมายเหตุสำคัญ
`adminEmails` ใน JavaScript ใช้สำหรับ routing/UI เท่านั้น ไม่ใช่ตัวป้องกันฐานข้อมูลเพียงอย่างเดียว ความปลอดภัยจริงอยู่ที่ Firebase Security Rules ซึ่งมี allowlist ของ Admin ซ้ำอีกชั้น
