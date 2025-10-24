// Xử lý tìm kiếm chuyến bay
class SearchManager {
    constructor() {
        this.searchHistory = [];
        this.favoriteRoutes = [];
        this.init();
    }

    init() {
        this.loadSearchHistory();
    }

    // Tìm kiếm chuyến bay
    async searchFlights(searchParams) {
        try {
            const response = await this.mockApiCall('/flights/search', searchParams);

            // Lưu vào lịch sử tìm kiếm
            this.addToSearchHistory(searchParams);

            return response.flights || [];
        } catch (error) {
            return [];
        }
    }

    // Lấy danh sách sân bay
    async getAirports() {
        try {
            const response = await this.mockApiCall('/airports', {});
            return response.airports || [];
        } catch (error) {
            return this.getDefaultAirports();
        }
    }

    // Lấy lịch sử tìm kiếm
    getSearchHistory() {
        return this.searchHistory;
    }

    // Thêm vào lịch sử tìm kiếm
    addToSearchHistory(searchParams) {
        const searchItem = {
            ...searchParams,
            timestamp: new Date().toISOString()
        };

        this.searchHistory.unshift(searchItem);
        this.searchHistory = this.searchHistory.slice(0, 10); // Giữ tối đa 10 lần tìm kiếm

        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    // Load lịch sử tìm kiếm
    loadSearchHistory() {
        const history = localStorage.getItem('searchHistory');
        if (history) {
            this.searchHistory = JSON.parse(history);
        }
    }

    // Lấy sân bay mặc định
    getDefaultAirports() {
        return [
            { code: 'SGN', name: 'TP. Hồ Chí Minh (SGN)', city: 'TP. Hồ Chí Minh' },
            { code: 'HAN', name: 'Hà Nội (HAN)', city: 'Hà Nội' },
            { code: 'DAD', name: 'Đà Nẵng (DAD)', city: 'Đà Nẵng' },
            { code: 'CXR', name: 'Nha Trang (CXR)', city: 'Nha Trang' },
            { code: 'PQC', name: 'Phú Quốc (PQC)', city: 'Phú Quốc' }
        ];
    }

    // Giả lập API call
    async mockApiCall(endpoint, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/flights/search') {
                    resolve({
                        flights: [
                            {
                                id: 'FL001',
                                airline: 'Vietnam Airlines',
                                flightNumber: 'VN 7120',
                                departure: { time: '08:00', airport: 'SGN' },
                                arrival: { time: '10:00', airport: 'HAN' },
                                duration: '2h 00m',
                                price: 1850000,
                                type: 'direct'
                            },
                            {
                                id: 'FL002',
                                airline: 'VietJet Air',
                                flightNumber: 'VJ 123',
                                departure: { time: '14:30', airport: 'SGN' },
                                arrival: { time: '16:30', airport: 'HAN' },
                                duration: '2h 00m',
                                price: 1650000,
                                type: 'direct'
                            }
                        ];
                    } else if (endpoint === '/airports') {
                        resolve({
                            airports: this.getDefaultAirports()
                        });
                    }
                }, 1000);
        });
    }
}

// Khởi tạo SearchManager
const searchManager = new SearchManager();
window.searchManager = searchManager;