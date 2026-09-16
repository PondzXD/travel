# 🎨 OLED Drawing Board

เว็บวาดรูปขนาด 128×64 แล้วส่งภาพไปแสดงบน OLED SSD1306 ผ่าน ESP32 ด้วย USB Serial

## เปิดเว็บ

GitHub Pages:
https://pondzxd.github.io/travel/oled-drawing/

## อุปกรณ์
- ESP32
- OLED SSD1306 128×64 I2C

## การต่อสาย
- OLED VCC → 3.3V
- OLED GND → GND
- OLED SDA → GPIO 21
- OLED SCL → GPIO 22

## Arduino IDE
ติดตั้งไลบรารี:
- Adafruit GFX Library
- Adafruit SSD1306

เปิด `esp32_oled.ino` แล้วอัปโหลดลง ESP32 ที่ 115200 baud

## วิธีใช้
1. ต่อ ESP32 กับคอมผ่าน USB
2. เปิดเว็บด้วย Chrome หรือ Edge
3. กด `เชื่อมต่อ ESP32 ผ่าน USB`
4. เลือกพอร์ตของ ESP32
5. วาดรูปบนกระดาน
6. กด `ส่งไป OLED`

> Web Serial ต้องใช้เบราว์เซอร์ที่รองรับ และ GitHub Pages ใช้ HTTPS
