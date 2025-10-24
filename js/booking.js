// Xử lý đặt vé
class BookingManager {
    constructor() {
        this.currentBooking = null;
        this.init();
    }

    init() {
        // Khởi tạo booking từ URL params hoặc localStorage
        this.loadBookingData();
    }

    // Tạo booking mới
    createBooking(flightData, passengerData) {
        this.currentBooking = {
            id: 'BK' + Date.now(),
            flight: flightData,
            passengers: passengerData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            totalAmount: this.calculateTotal(flightData, passengerData)
        };

        localStorage.setItem('currentBooking', JSON.stringify(this.currentBooking));
        return this.currentBooking;
    }

    // Tính tổng tiền
    calculateTotal(flight, passengers) {
        const basePrice = flight.price || 1850000;
        const tax = 200000;
        const serviceFee = 50000;
        const passengerCount = passengers.length;

        return (basePrice * passengerCount) + tax + serviceFee;
    }

    // Xác nhận booking
    async confirmBooking(paymentData) {
        try {
            // Giả lập API call
            const response = await this.mockApiCall('/bookings/confirm', {
                booking: this.currentBooking,
                payment: paymentData
            });

            if (response.success) {
                this.currentBooking.status = 'confirmed';
                this.currentBooking.bookingCode = response.bookingCode;
                localStorage.setItem('currentBooking', JSON.stringify(this.currentBooking));
                return { success: true, bookingCode: response.bookingCode };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi xác nhận đặt vé' };
        }
    }

    // Lấy danh sách booking của user
    async getUserBookings() {
        try {
            const response = await this.mockApiCall('/bookings/user', {});
            return response.bookings || [];
        } catch (error) {
            return [];
        }
    }

    // Load booking data
    loadBookingData() {
        const booking = localStorage.getItem('currentBooking');
        if (booking) {
            this.currentBooking = JSON.parse(booking);
        }
    }

    // Giả lập API call
    async mockApiCall(endpoint, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/bookings/confirm') {
                    resolve({
                        success: true,
                        bookingCode: 'VN' + Math.random().toString(36).substr(2, 6).toUpperCase()
                    });
                } else if (endpoint === '/bookings/user') {
                    resolve({
                        bookings: [
                            {
                                id: 'BK001',
                                flight: 'SGN → HAN',
                                date: '15/12/2024',
                                status: 'confirmed',
                                amount: 2100000
                            }
                        ]
                    });
                }
            }, 1000);
        });
    }
}

// Khởi tạo BookingManager
const bookingManager = new BookingManager();
window.bookingManager = bookingManager;