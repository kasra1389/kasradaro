/**
 * ==============================================
 * 📌 [1] انتخاب المان‌های DOM
 * ==============================================
 *///کسری
const chatMessages = document.getElementById('chatMessages'); // کانتینر پیام‌ها
const userInput = document.getElementById('userInput'); // فیلد ورودی کاربر
const chatHistory = document.getElementById('chatHistory'); // تاریخچه چت‌ها
const profileInfo = document.getElementById('profileInfo'); // پروفایل کاربر
const sidebar = document.getElementById('sidebar'); // سایدبار
const settingsPanel = document.getElementById('settingsPanel'); // پنل تنظیمات
const contactInfo = document.getElementById('contactInfo'); // اطلاعات تماس
const fontSizeSlider = document.getElementById('fontSizeSlider'); // اسلایدر اندازه فونت
const dateTime = document.getElementById('dateTime'); // نمایش تاریخ و ساعت
const sendSound = document.getElementById('sendSound'); // صدای ارسال پیام
const receiveSound = document.getElementById('receiveSound'); // صدای دریافت پیام
const searchInput = document.getElementById('searchInput'); // فیلد جستجو

/**
 * ==============================================
 * 📌 [2] متغیرهای اصلی برنامه
 * ==============================================
 */
let chatSessions = []; // لیست تمام چت‌های کاربر
let currentChatId = 0; // ID چت فعلی
let currentTheme = 'neon'; // تم پیش‌فرض (نئونی)
let currentLanguage = 'fa'; // زبان پیش‌فرض (فارسی)
let messageAnimation = 'slideIn'; // انیمیشن پیام‌ها
let isSending = false; // وضعیت ارسال پیام (برای جلوگیری از ارسال چندباره)

/**
 * ==============================================
 * 📌 [3] سیستم ذرات (Particle.js)
 * ==============================================
 */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
const numberOfParticles = 50; // تعداد ذرات (برای بهینه‌سازی کاهش یافته)

// کلاس ذره
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width; // موقعیت X تصادفی
        this.y = Math.random() * canvas.height; // موقعیت Y تصادفی
        this.size = Math.random() * 3 + 1; // اندازه ذره
        this.speedX = Math.random() * 0.5 - 0.25; // سرعت افقی
        this.speedY = Math.random() * 0.5 - 0.25; // سرعت عمودی
        this.color = this.getColor(); // رنگ بر اساس تم
    }

    // انتخاب رنگ بر اساس تم فعلی
    getColor() {
        switch (currentTheme) {
            case 'neon': return `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // آبی-فیروزه‌ای
            case 'gold': return `hsl(${Math.random() * 30 + 40}, 100%, 50%)`; // طلایی
            case 'silver': return `hsl(${Math.random() * 30 + 0}, 20%, 70%)`; // نقره‌ای
            case 'rosegold': return `hsl(${Math.random() * 30 + 0}, 100%, 70%)`; // رزگلد
            default: return `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // پیش‌فرض
        }
    }
//کسری
    // به‌روزرسانی موقعیت ذره
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // کاهش اندازه ذره با زمان
        if (this.size > 0.2) this.size -= 0.03;
        
        // برخورد با دیواره‌ها
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    // رسم ذره روی کانوا
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
    }
}

// مقداردهی اولیه ذرات
function initParticles() {
    particlesArray.length = 0;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// انیمیشن ذرات
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // جایگزینی ذرات کوچک با ذرات جدید
        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1);
            i--;
            particlesArray.push(new Particle());
        }
    }
    requestAnimationFrame(animateParticles);
}

// شروع سیستم ذرات
initParticles();
animateParticles();

/**
 * ==============================================
 * 📌 [4] توابع اصلی چت
 * ==============================================
 */
//کسری شیر علی زاده
// ارسال پیام به ChatGPT
async function sendToChatGPT(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY' // 🔴 جایگزین کنید!
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("خطا در ارتباط با ChatGPT:", error);
        return currentLanguage === 'fa' ? 'خطا در ارتباط با سرور!' : 'Server Error!';
    }
}

