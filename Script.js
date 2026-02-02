// --- 🛡️ ฟังก์ชันเช็ค วินัยเหล็ก (ปรับให้ตรงกับตัวแปรในระบบ) ---
function checkShiftWindow(actionName) {
    const now = new Date();
    const currentTime = now.getHours() + (now.getMinutes() / 60);
    
    let startTime, endTime;

    // ใช้ selectedShiftName ให้ตรงกับที่ฟังก์ชัน selectShift() บันทึกไว้
    if (selectedShiftName === "กะเช้า") {
        if (actionName === "เข้างาน") { startTime = 7; endTime = 9; }
        else { startTime = 19; endTime = 21; }
    } else if (selectedShiftName === "กะดึก") {
        if (actionName === "เข้างาน") { startTime = 19; endTime = 21; }
        else { startTime = 7; endTime = 9; }
    } else {
        return "NO_SHIFT"; // ยังไม่ได้เลือกกะ
    }

    if (currentTime < startTime) {
        return "BEFORE"; // มาก่อนเวลาเริ่ม
    } else if (currentTime > endTime) {
        return "AFTER";  // มาหลังเวลาสิ้นสุด
    } else {
        return "OK";     // อยู่ในช่วงเวลาพอดี
    }
}

// --- 🚩 ฟังก์ชันจัดการ เข้า/ออกงาน ---
async function handleAction(actionName) {
    const name = document.getElementById('empList').value;
    const loc = document.getElementById('locList').value;

    if (!name || !loc) return showPopup("⚠️ กรุณาเลือกชื่อและสถานที่ก่อนครับ");
    if (!selectedShiftName) return showPopup("⚠️ กรุณาเลือกกะทำงานก่อนครับ");

    const status = checkShiftWindow(actionName);
    const styledAction = `<b><u>${actionName}</u></b>`; // ตัวหนาขีดเส้นใต้

    if (status === "BEFORE") {
        showPopup(`⏳ ยังไม่ถึงเวลา ${styledAction} กรรุนารอ`);
        return;
    } 
    
    if (status === "AFTER") {
        showPopup(`❌ เสียใจด้วย! เกินเวลาที่กำหนดแจ้ง ${styledAction} แล้ว<br><small class="text-slate-400 font-normal">กรุณารอแจ้งในรอบถัดไป</small>`);
        return;
    }

    if(confirm(`ยืนยันการบันทึก [${actionName}] ?`)) {
        // ใช้ sendData ที่มีอยู่เดิมในโค้ดของนาย เพื่อความเสถียร
        sendData(name, loc, actionName, selectedShiftName, "บันทึกปกติ");
    }
}

// --- 🛡️ ฟังก์ชันแสดง Popup (รองรับ HTML) ---
function showPopup(msgHTML, isSuccess = false) {
    const modal = document.getElementById('customAlert'); 
    const msgElement = document.getElementById('alertMsg');
    const iconElement = document.getElementById('alertIcon');

    if (msgElement && iconElement) {
        msgElement.innerHTML = msgHTML; // ใช้ innerHTML เพื่อแสดงตัวหนา
        iconElement.innerText = isSuccess ? "✅" : "❌";
        modal.classList.remove('hidden');
    }
}