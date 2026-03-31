class LyceumAPI {
    constructor() {
        this.baseURL = 'https://your-bot-api.com/api'; // Ваш API endpoint
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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    async login(login, password) {
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
    }
    
    async getSchedule(day) {
        return await this.request(`/schedule?day=${day}`);
    }
    
    async getSubstitutions() {
        return await this.request('/substitutions');
    }
    
    async getCurrentLesson() {
        return await this.request('/current-lesson');
    }
    
    async syncData() {
        return await this.request('/sync', { method: 'POST' });
    }
    
    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
}

const api = new LyceumAPI();