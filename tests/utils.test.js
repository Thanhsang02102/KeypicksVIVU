import { Utils } from '../js/utils.js';

describe('Utils', () => {
    test('should format currency correctly', () => {
        expect(Utils.formatCurrency(1000000)).toBe('1.000.000 ₫');
        expect(Utils.formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
    });

    test('should validate email', () => {
        expect(Utils.validateEmail('test@example.com')).toBe(true);
        expect(Utils.validateEmail('invalid-email')).toBe(false);
    });

    test('should validate phone', () => {
        expect(Utils.validatePhone('0123456789')).toBe(true);
        expect(Utils.validatePhone('123')).toBe(false);
    });

    test('should generate booking code', () => {
        const code = Utils.generateBookingCode();
        expect(code).toMatch(/^VN[A-Z0-9]{6}$/);
    });

    test('should calculate flight duration', () => {
        expect(Utils.calculateDuration('08:00', '10:00')).toBe('2h 0m');
        expect(Utils.calculateDuration('23:00', '01:00')).toBe('2h 0m');
    });
});