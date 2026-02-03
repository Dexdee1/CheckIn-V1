// --- 🛡️ ฟังก์ชันเช็ค วินัยเหล็ก (ปรับให้รองรับรอยต่อวัน) ---
function checkShiftWindow(actionName) {
    const now = new Date();
    const currentTime = now.getHours() + (now.getMinutes() / 60);
    
    let startTime, endTime;

    if (selectedShiftName === "กะเช้า") {
        if (actionName === "เข้างาน") { startTime = 7; endTime = 9; } // 07:00 - 09:00
        else { startTime = 19; endTime = 21; } // 19:00 - 21:00
    } else if (selectedShiftName === "กะดึก") {
        if (actionName === "เข้างาน") { 
            startTime = 19; endTime = 21; // 19:00 - 21:00
        } else { 
            // กะดึกออกงานตอนเช้า (07:00 - 09:00)
            startTime = 7; endTime = 9; 
        }
    } else {
        return "NO_SHIFT";
    }

    // Logic ตรวจสอบเวลา
    if (currentTime < startTime) return "BEFORE";
    if (currentTime > endTime) return "AFTER";
    return "OK";
}

// --- 🚩 ฟังก์ชันจัดการ เข้า/ออกงาน (ปรับปรุงใหม่) ---
async function handleAction(actionName) {
    if (isProcessing) return; // ป้องกันการกดย้ำๆ
    
    const name = document.getElementById('empList').value;
    const loc = document.getElementById('locList').value;

    if (!name || !loc) return showModernToast("ข้อมูลไม่ครบ", "กรุณาเลือกชื่อและเว็บก่อนครับ", "⚠️", false);
    if (!selectedShiftName) return showModernToast("ไม่ได้เลือกกะ", "กรุณาเลือกกะทำงานก่อนครับ", "⚠️", false);

    const status = checkShiftWindow(actionName);
    const styledAction = `<b class="text-blue-600 underline">${actionName}</b>`;

    if (status === "BEFORE") {
        return showModernToast("ยังไม่ถึงเวลา", `ยังไม่ถึงช่วงเวลาแจ้ง ${styledAction} ค่ะ`, "⏳", false);
    } 
    
    if (status === "AFTER") {
        return showModernToast("เกินเวลา", `เสียใจด้วย! เกินเวลาแจ้ง ${styledAction} แล้ว<br><small>กรุณาติดต่อแอดมิน</small>`, "❌", false);
    }

    // ถ้าผ่านเงื่อนไขเวลา ให้เช็ค Cooldown ต่อ (ป้องกันการกดซ้ำใน 5 นาที)
    const cooldown = checkCooldown(name);
    if (!cooldown.canProceed) {
        return showModernToast("บันทึกซ้ำ!", `กรุณารออีก ${cooldown.wait} นาทีค่ะ`, "⏳", false);
    }

    // คำนวณโน้ต (สายกี่นาที / ก่อนกี่นาที) เพื่อส่งไปเก็บข้อมูล
    const timeNote = getSmartTimeNote(actionName, selectedShiftName);
    
    // ส่งข้อมูล
    executeSubmit(name, loc, actionName, selectedShiftName, timeNote.note, true);
}