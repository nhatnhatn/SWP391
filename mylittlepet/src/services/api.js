// API service layer for communicating with Spring Boot backend
// This service handles all HTTP requests to the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('🌐 API Service: Using API base URL:', API_BASE_URL);

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get authorization headers with JWT token
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    // Generic HTTP request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        }; try {
            console.log('🌐 Making API request to:', url);
            console.log('🔧 Request config:', config);

            const response = await fetch(url, config);

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            let data; if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            console.log('📦 Response data:', data); if (!response.ok) {
                console.error('❌ Request failed with status:', response.status);
                console.error('❌ Response body:', data);
                console.error('❌ Content-Type:', contentType);

                // Handle different error response formats
                let errorMessage = `HTTP ${response.status}`;

                if (typeof data === 'object' && data !== null) {
                    if (data.message) {
                        errorMessage = data.message;
                    } else if (data.error) {
                        errorMessage = data.error;
                    } else if (data.details) {
                        errorMessage = data.details;
                    } else {
                        // If it's a validation error object
                        const errors = Object.values(data).filter(v => typeof v === 'string');
                        if (errors.length > 0) {
                            errorMessage = errors.join(', ');
                        } else {
                            errorMessage = JSON.stringify(data);
                        }
                    }
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }

                console.error('🔍 Parsed error message:', errorMessage);
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            console.error('Full error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            // Handle different types of network errors
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem backend có đang chạy không (cổng 8080).');
            } else if (error.name === 'AbortError') {
                throw new Error('Yêu cầu đã bị hủy do quá thời gian chờ.');
            } else if (error.message.includes('NetworkError')) {
                throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn.');
            }

            throw error;
        }
    }

    // HTTP Methods
    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }    // Authentication API
    async login(email, password) {
        console.log('🌐 ApiService: Attempting to login with backend:', { email });
        try {
            const response = await this.post('/auth/login', { email, password });
            console.log('✅ ApiService: Backend login response:', response);
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }
            return response;
        } catch (error) {
            console.error('❌ ApiService: Backend login error:', error.message);
            throw error;
        }
    } async register(userData) {
        console.log('🔧 Register request data:', userData);
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    }

    // Health check API
    async checkHealth() {
        try {
            // Try to hit a simple endpoint to check if backend is alive
            const response = await this.request('/auth/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return { status: 'connected', response };
        } catch (error) {
            return { status: 'disconnected', error: error.message };
        }
    }

    async changePassword(oldPassword, newPassword) {
        return this.post('/auth/change-password', { oldPassword, newPassword });
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
    }    // Users API
    async getUsers(page = 0, size = 10) {
        return this.get(`/users/paginated?page=${page}&size=${size}`);
    }

    async getAllUsers() {
        return this.get('/users');
    } async getUserById(id) {
        return this.get(`/users/${id}`);
    }

    async getUserByEmail(email) {
        return this.get(`/users/email/${email}`);
    }

    async searchUsers(keyword, page = 0, size = 10) {
        return this.get(`/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async addCoins(userId, amount) {
        return this.post(`/users/${userId}/coins`, { amount });
    }

    async addExperience(userId, experience) {
        return this.post(`/users/${userId}/experience`, { experience });
    }    // Pets API
    async getPets(page = 0, size = 10) {
        return this.get(`/pets/paginated?page=${page}&size=${size}`);
    }

    async getAllPets() {
        return this.get('/pets');
    }

    async getPetById(id) {
        return this.get(`/pets/${id}`);
    }

    async getPetsByOwner(ownerId) {
        return this.get(`/pets/owner/${ownerId}`);
    }

    async searchPets(keyword, petType, rarity, page = 0, size = 10) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (petType) params.append('petType', petType);
        if (rarity) params.append('rarity', rarity);
        params.append('page', page);
        params.append('size', size);

        return this.get(`/pets/search?${params.toString()}`);
    }

    async createPet(petData) {
        return this.post('/pets', petData);
    }

    async updatePet(id, petData) {
        return this.put(`/pets/${id}`, petData);
    }

    async deletePet(id) {
        return this.delete(`/pets/${id}`);
    }

    // Pet Care Actions
    async feedPet(petId) {
        return this.post(`/pets/${petId}/feed`);
    }

    async playWithPet(petId) {
        return this.post(`/pets/${petId}/play`);
    }

    async restPet(petId) {
        return this.post(`/pets/${petId}/rest`);
    }

    async healPet(petId) {
        return this.post(`/pets/${petId}/heal`);
    }    // Items API
    async getItems(page = 0, size = 10) {
        return this.get(`/items/paginated?page=${page}&size=${size}`);
    }

    async getAllItems() {
        return this.get('/items');
    }

    async getItemById(id) {
        return this.get(`/items/${id}`);
    } async searchItems(keyword, itemType, rarity, page = 0, size = 10) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (itemType) params.append('itemType', itemType);
        if (rarity) params.append('rarity', rarity);
        params.append('page', page);
        params.append('size', size);
        return this.get(`/items/search?${params.toString()}`);
    }

    async createItem(itemData) {
        return this.post('/items', itemData);
    }

    async updateItem(id, itemData) {
        return this.put(`/items/${id}`, itemData);
    }

    async deleteItem(id) {
        return this.delete(`/items/${id}`);
    }

    // Shop & Inventory API
    async getShopItems() {
        return this.get('/items/shop');
    }

    async getUserInventory(userId) {
        return this.get(`/items/inventory/${userId}`);
    }

    async buyItem(itemId, quantity = 1) {
        return this.post(`/items/${itemId}/buy`, { quantity });
    }

    async sellItem(itemId, quantity = 1) {
        return this.post(`/items/${itemId}/sell`, { quantity });
    }

    async useItem(itemId, petId) {
        return this.post(`/items/${itemId}/use`, { petId });
    }

    // API Documentation & Health Check
    async getApiDocumentation() {
        return this.get('/docs');
    }

    async healthCheck() {
        return this.get('/health');
    }
}

export default new ApiService();
