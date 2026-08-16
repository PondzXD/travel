# Demo Admin สำเร็จรูป

เปิด `admin.html`

Username:
admin

Password:
admin1234

เวอร์ชันนี้ไม่ต้องตั้ง Firebase เพื่อทดสอบหลังบ้าน

ข้อมูลที่แก้จะบันทึกใน Browser localStorage และหน้าเว็บหลักจะอ่านข้อมูลนั้นอัตโนมัติ

รองรับ:
- เพิ่มสถานที่
- แก้สถานที่
- ลบสถานที่
- เวลาเปิดปิด
- ที่อยู่
- รีวิว/คะแนน
- พิกัด
- Google Maps
- รูปหน้าปก
- Gallery หลายรูป
- ซ่อน/แสดง
- Featured

หมายเหตุ:
รูปใน Demo จะถูกเก็บเป็น Data URL ใน localStorage จึงเหมาะกับการทดสอบเท่านั้น
ถ้าใช้งานจริงควรใช้ Firebase Authentication + Firestore + Storage
