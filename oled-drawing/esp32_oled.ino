#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

uint8_t bitmap[1024];
String input = "";

void setup() {
  Serial.begin(115200);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    while (true) delay(1000);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(20, 28);
  display.println("OLED READY");
  display.display();
}

void loop() {
  while (Serial.available()) {
    char ch = Serial.read();
    if (ch == '\n') {
      processLine(input);
      input = "";
    } else if (ch != '\r') {
      input += ch;
      if (input.length() > 1500) input = "";
    }
  }
}

int b64val(char c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= 'a' && c <= 'z') return c - 'a' + 26;
  if (c >= '0' && c <= '9') return c - '0' + 52;
  if (c == '+') return 62;
  if (c == '/') return 63;
  return -1;
}

int decodeBase64(const String &s, uint8_t *out, int maxOut) {
  int outLen = 0, val = 0, valb = -8;
  for (int i = 0; i < s.length(); i++) {
    int v = b64val(s[i]);
    if (v < 0) continue;
    val = (val << 6) | v;
    valb += 6;
    if (valb >= 0) {
      if (outLen >= maxOut) return outLen;
      out[outLen++] = (val >> valb) & 0xFF;
      valb -= 8;
    }
  }
  return outLen;
}

void processLine(const String &line) {
  if (!line.startsWith("OLED:")) return;
  String encoded = line.substring(5);
  int len = decodeBase64(encoded, bitmap, sizeof(bitmap));
  if (len != 1024) {
    Serial.println("ERR:BAD_BITMAP");
    return;
  }
  display.clearDisplay();
  display.drawBitmap(0, 0, bitmap, 128, 64, SSD1306_WHITE);
  display.display();
  Serial.println("OK");
}
