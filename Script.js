const API_URL = "วาง_URL_WEB_APP_ของคุณที่นี่";
let timerInterval;

window.onload = async () => {
    // 1. โหลดข้อมูลพนักงานและสถานที่ (Dropdown)
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        document.getElementById('empList').innerHTML = data.employees.map(e => `<option value="${e}">${e}</option>`).join('');
        document.getElementById('locList').innerHTML = data.locations.map(l => `<option value="${l}">${l}</option>`).join('');
    } catch (e) { console.error("โหลดข้อมูลไม่สำเร็จ"); }

    // 2. เช็คสถานะการทำงานที่ค้างไว้ (ถ้าปิดแอปแล้วเปิดใหม่)
    const savedStartTime = localStorage.getItem('workStartTime');
    if (savedStartTime) {
        startTimer(new Date(savedStartTime));
    }
};

// ฟังก์ชันเริ่มนับเวลา
function startTimer(startTime) {
    const statusBoard = document.getElementById('statusBoard');
    const timerDisplay = document.getElementById('timer');
    const startTimeText = document.getElementById('startTimeText');
    
    statusBoard.classList.remove('hidden'); // แสดงหน้าจอนับเวลา
    startTimeText.innerText = `เริ่มเมื่อ: ${startTime.toLocaleTimeString('th-TH')}`;

    // ล้าง interval เก่าถ้ามี
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = new Date();
        const diff = now - startTime;
        
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        timerDisplay.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// ฟังก์ชันบันทึกข้อมูล
async function submitData(type) {
    const now = new Date();
    const name = document.getElementById('empList').value;
    const location = document.getElementById('locList').value;

    // ระบบ Logic การเข้า-ออกงาน
    let workDuration = "";
    
    if (type.includes('เข้ากะ')) {
        localStorage.setItem('workStartTime', now);
        startTimer(now);
    } 
    
    else if (type === 'ออกงาน') {
        const startTimeStr = localStorage.getItem('workStartTime');
        if (startTimeStr) {
            const startTime = new Date(startTimeStr);
            const diff = now - startTime;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            workDuration = `${h} ชม. ${m} นาที`;
            
            if (!confirm(`คุณทำงานไปแล้ว ${workDuration} ยืนยันการออกงาน?`)) return;

            clearInterval(timerInterval);
            localStorage.removeItem('workStartTime');
            document.getElementById('statusBoard').classList.add('hidden');
        } else {
            alert("คุณยังไม่ได้กดเข้างาน!");
            return;
        }
    }

    // เตรียมข้อมูลส่งไป Google Sheets
    const payload = {
        name: name,
        location: location,
        type: type,
        duration: workDuration // ส่งเวลาที่ทำได้จริงไปบันทึกด้วย
    };

    // ส่งข้อมูล (Fetch)
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (response.ok) alert(`✅ บันทึก ${type} สำเร็จ!`);
    } catch (err) {
        alert("บันทึกไม่สำเร็จ แต่ระบบแจ้งเตือนคุณว่าทำงานเรียบร้อย");
    }
}

async function submitData(type) {
    const now = new Date();
    const name = document.getElementById('empList').value;
    const location = document.getElementById('locList').value;

    let workDuration = "";

    // 1. ถ้ากด "เข้างาน" (ไม่ว่าจะเช้าหรือดึก)
    if (type.includes('เข้างาน')) {
        localStorage.setItem('workStartTime', now);
        startTimer(now);
    } 
    
    // 2. ถ้ากด "ออกงาน" (ไม่ว่าจะเช้าหรือดึก)
    else if (type.includes('ออกงาน')) {
        const startTimeStr = localStorage.getItem('workStartTime');
        if (startTimeStr) {
            const startTime = new Date(startTimeStr);
            const diff = now - startTime;
            
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            workDuration = `${h} ชม. ${m} นาที`;
            
            if (!confirm(`ยืนยันออกงาน? (เวลาทำงาน: ${workDuration})`)) return;

            // หยุดตัวนับและล้างค่า
            clearInterval(timerInterval);
            localStorage.removeItem('workStartTime');
            document.getElementById('statusBoard').classList.add('hidden');
        } else {
            alert("⚠️ คุณยังไม่ได้กดเข้างานในระบบครับ");
            return;
        }
    }

    // 3. เตรียมข้อมูลส่งไป Google Sheet & Telegram
    const payload = {
        name: name,
        location: location,
        type: type, // จะส่งไปว่า "เข้างาน (กะเช้า)" หรือ "ออกงาน (กะดึก)"
        duration: workDuration
    };

    // ส่ง Fetch ไปที่ API_URL ของคุณ...
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (response.ok) alert(`✅ บันทึก ${type} สำเร็จ!`);
    } catch (err) {
        console.error(err);
    }
}