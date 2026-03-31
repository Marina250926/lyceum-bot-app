class LyceumAPI {
    constructor() {
        // Для розробки використовуємо localStorage
        this.token = localStorage.getItem('auth_token');
    }
    
    async request(endpoint, options = {}) {
        // Симуляція API для розробки
        console.log(`API Request: ${endpoint}`, options);
        
        // Імітуємо затримку мережі
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Тестові дані
        if (endpoint === '/auth/login') {
            const { login, password } = JSON.parse(options.body);
            if (login === 'admin' && password === 'admin123') {
                return {
                    token: 'test_token',
                    user: {
                        full_name: 'Адміністратор',
                        role: 'admin',
                        group_name: '',
                        subgroup: ''
                    }
                };
            } else if (login === 'teacher' && password === 'teacher123') {
                return {
                    token: 'test_token',
                    user: {
                        full_name: 'Іваненко І.І.',
                        role: 'teacher',
                        group_name: '8-А',
                        subgroup: ''
                    }
                };
            } else {
                throw new Error('Невірний логін або пароль');
            }
        }
        
        if (endpoint === '/schedule') {
            const url = new URL(`https://dummy${endpoint}`);
            const day = url.searchParams.get('day');
            return this.getMockSchedule(day);
        }
        
        if (endpoint === '/substitutions') {
            return [];
        }
        
        if (endpoint === '/current-lesson') {
            return null;
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
        return { success: true };
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
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Інформатика', teacher: 'Романенко В.В.', classroom: '202' }
            ],
            'Четвер': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Фізкультура', teacher: 'Спортивний О.П.', classroom: 'Спортзал' },
                { lesson_num: 2, time_range: '9:45 – 10:25', subject: 'Музика', teacher: 'Музченко І.І.', classroom: '106' }
            ],
            'П\'ятниця': [
                { lesson_num: 1, time_range: '9:00 – 9:40', subject: 'Трудове навчання', teacher: 'Трудовий М.П.', classroom: 'Майстерня' }
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
