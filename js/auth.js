// Xử lý đăng nhập và đăng ký
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Kiểm tra user đã đăng nhập chưa
        this.checkAuthStatus();
    }

    // Đăng nhập
    async login(email, password) {
        try {
            // Giả lập API call
            const response = await this.mockApiCall('/auth/login', {
                email: email,
                password: password
            });

            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối' };
        }
    }

    // Đăng ký
    async register(userData) {
        try {
            const response = await this.mockApiCall('/auth/register', userData);

            if (response.success) {
                return { success: true, message: 'Đăng ký thành công' };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối' };
        }
    }

    // Đăng xuất
    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }

    // Kiểm tra trạng thái đăng nhập
    checkAuthStatus() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user && token) {
            this.currentUser = JSON.parse(user);
            return true;
        }
        return false;
    }

    // Giả lập API call
    async mockApiCall(endpoint, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/auth/login') {
                    if (data.email && data.password) {
                        resolve({
                            success: true,
                            user: { id: 1, email: data.email, name: 'Nguyễn Văn A' },
                            token: 'mock_token_' + Date.now()
                        });
                    } else {
                        resolve({ success: false, message: 'Email hoặc mật khẩu không đúng' });
                    }
                } else if (endpoint === '/auth/register') {
                    resolve({ success: true, message: 'Đăng ký thành công' });
                }
            }, 1000);
        });
    }
}

// Khởi tạo AuthManager
const authManager = new AuthManager();

// Export cho sử dụng global
window.authManager = authManager;