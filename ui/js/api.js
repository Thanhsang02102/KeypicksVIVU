// Quản lý API calls
class ApiManager {
    constructor() {
        // Use relative URL to work with the Express server
        this.baseURL = '/api';
        this.timeout = 10000;
    }

    // GET request
    async get(endpoint, params = {}) {
        let url = this.baseURL + endpoint;
        
        // Add query parameters
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }

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

        const data = await response.json();
        // Parse datetime fields automatically
        return this.parseDateTimeFields(data);
    }

    // Parse datetime fields in response data
    // This converts ISO8601 strings to Date objects
    parseDateTimeFields(data) {
        if (!data) return data;
        
        // If it's an array, process each item
        if (Array.isArray(data)) {
            return data.map(item => this.parseDateTimeFields(item));
        }
        
        // If it's an object, process its properties
        if (typeof data === 'object') {
            const parsed = { ...data };
            
            // Common datetime field names to parse
            const dateTimeFields = [
                'date', 'time', 'datetime', 
                'createdAt', 'updatedAt', 
                'dateOfBirth', 'timestamp',
                'bookingDate', 'departureDate', 'arrivalDate'
            ];
            
            for (const key in parsed) {
                // Parse nested objects
                if (parsed[key] && typeof parsed[key] === 'object') {
                    parsed[key] = this.parseDateTimeFields(parsed[key]);
                }
                // Parse datetime strings
                else if (typeof parsed[key] === 'string' && this.isISO8601(parsed[key])) {
                    // Only parse if it looks like a datetime field or is ISO8601 format
                    if (dateTimeFields.includes(key) || parsed[key].includes('T')) {
                        parsed[key] = new Date(parsed[key]);
                    }
                }
            }
            
            return parsed;
        }
        
        return data;
    }

    // Check if string is ISO8601 datetime format
    isISO8601(str) {
        if (typeof str !== 'string') return false;
        // Basic ISO8601 pattern: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD
        const iso8601Pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        return iso8601Pattern.test(str);
    }
}

// Khởi tạo ApiManager
const apiManager = new ApiManager();
window.apiManager = apiManager;