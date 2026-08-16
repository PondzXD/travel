/* Firebase Web App config for Thailand Travel Guide */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByuyvHxWy0tJF05bTIXclj4luiUHZTeTY",
  authDomain: "thailand-travel-guide-8e36f.firebaseapp.com",
  projectId: "thailand-travel-guide-8e36f",
  storageBucket: "thailand-travel-guide-8e36f.firebasestorage.app",
  messagingSenderId: "382201823932",
  appId: "1:382201823932:web:e0e00cfdd3ee04ee1746b9",
  measurementId: "G-1NPHWBZPCG"
};

const adminEmails = [
  "norrawit.pangpond@gmail.com",
  "admin@thailandtravel.com"
];

// รูปแบบมาตรฐานที่ AuthService ใช้
window.FIREBASE_CONFIG = {
  enabled: true,
  config: firebaseConfig,
  adminEmails
};
window.ADMIN_EMAILS = adminEmails;
