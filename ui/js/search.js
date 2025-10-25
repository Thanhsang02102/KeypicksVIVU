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
            const response = await window.apiManager.get('/flights/search', searchParams);

            // Lưu vào lịch sử tìm kiếm
            this.addToSearchHistory(searchParams);

            return response.flights || [];
        } catch (error) {
            console.error('Error searching flights:', error);
            return [];
        }
    }

    // Lấy danh sách sân bay
    async getAirports() {
        try {
            const response = await window.apiManager.get('/flights/airports/list');
            return response.airports || [];
        } catch (error) {
            console.error('Error getting airports:', error);
            return this.getDefaultAirports();
        }
    }
    
    // Lấy danh sách hãng bay
    async getAirlines() {
        try {
            const response = await window.apiManager.get('/flights/airlines/list');
            return response.airlines || [];
        } catch (error) {
            console.error('Error getting airlines:', error);
            return [];
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
            timestamp: Utils.now() // Use UTC-based ISO8601 timestamp
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

    // Lấy sân bay mặc định (fallback)
    getDefaultAirports() {
        return [
            { code: 'SGN', name: 'TP. Hồ Chí Minh (SGN)', city: 'TP. Hồ Chí Minh' },
            { code: 'HAN', name: 'Hà Nội (HAN)', city: 'Hà Nội' },
            { code: 'DAD', name: 'Đà Nẵng (DAD)', city: 'Đà Nẵng' },
            { code: 'CXR', name: 'Nha Trang (CXR)', city: 'Nha Trang' },
            { code: 'PQC', name: 'Phú Quốc (PQC)', city: 'Phú Quốc' }
        ];
    }
}

// Khởi tạo SearchManager
const searchManager = new SearchManager();
window.searchManager = searchManager;