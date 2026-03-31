// Глобальні змінні
let currentDay = 'Понеділок';
let currentUser = null;

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    // Тимчасово відключаємо push та service worker для розробки
    // setupPushNotifications();
    // setupOfflineSupport();
});

// Перевірка авторизації
async function checkAuth() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUI();
        await loadData();
    } else {
        showLoginScreen();
    }
}

// Показати екран входу
function showLoginScreen() {
    const loginHTML = `
        <div class="login-screen">
            <div class="login-card">
                <div class="login-logo">🏫</div>
                <h2>Ліцей Бот</h2>
                <p style="color: #666; margin-bottom: 20px;">Демо вхід: admin / admin123</p>
                <input type="text" id="login" placeholder="Логін" class="login-input">
                <input type="password" id="password" placeholder="Пароль" class="login-input">
                <button onclick="doLogin()" class="login-btn">Увійти</button>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.app-container');
    if (container) {
        container.innerHTML = loginHTML;
    }
}

// Виконання входу
window.doLogin = async function() {
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        const result = await api.login(login, password);
        currentUser = result.user;
        updateUI();
        await loadData();
        hideLoading();
        location.reload();
    } catch (error) {
        hideLoading();
        alert('Помилка входу: ' + error.message);
    }
};

// Оновлення UI після входу
function updateUI() {
    if (!currentUser) return;
    
    const userNameSpan = document.getElementById('userName');
    const profileNameSpan = document.getElementById('profileName');
    const profileRoleSpan = document.getElementById('profileRole');
    const profileGroupSpan = document.getElementById('profileGroup');
    const profileSubgroupSpan = document.getElementById('profileSubgroup');
    
    if (userNameSpan) userNameSpan.textContent = currentUser.full_name;
    if (profileNameSpan) profileNameSpan.textContent = currentUser.full_name;
    if (profileRoleSpan) profileRoleSpan.textContent = currentUser.role;
    if (profileGroupSpan) profileGroupSpan.textContent = currentUser.group_name || '—';
    if (profileSubgroupSpan) profileSubgroupSpan.textContent = currentUser.subgroup || '—';
}

// Завантаження даних
async function loadData() {
    await Promise.all([
        loadSchedule(currentDay),
        loadSubstitutions(),
        loadCurrentLesson()
    ]);
}

// Завантаження розкладу
async function loadSchedule(day) {
    showLoading();
    try {
        const data = await api.getSchedule(day);
        displaySchedule(data);
        const currentDaySpan = document.getElementById('currentDay');
        if (currentDaySpan) currentDaySpan.textContent = day;
    } catch (error) {
        console.error('Помилка завантаження розкладу:', error);
        showError('Не вдалося завантажити розклад');
    }
    hideLoading();
}

// Відображення розкладу
function displaySchedule(lessons) {
    const container = document.getElementById('scheduleList');
    
    if (!container) return;
    
    if (!lessons || lessons.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Немає уроків</div>';
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

// Завантаження замін
async function loadSubstitutions() {
    try {
        const data = await api.getSubstitutions();
        displaySubstitutions(data);
    } catch (error) {
        console.error('Помилка завантаження замін:', error);
    }
}

function displaySubstitutions(substitutions) {
    const container = document.getElementById('substitutionsList');
    
    if (!container) return;
    
    if (!substitutions || substitutions.length === 0) {
        container.innerHTML = '<div class="empty-state">✅ Сьогодні замін немає</div>';
        return;
    }
    
    container.innerHTML = substitutions.map(sub => `
        <div class="substitution-card">
            <strong>${sub.lesson_num}-й урок</strong>
            <p>❌ ${sub.old_teacher}</p>
            <p>✅ ${sub.new_teacher}</p>
            <p>🏫 ${sub.classroom || 'той самий'}</p>
        </div>
    `).join('');
}

// Поточний урок
async function loadCurrentLesson() {
    try {
        const lesson = await api.getCurrentLesson();
        displayCurrentLesson(lesson);
    } catch (error) {
        console.error('Помилка завантаження поточного уроку:', error);
    }
}

function displayCurrentLesson(lesson) {
    const container = document.getElementById('currentLesson');
    
    if (!container) return;
    
    if (!lesson) {
        container.innerHTML = '<div class="empty-state">⏰ Зараз немає уроків</div>';
        return;
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    
    container.innerHTML = `
        <div class="current-lesson-card">
            <div>⏰ ${timeString}</div>
            <div class="current-time">${lesson.lesson_num}-й урок</div>
            <div class="lesson-subject">${lesson.subject}</div>
            <div>👨‍🏫 ${lesson.teacher}</div>
            <div>🏫 ${lesson.classroom}</div>
        </div>
    `;
}

// Зміна дня
window.changeDay = async function(direction) {
    const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця'];
    const currentIndex = days.indexOf(currentDay);
    
    if (direction === 'prev' && currentIndex > 0) {
        currentDay = days[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < days.length - 1) {
        currentDay = days[currentIndex + 1];
    }
    
    await loadSchedule(currentDay);
};

// Сьогоднішній день
window.setToday = async function() {
    const today = new Date();
    const dayMap = {
        1: 'Понеділок',
        2: 'Вівторок',
        3: 'Середа',
        4: 'Четвер',
        5: 'П\'ятниця',
        6: 'Субота',
        7: 'Неділя'
    };
    
    const dayNumber = today.getDay();
    const dayName = dayMap[dayNumber] || 'Понеділок';
    
    if (dayName !== 'Субота' && dayName !== 'Неділя') {
        currentDay = dayName;
    } else {
        currentDay = 'Понеділок';
    }
    
    await loadSchedule(currentDay);
};

// Синхронізація даних
window.syncData = async function() {
    showLoading();
    try {
        await api.syncData();
        await loadData();
        showToast('Дані синхронізовано');
    } catch (error) {
        showError('Помилка синхронізації');
    }
    hideLoading();
};

// Вихід
window.logout = function() {
    if (api) {
        api.logout();
    }
    location.reload();
};

// Допоміжні функції
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showError(message) {
    alert(message);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: fadeInOut 3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Налаштування обробників подій
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) activeTab.classList.add('active');
}
