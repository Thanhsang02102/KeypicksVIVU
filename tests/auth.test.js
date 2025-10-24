import { AuthManager } from '../js/auth.js';

describe('AuthManager', () => {
    let authManager;

    beforeEach(() => {
        authManager = new AuthManager();
        localStorage.clear();
    });

    test('should initialize with no user', () => {
        expect(authManager.currentUser).toBeNull();
    });

    test('should login with valid credentials', async () => {
        const result = await authManager.login('test@example.com', 'password');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
    });

    test('should fail login with invalid credentials', async () => {
        const result = await authManager.login('invalid@example.com', 'wrongpassword');
        expect(result.success).toBe(false);
    });

    test('should logout user', () => {
        authManager.currentUser = { id: 1, email: 'test@example.com' };
        authManager.logout();
        expect(authManager.currentUser).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
}); (1850000 * 2 + 200000 + 50000); // base price * passengers + tax + service fee
