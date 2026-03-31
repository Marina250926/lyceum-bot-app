// ==========================================
// ГЛОБАЛЬНІ ЗМІННІ ТА КОНСТАНТИ
// ==========================================
const DAYS_ORDER = ["Понеділок", "Вівторок", "Середа", "Четвер", "П\'ятниця"];
let currentDay = "Понеділок";
let currentUser = null;

// ==========================================
// ІНІЦІАЛІЗАЦІЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    await checkAuth();
    setupOfflineSupport();
    setupPushNotifications();
}

// ==========================================
// АВТОРИЗАЦІЯ ТА UI
// ==========================================
async function checkAuth() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            setToday(); // Встановлюємо актуальний день
            updateFullUI(); // Оновлюємо весь інтерфейс
            await loadData();
        } catch (e) {
            console.error("Помилка парсингу даних користувача");
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    const loginHTML = `
        <div class="login-screen">
            <div class="login-card">
                <img src="assets/logo.png" alt="Logo" class="login-logo">
                <h2>Ліцей Бот</h2>
                <div class="login-form">
                    <input type="text" id="login" placeholder="Логін" class="login-input">
                    <input type="password" id="password" placeholder="Пароль" class="login-input">
                    <button onclick="doLogin()" class="login-btn">Увійти</button>
                </div>
            </div>
        </div>
    `;
    const container = document.querySelector('.app-container');
    if (container) container.innerHTML = loginHTML;
}

async function doLogin() {
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    
    if (!loginInput.value || !passwordInput.value) {
        alert("Введіть логін та пароль");
        return;
    }

    showLoading();
    try {
        const result = await api.login(loginInput.value, passwordInput.value);
        currentUser = result.user;
        // Зберігаємо дані
        localStorage.setItem('user_data', JSON.stringify(currentUser));
        localStorage.setItem('user_token', result.token);
        
        location.reload(); // Перезавантаження для чистої ініціалізації
    } catch (error) {
        hideLoading();
        alert('Помилка входу: ' + error.message);
    }
}

function updateFullUI() {
    if (!currentUser) return;
    
    // Оновлення імен (в шапці та профілі)
    const nameElements = ['userName', 'profileName'];
    nameElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser.full_name || currentUser.name;
    });

    // Оновлення полів профілю
    const fields = {
        'profileRole': currentUser.role,
        'profileGroup': currentUser.group_name || '—',
        'profileSubgroup': currentUser.subgroup || '—'
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Оновлення тексту дня
    const dayText = document.getElementById('currentDay');
    if (dayText) dayText.textContent = currentDay;
}

// ==========================================
// РОБОТА З ДАНИМИ
// ==========================================
async function loadData() {
    showLoading();
    try {
        await Promise.all([
            loadSchedule(currentDay),
            loadSubstitutions(),
            loadCurrentLesson()
        ]);
    } catch (error) {
        console.error("Помилка завантаження даних:", error);
    } finally {
        hideLoading();
    }
}

async function loadSchedule(day) {
    try {
        const data = await api.getSchedule(day);
        displaySchedule(data);
        const dayEl = document.getElementById('currentDay');
        if (dayEl) dayEl.textContent = day;
    } catch (error) {
        console.error('Помилка розкладу:', error);
    }
}

function displaySchedule(lessons) {
    const container = document.getElementById('scheduleList');
    if (!container) return;
    
    if (!lessons || lessons.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 На цей день занять немає</div>';
        return;
    }
    
    container.innerHTML = lessons.map(lesson => `
        <div class="lesson-card">
            <div class="lesson-time">${lesson.lesson_num}-й урок | ${lesson.time_range || ''}</div>
            <div class="lesson-subject">${lesson.subject}</div>
            <div class="lesson-details">
                <p>👨‍🏫 ${lesson.teacher}</p>
                <p>🏫 ${lesson.classroom}</p>
                ${lesson.subgroup ? `<p>🔹 Підгрупа ${lesson.subgroup}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// КЕРУВАННЯ КАЛЕНДАРЕМ
// ==========================================
function changeDay(direction) {
    let index = DAYS_ORDER.indexOf(currentDay);
    if (direction === 'next') {
        index = (index + 1) % DAYS_ORDER.length;
    } else {
        index = (index - 1 + DAYS_ORDER.length) % DAYS_ORDER.length;
    }
    currentDay = DAYS_ORDER[index];
    
    const dayEl = document.getElementById('currentDay');
    if (dayEl) dayEl.textContent = currentDay;
    
    loadSchedule(currentDay);
}

function setToday() {
    const date = new Date();
    const dayIndex = date.getDay(); // 0 - Нд, 1 - Пн...
    
    if (dayIndex === 0 || dayIndex === 6) {
        currentDay = "Понеділок"; 
    } else {
        currentDay = DAYS_ORDER[dayIndex - 1];
    }
    
    const dayEl = document.getElementById('currentDay');
    if (dayEl) dayEl.textContent = currentDay;
}

// ==========================================
// СЕРВІСНІ ФУНКЦІЇ (Push, Offline, Loading)
// ==========================================
async function setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const sw = await navigator.serviceWorker.ready;
                const subscription = await sw.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'BHsZGAU8DED4TsUZ0UygHuZWzqVKv2nWJYxsYbYHL3iHYYgseKpYtr2U3YxgRf4wpIqPlqCkmWEUC0oLSS1TvCI'
                });
                
                await api.request('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(subscription)
                });
            }
        } catch (e) {
            console.log("Push-сповіщення не підтримуються або відхилені");
        }
    }
}

function setupOfflineSupport() {
    if ('serviceWorker' in navigator) {
        // Використовуємо відносний шлях для GitHub Pages
        navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW error:", err));
    }
    window.addEventListener('online', () => syncData());
}

async function syncData() {
    showLoading();
    try {
        if (api.syncData) await api.syncData();
        await loadData();
        showToast('Дані синхронізовано');
    } catch (error) {
        showError('Помилка синхронізації');
    } finally {
        hideLoading();
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Залишаємо старі функції для сумісності з вашими api.js
async function loadSubstitutions() {
    try {
        const data = await api.getSubstitutions();
        const container = document.getElementById('substitutionsList');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">✅ Замін немає</div>';
            return;
        }
        container.innerHTML = data.map(sub => `
            <div class="substitution-card">
                <strong>${sub.lesson_num}-й урок</strong>
                <p>❌ ${sub.old_teacher}</p>
                <p>✅ ${sub.new_teacher}</p>
                <p>🏫 ${sub.classroom || 'той самий'}</p>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function loadCurrentLesson() {
    try {
        const lesson = await api.getCurrentLesson();
        const container = document.getElementById('currentLesson');
        if (!container) return;
        if (!lesson) {
            container.innerHTML = '<div class="empty-state">⏰ Уроків зараз немає</div>';
            return;
        }
        container.innerHTML = `
            <div class="current-lesson-card">
                <div class="current-time">${lesson.lesson_num}-й урок</div>
                <div class="lesson-subject">${lesson.subject}</div>
                <div>👨‍🏫 ${lesson.teacher}</div>
                <div>🏫 ${lesson.classroom}</div>
            </div>
        `;
    } catch (e) { console.error(e); }
}
