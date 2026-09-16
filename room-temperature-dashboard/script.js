import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Firebase configuration
// ใช้ค่าจาก Firebase Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBsp0X9bEABM5XEHQ-YXQiYiJt89gt7sgM",
  authDomain: "roomtemperature-b30db.firebaseapp.com",
  databaseURL: "https://roomtemperature-b30db-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roomtemperature-b30db",
  storageBucket: "roomtemperature-b30db.firebasestorage.app",
  messagingSenderId: "ใส่_MESSAGING_SENDER_ID",
  appId: "ใส่_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const roomRef = ref(db, "room");

onValue(roomRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) {
    setConnection(false);
    return;
  }

  const temperature = Number(data.temperature);
  const humidity = Number(data.humidity);

  if (!Number.isNaN(temperature)) {
    document.getElementById("temperature").textContent = temperature.toFixed(1);
    document.getElementById("tempValue").textContent = temperature.toFixed(1) + " °C";

    // 0–50 °C สำหรับแถบแสดงผล
    const tempPercent = Math.max(0, Math.min(100, (temperature / 50) * 100));
    document.getElementById("tempBar").style.width = tempPercent + "%";
  }

  if (!Number.isNaN(humidity)) {
    document.getElementById("humidity").textContent = humidity.toFixed(0);
    document.getElementById("humidityValue").textContent = humidity.toFixed(0) + " %";

    const humidityPercent = Math.max(0, Math.min(100, humidity));
    document.getElementById("humidityBar").style.width = humidityPercent + "%";
  }

  updateRoomStatus(temperature, humidity);

  document.getElementById("lastUpdate").textContent =
    new Date().toLocaleTimeString("th-TH");

  document.getElementById("readingCount").textContent = "Live";
  setConnection(true);
}, (error) => {
  console.error("Firebase error:", error);
  setConnection(false);
});

function setConnection(connected) {
  const element = document.getElementById("connection");

  if (connected) {
    element.textContent = "● Live";
    element.className = "status online";
  } else {
    element.textContent = "● Offline";
    element.className = "status offline";
  }
}

function updateRoomStatus(temperature, humidity) {
  const status = document.getElementById("roomStatus");
  const detail = document.getElementById("statusDetail");

  if (Number.isNaN(temperature)) {
    status.textContent = "ไม่มีข้อมูล";
    detail.textContent = "รอข้อมูลจากเซนเซอร์";
    return;
  }

  if (temperature >= 35) {
    status.textContent = "อุณหภูมิสูง";
    detail.textContent = "ควรตรวจสอบอุณหภูมิในห้อง";
  } else if (temperature >= 30) {
    status.textContent = "ค่อนข้างร้อน";
    detail.textContent = "อุณหภูมิสูงกว่าช่วงทั่วไป";
  } else if (temperature >= 24) {
    status.textContent = "ปกติ";
    detail.textContent = "อุณหภูมิอยู่ในช่วงที่กำหนด";
  } else {
    status.textContent = "ค่อนข้างเย็น";
    detail.textContent = "อุณหภูมิต่ำกว่า 24 °C";
  }
}
