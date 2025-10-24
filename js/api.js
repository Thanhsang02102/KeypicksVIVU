// Quản lý API calls
class ApiManager {
    constructor() {
        this.baseURL = 'https://api.keypicksvivu.com';
        this.timeout = 10000;
    }

    // GET request
    async get(endpoint, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw new Error('Network error: ' + error.message);
        }
    }

    // POST request
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw new Error('Network error: ' + error.message);
        }
    }

    // PUT request
    async put(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw new Error('Network error: ' + error.message);
        }
    }

    // DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw new Error('Network error: ' + error.message);
        }
    }

    // Lấy headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Xử lý response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }

        return await response.json();
    }
}

// Khởi tạo ApiManager
const apiManager = new ApiManager();
window.apiManager = apiManager;