class LyceumAPI {
    constructor() {
        // Використовуємо реальний API або локальний сервер
        this.baseURL = 'https://your-bot-api.com/api'; // Змініть на ваш URL
        this.token = localStorage.getItem('auth_token');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
        
        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    async login(login, password) {
        try {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ login, password })
            });
            
            if (data.token) {
                this.token = data.token;
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
            }
            
            return data;
        } catch (error) {
            console.error('Помилка входу:', error);
            throw error;
        }
    }
    
    async getSchedule(day) {
        try {
            return await this.request(`/schedule?day=${encodeURIComponent(day)}`);
        } catch (error) {
            console.error('Помилка отримання розкладу:', error);
            // Повертаємо тестові дані для розробки
            return this.getMockSchedule(day);
        }
    }
    
    async getSubstitutions() {
        try {
            return await this.request('/substitutions');
        } catch (error) {
            console.error('Помилка отримання замін:', error);
            return [];
        }
    }
    
    async getCurrentLesson() {
        try {
            return await this.request('/current-lesson');
        } catch (error) {
            console.error('Помилка отримання поточного уроку:', error);
            return null;
        }
    }
    
    async syncData() {
        try {
            return await this.request('/sync', { method: 'POST' });
        } catch (error) {
            console.error('Помилка синхронізації:', error);
            throw error;
        }
    }
    
    // Тестові дані для розробки
    getMockSchedule(day) {
        const mockData = {
            'Понеділок': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Математика', teacher: 'Іваненко І.І.', classroom: '101', subgroup: null },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Українська мова', teacher: 'Петренко О.О.', classroom: '102', subgroup: null },
                { lesson_num: 3, time_range: '10:45 – 11:25', subject: 'Історія', teacher: 'Сидоренко М.М.', classroom: '103', subgroup: null },
                { lesson_num: 4, time_range: '11:30 – 12:10', subject: 'Англійська мова', teacher: 'Коваленко Т.В.', classroom: '201', subgroup: '1' }
            ],
            'Вівторок': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Фізика', teacher: 'Шевченко А.В.', classroom: '301', subgroup: null },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Хімія', teacher: 'Бондаренко Л.П.', classroom: '302', subgroup: null }
            ]
        };
        
        return mockData[day] || [];
    }
    
    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
}

const api = new LyceumAPI();
