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
            createdAt: Utils.now(), // Use UTC-based ISO8601 timestamp
            totalAmount: this.calculateTotal(flightData, passengerData)
        };

        localStorage.setItem('currentBooking', JSON.stringify(this.currentBooking));
        return this.currentBooking;
    }

    // Tính tổng tiền
    // NOTE: Price calculation moved to separate pricing module
    // This is a temporary placeholder - will be replaced with actual pricing API call
    calculateTotal(flight, passengers) {
        console.warn('Price calculation should use Pricing Module API');
        
        // Temporary placeholder - pricing logic will be handled by backend
        const passengerCount = passengers.length || 1;
        const tax = 200000;
        const serviceFee = 50000;
        
        // TODO: Replace with actual API call to pricing module
        // Example: const pricing = await apiManager.get(`/flights/${flightId}/pricing`, params);
        
        return tax + serviceFee; // Base fees only, actual flight price will come from pricing module
    }

    // Xác nhận booking
    async confirmBooking(bookingId, paymentData) {
        try {
            const response = await window.apiManager.post(`/bookings/${bookingId}/confirm`, {
                paymentMethod: paymentData.method
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
            console.error('Error confirming booking:', error);
            return { success: false, message: error.message || 'Lỗi xác nhận đặt vé' };
        }
    }

    // Tạo booking trên server
    async submitBooking(flightId, passengers, contactInfo, pricingData) {
        try {
            // NOTE: totalAmount should come from pricing module API response
            const totalAmount = pricingData?.total || this.calculateTotal({}, passengers);
            
            const response = await window.apiManager.post('/bookings', {
                flightId: flightId,
                passengers: passengers,
                contactInfo: contactInfo,
                totalAmount: totalAmount
            });

            if (response.success) {
                this.currentBooking = response.booking;
                localStorage.setItem('currentBooking', JSON.stringify(this.currentBooking));
                return { success: true, booking: response.booking };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            return { success: false, message: error.message || 'Lỗi tạo booking' };
        }
    }

    // Lấy danh sách booking của user
    async getUserBookings() {
        try {
            const response = await window.apiManager.get('/bookings/user');
            return response.bookings || [];
        } catch (error) {
            console.error('Error getting user bookings:', error);
            return [];
        }
    }
    
    // Hủy booking
    async cancelBooking(bookingId) {
        try {
            const response = await window.apiManager.post(`/bookings/${bookingId}/cancel`);
            return response;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return { success: false, message: error.message || 'Lỗi hủy booking' };
        }
    }

    // Load booking data
    loadBookingData() {
        const booking = localStorage.getItem('currentBooking');
        if (booking) {
            this.currentBooking = JSON.parse(booking);
        }
    }
}

// Khởi tạo BookingManager
const bookingManager = new BookingManager();
window.bookingManager = bookingManager;