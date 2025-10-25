// Xử lý thông báo
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
    }

    // Hiển thị thông báo
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        this.renderNotification(notification);

        // Tự động ẩn sau duration
        setTimeout(() => {
            this.hideNotification(notification.id);
        }, duration);
    }

    // Render thông báo
    renderNotification(notification) {
        const container = this.getNotificationContainer();
        const notificationElement = this.createNotificationElement(notification);
        container.appendChild(notificationElement);
    }

    // Tạo element thông báo
    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.id = `notification-${notification.id}`;
        div.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out`;

        const typeClasses = {
            success: 'border-l-4 border-green-400',
            error: 'border-l-4 border-red-400',
            warning: 'border-l-4 border-yellow-400',
            info: 'border-l-4 border-blue-400'
        };

        const iconClasses = {
            success: 'fas fa-check-circle text-green-400',
            error: 'fas fa-exclamation-circle text-red-400',
            warning: 'fas fa-exclamation-triangle text-yellow-400',
            info: 'fas fa-info-circle text-blue-400'
        };

        div.className += ` ${typeClasses[notification.type]}`;

        div.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="${iconClasses[notification.type]}"></i>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">${notification.message}</p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none" onclick="notificationManager.hideNotification(${notification.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return div;
    }

    // Lấy container thông báo
    getNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
        return container;
    }

    // Ẩn thông báo
    hideNotification(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.style.transform = 'translateX(100%)';
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }

    // Lưu thông báo vào localStorage
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // Load thông báo từ localStorage
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Lắng nghe sự kiện từ các module khác
        document.addEventListener('bookingSuccess', (e) => {
            this.showNotification('Đặt vé thành công!', 'success');
        });

        document.addEventListener('bookingError', (e) => {
            this.showNotification('Có lỗi xảy ra khi đặt vé!', 'error');
        });

        document.addEventListener('loginSuccess', (e) => {
            this.showNotification('Đăng nhập thành công!', 'success');
        });

        document.addEventListener('loginError', (e) => {
            this.showNotification('Đăng nhập thất bại!', 'error');
        });
    }

    // Lấy danh sách thông báo
    getNotifications() {
        return this.notifications;
    }

    // Xóa tất cả thông báo
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Khởi tạo NotificationManager
const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;