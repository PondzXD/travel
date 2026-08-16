/*
=========================================================
FIREBASE CONFIG TEMPLATE
=========================================================

ถ้าจะเปิด Google / Facebook Login จริง
ให้สร้าง Firebase Project และเปิด Authentication Providers

จากนั้นใช้ Firebase SDK และนำ config มาใส่ในไฟล์แยก เช่น firebase-config.js

ตัวอย่าง:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

Google:
Firebase Console > Authentication > Sign-in method > Google > Enable

Facebook:
1. สร้าง Meta/Facebook App
2. นำ App ID และ App Secret ไปใส่ Firebase
3. เปิด Facebook Provider ใน Firebase Authentication
4. ตั้ง OAuth Redirect URI ตาม Firebase
=========================================================
*/
