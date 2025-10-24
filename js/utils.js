// Các hàm tiện ích
class Utils {
    // Format tiền tệ
    static formatCurrency(amount, currency = 'VND') {
        if (currency === 'VND') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format ngày tháng
    static formatDate(date, locale = 'vi-VN') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    // Format thời gian
    static formatTime(time) {
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(`2000-01-01T${time}`));
    }

    // Validate email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone
    static validatePhone(phone) {
        const re = /^[0-9]{10,11}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate random string
    static generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Generate booking code
    static generateBookingCode() {
        const prefix = 'VN';
        const random = this.generateRandomString(6).toUpperCase();
        return `${prefix}${random}`;
    }

    // Calculate flight duration
    static calculateDuration(departureTime, arrivalTime) {
        const dep = new Date(`2000-01-01T${departureTime}`);
        const arr = new Date(`2000-01-01T${arrivalTime}`);

        if (arr < dep) {
            arr.setDate(arr.getDate() + 1);
        }

        const diff = arr - dep;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    // Check if date is in the past
    static isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(date) < today;
    }

    // Get days between dates
    static getDaysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }

    // Scroll to element
    static scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy: ', err);
            return false;
        }
    }

    // Download file
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Local storage helpers
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage', e);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage', e);
            return false;
        }
    }

    // Session storage helpers
    static setSessionStorage(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to sessionStorage', e);
            return false;
        }
    }

    static getSessionStorage(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from sessionStorage', e);
            return defaultValue;
        }
    }

    // URL helpers
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    }

    // Loading helpers
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="spinner"></div>';
        }
    }

    static hideLoading(elementId, content = '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        }
    }
}

// Export for global use
window.Utils = Utils;