// storage.js - Керування локальним сховищем

class LocalStorage {
    constructor() {
        this.prefix = 'lyceum_';
    }
    
    // Зберегти дані
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('Помилка збереження:', error);
            return false;
        }
    }
    
    // Отримати дані
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Помилка читання:', error);
            return defaultValue;
        }
    }
    
    // Видалити дані
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    // Очистити всі дані
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Перевірити наявність
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }
}

// Експортуємо екземпляр
const storage = new LocalStorage();
