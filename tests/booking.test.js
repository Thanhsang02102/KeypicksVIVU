import { BookingManager } from '../js/booking.js';

describe('BookingManager', () => {
    let bookingManager;

    beforeEach(() => {
        bookingManager = new BookingManager();
    });

    test('should create booking', () => {
        const flightData = {
            id: 'FL001',
            airline: 'Vietnam Airlines',
            price: 1850000
        };

        const passengerData = [{
            firstName: 'Nguyen',
            lastName: 'Van A',
            gender: 'male'
        }];

        const booking = bookingManager.createBooking(flightData, passengerData);

        expect(booking).toBeDefined();
        expect(booking.id).toMatch(/^BK/);
        expect(booking.flight).toEqual(flightData);
        expect(booking.passengers).toEqual(passengerData);
    });

    test('should calculate total amount correctly', () => {
        const flight = { price: 1850000 };
        const passengers = [{}, {}]; // 2 passengers

        const total = bookingManager.calculateTotal(flight, passengers);
        expect(total).toBe(1850000 * 2 + 200000 + 50000); // base price * passengers + tax + service fee
    });
});