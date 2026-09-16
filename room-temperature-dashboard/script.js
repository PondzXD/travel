import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsp0X9bEABM5XEHQ-YXQiYiJt89gt7sgM",
  authDomain: "roomtemperature-b30db.firebaseapp.com",
  databaseURL: "https://roomtemperature-b30db-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roomtemperature-b30db",
  storageBucket: "roomtemperature-b30db.firebasestorage.app",
  messagingSenderId: "68932342663",
  appId: "1:68932342663:web:b8fd683143dbda5df67922",
  measurementId: "G-GRZ8ZECZLT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const roomRef = ref(db, "room");

const maxPoints = 30;
const labels = [];
const temperatures = [];
const humidities = [];

const tempChart = new Chart(document.getElementById("temperatureChart"), {
  type: "line",
  data: { labels, datasets: [{ label: "Temperature (°C)", data: temperatures, tension: 0.35, fill: true }] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: { y: { title: { display: true, text: "°C" } } }
  }
});

const humidityChart = new Chart(document.getElementById("humidityChart"), {
  type: "line",
  data: { labels, datasets: [{ label: "Humidity (%)", data: humidities, tension: 0.35, fill: true }] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: { y: { min: 0, max: 100, title: { display: true, text: "%" } } }
  }
});

onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) { setConnection(false); return; }

  const temperature = Number(data.temperature);
  const humidity = Number(data.humidity);
  const time = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (!Number.isNaN(temperature)) {
    document.getElementById("temperature").textContent = temperature.toFixed(1);
    document.getElementById("tempValue").textContent = temperature.toFixed(1) + " °C";
    document.getElementById("tempBar").style.width = Math.max(0, Math.min(100, (temperature / 50) * 100)) + "%";
  }

  if (!Number.isNaN(humidity)) {
    document.getElementById("humidity").textContent = humidity.toFixed(0);
    document.getElementById("humidityValue").textContent = humidity.toFixed(0) + " %";
    document.getElementById("humidityBar").style.width = Math.max(0, Math.min(100, humidity)) + "%";
  }

  // เก็บค่าที่อ่านได้ไว้ในกราฟ 30 จุดล่าสุด
  labels.push(time);
  temperatures.push(Number.isNaN(temperature) ? null : temperature);
  humidities.push(Number.isNaN(humidity) ? null : humidity);

  if (labels.length > maxPoints) {
    labels.shift();
    temperatures.shift();
    humidities.shift();
  }

  tempChart.update();
  humidityChart.update();

  document.getElementById("tempChartCount").textContent = labels.length + " points";
  document.getElementById("humidityChartCount").textContent = labels.length + " points";
  document.getElementById("lastUpdate").textContent = time;

  updateRoomStatus(temperature);
  setConnection(true);
}, (error) => {
  console.error("Firebase error:", error);
  setConnection(false);
});

function setConnection(connected) {
  const element = document.getElementById("connection");
  element.textContent = connected ? "● Live" : "● Offline";
  element.className = connected ? "status online" : "status offline";
}

function updateRoomStatus(temperature) {
  const status = document.getElementById("roomStatus");
  const detail = document.getElementById("statusDetail");

  if (Number.isNaN(temperature)) {
    status.textContent = "ไม่มีข้อมูล";
    detail.textContent = "รอข้อมูลจากเซนเซอร์";
  } else if (temperature >= 35) {
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
