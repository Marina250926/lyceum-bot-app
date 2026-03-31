// storage.js - просте сховище
class LocalStorage {
    constructor() {
        this.prefix = 'lyceum_';
    }
    
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Помилка збереження:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Помилка читання:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

const storage = new LocalStorage();