// ارسال پیام کاربر
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '' || isSending) return;
    
    isSending = true;
    sendSound.play(); // پخش صدای ارسال
    
    // نمایش پیام کاربر
    addMessage(messageText, 'user');
    userInput.value = '';
    
    // ذخیره در تاریخچه
    if (!chatSessions[currentChatId]) {
        chatSessions[currentChatId] = { 
            name: currentLanguage === 'fa' ? `چت ${currentChatId + 1}` : `Chat ${currentChatId + 1}`, 
            messages: [] 
        };
    }
    chatSessions[currentChatId].messages.push({ text: messageText, sender: 'user' });
    updateChatHistory();
    
    // نمایش وضعیت "در حال پردازش..."
    addMessage(currentLanguage === 'fa' ? 'در حال پردازش...' : 'Processing...', 'bot');
    
    // دریافت پاسخ از ChatGPT
    const chatGPTResponse = await sendToChatGPT(messageText);
    addMessage(chatGPTResponse, 'bot');
    chatSessions[currentChatId].messages.push({ text: chatGPTResponse, sender: 'bot' });
    
    receiveSound.play(); // پخش صدای دریافت
    isSending = false;
}

// اضافه کردن پیام به چت
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender, messageAnimation);
    messageDiv.textContent = text;
    
    // اضافه کردن دکمه‌های لایک/دیس‌لایک برای پیام‌های ربات
    if (sender === 'bot') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="like-btn" onclick="likeMessage(this)">👍 <span>0</span></button>
            <button class="dislike-btn" onclick="dislikeMessage(this)">👎 <span>0</span></button>
        `;
        messageDiv.appendChild(actionsDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // اسکرول به پایین
}

// لایک کردن پیام
function likeMessage(button) {
    const likeCount = button.querySelector('span');
    likeCount.textContent = parseInt(likeCount.textContent) + 1;
    button.style.backgroundColor = 'rgba(0, 212, 255, 0.3)';
}

// دیس‌لایک کردن پیام
function dislikeMessage(button) {
    const dislikeCount = button.querySelector('span');
    dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
    button.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
}

// به‌روزرسانی تاریخچه چت
function updateChatHistory() {
    const fragment = document.createDocumentFragment();
    
    chatSessions.forEach((session, index) => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.innerHTML = `
            <div>
                <h4>${session.name}</h4>
                <p>${session.messages[0]?.text.slice(0, 20)}...</p>
            </div>
            <div class="chat-actions">
                <button onclick="editChatName(${index})">✏️</button>
                <button onclick="deleteChat(${index})">🗑️</button>
            </div>
        `;
        
        chatItem.onclick = (e) => {
            if (!e.target.closest('.chat-actions')) loadChat(index);
        };
        
        fragment.appendChild(chatItem);
    });
    
    chatHistory.innerHTML = '';
    chatHistory.appendChild(fragment);
}

// بارگذاری چت از تاریخچه
function loadChat(chatId) {
    currentChatId = chatId;
    chatMessages.innerHTML = '';
    chatSessions[chatId].messages.forEach(msg => {
        addMessage(msg.text, msg.sender);
    });
}

// شروع چت جدید
function newChat() {
    chatMessages.innerHTML = '';
    currentChatId = chatSessions.length;
    chatSessions.push({ 
        name: currentLanguage === 'fa' ? `چت ${currentChatId + 1}` : `Chat ${currentChatId + 1}`, 
        messages: [] 
    });
    
    // پیام خوش‌آمدگویی
    const welcomeMsg = currentLanguage === 'fa' 
        ? 'سلام! من چت‌بات کسری دارو هستم.' 
        : 'Hello! I am Kasri Daru Chatbot.';
    
    addMessage(welcomeMsg, 'bot');
    chatSessions[currentChatId].messages.push({ text: welcomeMsg, sender: 'bot' });
    updateChatHistory();
}

// ویرایش نام چت
function editChatName(chatId) {
    const newName = prompt(
        currentLanguage === 'fa' ? 'نام جدید چت را وارد کنید:' : 'Enter new chat name:',
        chatSessions[chatId].name
    );
    if (newName) {
        chatSessions[chatId].name = newName;
        updateChatHistory();
    }
}

// حذف چت
function deleteChat(chatId) {
    if (confirm(
        currentLanguage === 'fa' 
            ? 'آیا مطمئن هستید که می‌خواهید این چت را حذف کنید؟' 
            : 'Are you sure you want to delete this chat?'
    )) {
        chatSessions.splice(chatId, 1);
        if (currentChatId === chatId) {
            chatMessages.innerHTML = '';
            currentChatId = chatSessions.length ? 0 : -1;
            if (currentChatId >= 0) loadChat(currentChatId);
        } else if (currentChatId > chatId) {
            currentChatId--;
        }
        updateChatHistory();
    }
}

/**
 * ==============================================
 * 📌 [5] توابع رابط کاربری
 * ==============================================
 */

// نمایش/مخفی کردن سایدبار
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

// نمایش/مخفی کردن تنظیمات
function toggleSettings() {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
}

// نمایش/مخفی کردن پروفایل
function toggleProfile() {
    profileInfo.style.display = profileInfo.style.display === 'none' ? 'block' : 'none';
}

// نمایش/مخفی کردن اطلاعات تماس
function toggleContact() {
    contactInfo.style.display = contactInfo.style.display === 'none' ? 'block' : 'none';
}

// تغییر تم
function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    currentTheme = themeSelect.value;
    document.body.className = `${currentTheme}-theme`;
    initParticles(); // بازسازی ذرات با رنگ جدید
}

// تغییر فونت
function changeFont() {
    const fontSelect = document.getElementById('fontSelect');
    document.body.style.fontFamily = `'${fontSelect.value}', 'Vazir', sans-serif`;
}

// تغییر اندازه فونت
function changeFontSize() {
    document.body.style.fontSize = `${fontSizeSlider.value}px`;
}

// تغییر زبان
function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    currentLanguage = languageSelect.value;
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', currentLanguage === 'fa' ? 'rtl' : 'ltr');
    updateUIText(); // به‌روزرسانی متن‌های UI
}

// به‌روزرسانی متن‌های UI بر اساس زبان
function updateUIText() {
    // 🔴 (کدهای طولانی - در نسخه کامل موجود است)
}

// بازدید از سایت
function visitSite() {
    window.open('https://kasridaru.com', '_blank');
}

// جستجو در تاریخچه
function handleSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    
    const results = [];
    chatSessions.forEach((session, chatId) => {
        session.messages.forEach((msg, msgId) => {
            if (msg.text.toLowerCase().includes(keyword.toLowerCase())) {
                results.push({ chatId, msgId, ...msg });
            }
        });
    });
    
    if (results.length === 0) {
        alert(currentLanguage === 'fa' ? 'نتیجه‌ای یافت نشد!' : 'No results found!');
        return;
    }
    
    // نمایش نتایج
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.innerHTML = `<h3>${results.length} نتیجه یافت شد</h3>`;
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <p><strong>${chatSessions[result.chatId].name}</strong></p>
            <p>${result.text}</p>
            <button onclick="loadChat(${result.chatId})">مشاهده چت</button>
        `;
        searchResults.appendChild(resultItem);
    });
    
    chatMessages.innerHTML = '';
    chatMessages.appendChild(searchResults);
}

// به‌روزرسانی تاریخ و ساعت
function updateDateTime() {
    const now = new Date();
    dateTime.textContent = now.toLocaleString(currentLanguage === 'fa' ? 'fa-IR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}
setInterval(updateDateTime, 1000);

// ارسال پیام با کلید Enter
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isSending) {
        sendMessage();
    }
});

// پیام خوش‌آمدگویی اولیه
window.onload = () => {
    newChat(); // شروع یک چت جدید
    updateDateTime(); // نمایش ساعت
};


//کسری