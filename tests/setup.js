// Test setup file
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
};hould fail login with invalid credentials', async () => {
const result = await authManager.login('invalid@example.com', 'wrongpassword');
expect(result.success).toBe(false);


test('should logout user', () => {
    authManager.currentUser = { id: 1, email: 'test@example.com' };
    authManager.logout();
    expect(authManager.currentUser).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
});
