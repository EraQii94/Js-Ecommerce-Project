// Shared utility functions
class Utils {
    static showAlert(message, type = 'danger', elementId = 'errorAlert') {
        const alertElement = document.getElementById(elementId);
        alertElement.textContent = message;
        alertElement.classList.remove('d-none', 'alert-success', 'alert-info', 'alert-warning', 'alert-danger');
        alertElement.classList.add(`alert-${type}`);
        alertElement.classList.remove('d-none');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            alertElement.classList.add('d-none');
        }, 5000);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
}

// LocalStorage CRUD operations
class LocalStorageDB {
    constructor(key) {
        this.key = key;
    }

    getAll() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id);
    }

    create(item) {
        const items = this.getAll();
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItem = { ...item, id: newId };
        items.push(newItem);
        localStorage.setItem(this.key, JSON.stringify(items));
        return newItem;
    }

    update(id, updates) {
        const items = this.getAll();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(this.key, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(id) {
        const items = this.getAll();
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(this.key, JSON.stringify(filteredItems));
        return filteredItems.length !== items.length;
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});