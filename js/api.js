class LyceumAPI {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }
    
    async request(endpoint, options = {}) {
        // Симуляція затримки мережі
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Тестові дані для входу
        if (endpoint === '/auth/login') {
            const body = JSON.parse(options.body);
            const { login, password } = body;
            
            // Демо-користувачі
            if (login === 'admin' && password === 'admin123') {
                return {
                    token: 'demo_token_admin',
                    user: {
                        full_name: 'Адміністратор Системи',
                        role: 'admin',
                        group_name: '',
                        subgroup: ''
                    }
                };
            } else if (login === 'teacher' && password === 'teacher123') {
                return {
                    token: 'demo_token_teacher',
                    user: {
                        full_name: 'Іваненко Іван Іванович',
                        role: 'teacher',
                        group_name: '8-А',
                        subgroup: ''
                    }
                };
            } else if (login === 'student' && password === 'student123') {
                return {
                    token: 'demo_token_student',
                    user: {
                        full_name: 'Петренко Петро Петрович',
                        role: 'student',
                        group_name: '8-А',
                        subgroup: '1'
                    }
                };
            } else {
                throw new Error('Невірний логін або пароль');
            }
        }
        
        // Розклад
        if (endpoint === '/schedule') {
            return this.getMockSchedule();
        }
        
        // Заміни
        if (endpoint === '/substitutions') {
            return [];
        }
        
        // Поточний урок
        if (endpoint === '/current-lesson') {
            return null;
        }
        
        // Синхронізація
        if (endpoint === '/sync') {
            return { success: true, timestamp: new Date().toISOString() };
        }
        
        return {};
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
        return this.getMockSchedule(day);
    }
    
    async getSubstitutions() {
        return [];
    }
    
    async getCurrentLesson() {
        return null;
    }
    
    async syncData() {
        return await this.request('/sync', { method: 'POST' });
    }
    
    getMockSchedule(day) {
        const mockData = {
            'Понеділок': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Математика', teacher: 'Іваненко І.І.', classroom: '101' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Українська мова', teacher: 'Петренко О.О.', classroom: '102' },
                { lesson_num: 3, time_range: '10:45 – 11:25', subject: 'Історія України', teacher: 'Сидоренко М.М.', classroom: '103' },
                { lesson_num: 4, time_range: '11:30 – 12:10', subject: 'Англійська мова', teacher: 'Коваленко Т.В.', classroom: '201' },
                { lesson_num: 5, time_range: '13:00 – 13:40', subject: 'Фізика', teacher: 'Шевченко А.В.', classroom: '301' }
            ],
            'Вівторок': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Хімія', teacher: 'Бондаренко Л.П.', classroom: '302' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Біологія', teacher: 'Ковальчук Н.В.', classroom: '303' },
                { lesson_num: 3, time_range: '10:45 – 11:25', subject: 'Географія', teacher: 'Мельник О.І.', classroom: '304' }
            ],
            'Середа': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Зарубіжна література', teacher: 'Гриценко Т.М.', classroom: '105' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Інформатика', teacher: 'Романенко В.В.', classroom: '202' },
                { lesson_num: 3, time_range: '10:45 – 11:25', subject: 'Алгебра', teacher: 'Іваненко І.І.', classroom: '101' }
            ],
            'Четвер': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Фізкультура', teacher: 'Спортивний О.П.', classroom: 'Спортзал' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Музика', teacher: 'Музченко І.І.', classroom: '106' },
                { lesson_num: 3, time_range: '10:45 – 11:25', subject: 'Трудове навчання', teacher: 'Трудовий М.П.', classroom: 'Майстерня' }
            ],
            'П\'ятниця': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Основи здоров\'я', teacher: 'Здорова Н.В.', classroom: '107' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Мистецтво', teacher: 'Артченко О.О.', classroom: '108' }
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
