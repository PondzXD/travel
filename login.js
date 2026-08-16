let loginMode = "signin";
const $ = s => document.querySelector(s);
function setMessage(text="", type="") { $("#message").textContent=text; $("#message").className=`message ${type}`; }
function setMode(mode) {
  loginMode=mode;
  const signup=mode==="signup";
  $("#title").textContent=signup?"สมัครสมาชิก":"เข้าสู่ระบบ";
  $("#submitButton").textContent=signup?"สมัครสมาชิก":"เข้าสู่ระบบ";
  $("#switchMode").textContent=signup?"มีบัญชีแล้ว? เข้าสู่ระบบ":"ยังไม่มีบัญชี? สมัครสมาชิก";
  $("#nameWrap").classList.toggle("hidden",!signup);
  $("#confirmWrap").classList.toggle("hidden",!signup);
  $("#password").autocomplete=signup?"new-password":"current-password";
  setMessage("");
}
function destination(isAdmin) { window.location.href=isAdmin?"./admin.html":"./index.html"; }
async function routeAfterLogin() {
  const user=AuthService.getCurrentUser();
  if(!user) return;
  const admin=await AuthService.isAdmin(user);
  $("#routeNotice").textContent=admin?"บัญชี Admin → กำลังเข้าสู่หลังบ้าน…":"บัญชีผู้ใช้ → กำลังเข้าสู่เว็บไซต์…";
  destination(admin);
}
async function submit(e) {
  e.preventDefault(); setMessage("กำลังเข้าสู่ระบบ…","success"); $("#submitButton").disabled=true;
  try {
    if(loginMode==="signup") {
      if($("#password").value!==$("#confirmPassword").value) throw new Error("PASSWORD_MISMATCH");
      await AuthService.signUp($("#email").value,$("#password").value,$("#displayName").value);
    } else {
      await AuthService.signIn($("#email").value,$("#password").value);
    }
    await routeAfterLogin();
  } catch(err) {
    const map={FIREBASE_NOT_CONFIGURED:"ยังไม่ได้ตั้งค่า Firebase ใน firebase-config.js",INVALID_EMAIL:"รูปแบบอีเมลไม่ถูกต้อง",PASSWORD_TOO_SHORT:"รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",PASSWORD_MISMATCH:"รหัสผ่านไม่ตรงกัน","auth/invalid-credential":"อีเมลหรือรหัสผ่านไม่ถูกต้อง","auth/invalid-email":"อีเมลไม่ถูกต้อง","auth/email-already-in-use":"อีเมลนี้มีบัญชีอยู่แล้ว","auth/popup-closed-by-user":"ปิดหน้าต่าง Google ก่อนเข้าสู่ระบบ","auth/popup-blocked":"เบราว์เซอร์บล็อกหน้าต่าง Google กรุณาอนุญาต Popup"};
    setMessage(map[err.message]||err.message||"เข้าสู่ระบบไม่สำเร็จ");
  } finally { $("#submitButton").disabled=false; }
}
async function googleLogin(){
  try { setMessage("กำลังเปิด Google…","success"); await AuthService.signInWithGoogle(); await routeAfterLogin(); }
  catch(err){ const map={FIREBASE_NOT_CONFIGURED:"ยังไม่ได้ตั้งค่า Firebase ใน firebase-config.js","auth/popup-closed-by-user":"ปิดหน้าต่าง Google ก่อนเข้าสู่ระบบ","auth/popup-blocked":"เบราว์เซอร์บล็อก Popup ของ Google กรุณาอนุญาต Popup แล้วลองใหม่", "auth/unauthorized-domain":"โดเมนนี้ยังไม่ได้เพิ่มใน Firebase Authentication → Settings → Authorized domains", "auth/operation-not-allowed":"ยังไม่ได้เปิด Google Sign-in ใน Firebase Authentication"}; setMessage(map[err.message]||err.message||"เข้าสู่ระบบด้วย Google ไม่สำเร็จ"); }
}
document.addEventListener("DOMContentLoaded",async()=>{
  const params=new URLSearchParams(location.search); setMode(params.get("mode")==="signup"?"signup":"signin");
  $("#loginForm").addEventListener("submit",submit); $("#googleButton").addEventListener("click",googleLogin); $("#switchMode").addEventListener("click",()=>setMode(loginMode==="signin"?"signup":"signin"));
  // ไม่ redirect อัตโนมัติเมื่อเปิดหน้า Login
  // ผู้ใช้ต้องกด Login เอง เพื่อให้หน้า Login แสดงทุกครั้ง
  if(window.FIREBASE_CONFIG?.enabled){ try{ await AuthService.initFirebase(); }catch(e){ setMessage(e.message||"Firebase เริ่มต้นไม่สำเร็จ"); } }
});
