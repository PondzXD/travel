# Room Temperature Dashboard

## ไฟล์
- index.html
- style.css
- script.js

## ก่อนเปิดเว็บ
เปิด `script.js` แล้วใส่ค่า Firebase Web App config ให้ครบ:
- apiKey
- authDomain
- databaseURL
- projectId
- storageBucket
- messagingSenderId
- appId

ค่า `databaseURL` ใส่ไว้ให้แล้วตามโปรเจกต์ RoomTemperature

## โครงสร้าง Firebase ที่ใช้
room/
  temperature
  humidity

## หมายเหตุ
Dashboard นี้อ่านข้อมูลจาก Realtime Database โดยตรง และไม่ได้ทำระบบ Login สำหรับผู้เข้าชม
