// Xử lý thanh toán
class PaymentManager {
    constructor() {
        this.paymentMethods = [
            { id: 'creditCard', name: 'Thẻ tín dụng/ghi nợ', icon: 'fas fa-credit-card' },
            { id: 'bankTransfer', name: 'Chuyển khoản ngân hàng', icon: 'fas fa-university' },
            { id: 'momo', name: 'Ví điện tử MoMo', icon: 'fas fa-mobile-alt' }
        ];
    }

    // Xử lý thanh toán
    async processPayment(paymentData) {
        try {
            const response = await this.mockApiCall('/payment/process', paymentData);

            if (response.success) {
                return { success: true, transactionId: response.transactionId };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi thanh toán' };
        }
    }

    // Lấy danh sách phương thức thanh toán
    getPaymentMethods() {
        return this.paymentMethods;
    }

    // Validate thông tin thanh toán
    validatePaymentData(paymentData) {
        const errors = [];

        if (!paymentData.method) {
            errors.push('Vui lòng chọn phương thức thanh toán');
        }

        if (paymentData.method === 'creditCard') {
            if (!paymentData.cardNumber) {
                errors.push('Vui lòng nhập số thẻ');
            }
            if (!paymentData.expiryDate) {
                errors.push('Vui lòng nhập ngày hết hạn');
            }
            if (!paymentData.cvv) {
                errors.push('Vui lòng nhập CVV');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Giả lập API call
    async mockApiCall(endpoint, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/payment/process') {
                    resolve({
                        success: true,
                        transactionId: 'TXN' + Date.now()
                    });
                }
            }, 2000);
        });
    }
}

// Khởi tạo PaymentManager
const paymentManager = new PaymentManager();
window.paymentManager = paymentManager;