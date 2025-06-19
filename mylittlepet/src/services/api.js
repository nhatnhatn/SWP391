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
    }    // Generic HTTP request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            console.log('🌐 Making API request to:', url);
            console.log('🔧 Request config:', {
                ...config,
                body: config.body ? JSON.parse(config.body) : undefined
            });

            // Validate URL before making request
            if (!url || !url.startsWith('http')) {
                console.error('❌ Invalid API URL:', url);
                throw new Error(`Invalid API URL: ${url}. Check your baseURL and endpoint.`);
            }

            const response = await fetch(url, config);

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            let data;
            try {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
            } catch (parseError) {
                console.error('❌ Error parsing response:', parseError);
                data = await response.text(); // Get raw response if parsing fails
            }

            console.log('📦 Response data:', data); if (!response.ok) {
                console.error('❌ Request failed with status:', response.status);
                console.error('❌ Response body:', data);
                console.error('❌ Content-Type:', contentType);
                console.error('❌ Request URL:', url);
                console.error('❌ Request method:', config.method || 'GET');
                if (config.body) {
                    console.error('❌ Request body:', JSON.parse(config.body));
                }

                // Handle different error response formats
                let errorMessage = `HTTP ${response.status}`;
                let errorDetails = [];

                // Handle 404 specifically with better error message
                if (response.status === 404) {
                    errorMessage = `API not found: ${endpoint}. Verify that this endpoint exists on the server.`;
                } else if (typeof data === 'object' && data !== null) {
                    if (data.message) {
                        errorMessage = data.message;
                    } else if (data.error) {
                        errorMessage = data.error;
                    } else if (data.details) {
                        errorMessage = data.details;
                    }

                    // Collect validation errors if any
                    if (data.errors) {
                        errorDetails = Array.isArray(data.errors) ? data.errors : [data.errors];
                    }
                }

                const error = new Error(errorMessage);
                error.status = response.status;
                error.details = errorDetails;
                error.response = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            if (error.stack) {
                console.error('❌ Stack trace:', error.stack);
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
    }    // ===== PLAYER MANAGEMENT APIs =====
    // Get all players (for admin management)
    async getAllPlayers() {
        try {
            console.log('🔍 Fetching all players from backend');
            const response = await this.get('/players');
            console.log('✅ Players fetched successfully:', response);

            // Ensure we always return an array
            if (Array.isArray(response)) {
                return response;
            } else if (response && typeof response === 'object') {
                // Handle different response formats
                if (Array.isArray(response.content)) {
                    return response.content;
                } else if (Array.isArray(response.data)) {
                    return response.data;
                }
            }

            console.warn('⚠️ Unexpected response format, returning empty array');
            return [];
        } catch (error) {
            console.error('❌ Failed to fetch players:', error);
            // Return empty array instead of throwing to prevent app crashes
            return [];
        }
    }

    async getPlayerById(id) {
        try {
            console.log(`🔍 Fetching player with ID: ${id}`);
            const response = await this.get(`/players/${id}`);
            console.log('✅ Player fetched successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch player ${id}:`, error);
            throw error;
        }
    }

    async getPlayerByEmail(email) {
        try {
            console.log(`🔍 Fetching player with email: ${email}`);
            const response = await this.get(`/players/email/${encodeURIComponent(email)}`);
            console.log('✅ Player fetched by email successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch player by email ${email}:`, error);
            throw error;
        }
    }

    async getPlayerByUserName(username) {
        try {
            console.log(`🔍 Fetching player with username: ${username}`);
            const response = await this.get(`/players/username/${encodeURIComponent(username)}`);
            console.log('✅ Player fetched by username successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch player by username ${username}:`, error);
            throw error;
        }
    }

    async getPlayersByStatus(status) {
        try {
            console.log(`🔍 Fetching players with status: ${status}`);
            const response = await this.get(`/players/status/${encodeURIComponent(status)}`);
            console.log('✅ Players fetched by status successfully:', response);

            // Ensure we always return an array
            if (Array.isArray(response)) {
                return response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.content)) {
                    return response.content;
                } else if (Array.isArray(response.data)) {
                    return response.data;
                }
            }

            console.warn('⚠️ Unexpected response format, returning empty array');
            return [];
        } catch (error) {
            console.error(`❌ Failed to fetch players by status ${status}:`, error);
            // Return empty array instead of throwing to prevent app crashes
            return [];
        }
    }

    async createPlayer(playerData) {
        try {
            console.log('📝 Creating new player:', playerData);
            const response = await this.post('/players', playerData);
            console.log('✅ Player created successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to create player:', error);
            throw error;
        }
    }

    async updatePlayer(id, playerData) {
        try {
            console.log(`📝 Updating player ${id}:`, playerData);
            const response = await this.put(`/players/${id}`, playerData);
            console.log('✅ Player updated successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to update player ${id}:`, error);
            throw error;
        }
    }

    async deletePlayer(id) {
        try {
            console.log(`🗑️ Deleting player ${id}`);
            const response = await this.delete(`/players/${id}`);
            console.log('✅ Player deleted successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to delete player ${id}:`, error);
            throw error;
        }
    }

    async banPlayer(id) {
        try {
            console.log(`🚫 Banning player ${id}`);
            const response = await this.put(`/players/${id}/ban`);
            console.log('✅ Player banned successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to ban player ${id}:`, error);
            throw error;
        }
    }

    async unbanPlayer(id) {
        try {
            console.log(`✅ Unbanning player ${id}`);
            const response = await this.put(`/players/${id}/unban`);
            console.log('✅ Player unbanned successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to unban player ${id}:`, error);
            throw error;
        }
    }

    async testPlayerApi() {
        try {
            console.log('🧪 Testing player API connection');
            const response = await this.get('/players/test');
            console.log('✅ Player API test successful:', response);
            return response;
        } catch (error) {
            console.error('❌ Player API test failed:', error);
            throw error;
        }
    }// Pets API
    async getAllPets() {
        try {
            console.log('🔍 Fetching all pets');
            // Verify endpoint
            if (this.baseURL.endsWith('/')) {
                console.warn('⚠️ Base URL has trailing slash, which might cause double-slash in URL');
            }
            console.log('🔍 Using URL:', `${this.baseURL}/pets`);

            const response = await this.get('/pets');
            console.log('✅ Raw pets response:', response);

            // Ensure we always return an array
            let pets = [];
            if (Array.isArray(response)) {
                pets = response;
            } else if (response && typeof response === 'object') {
                // Handle different response formats
                if (Array.isArray(response.content)) {
                    pets = response.content;
                } else if (Array.isArray(response.data)) {
                    pets = response.data;
                } else if (response.pets && Array.isArray(response.pets)) {
                    pets = response.pets;
                }
            }

            console.log('✨ Normalized pets array:', pets);
            console.log('🔢 Number of pets:', pets.length);
            return pets;
        } catch (error) {
            console.error('❌ Failed to fetch pets:', error);
            // Return empty array instead of throwing to prevent app crashes
            return [];
        }
    }

    async getPetById(id) {
        try {
            console.log(`🔍 Fetching pet with ID: ${id}`);
            const response = await this.get(`/pets/${id}`);
            console.log('✅ Pet fetched successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch pet ${id}:`, error);
            throw error;
        }
    }

    async createPet(petData) {
        try {
            console.log('📝 Creating new pet:', petData);
            const response = await this.post('/pets', petData);
            console.log('✅ Pet created successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to create pet:', error);
            throw error;
        }
    }

    async updatePet(id, petData) {
        try {
            console.log(`📝 Updating pet ${id}:`, petData);
            const response = await this.put(`/pets/${id}`, petData);
            console.log('✅ Pet updated successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to update pet ${id}:`, error);
            throw error;
        }
    }

    async deactivatePet(id) {
        try {
            console.log(`🚫 Deactivating pet ${id}`);
            const response = await this.put(`/pets/${id}/deactivate`);
            console.log('✅ Pet deactivated successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to deactivate pet ${id}:`, error);
            throw error;
        }
    }    // Items API
    async getItems(page = 0, size = 10) {
        return this.get(`/items/paginated?page=${page}&size=${size}`);
    }

    async getAllItems() {
        console.log('📦 API: Fetching all items...');
        return this.get('/items');
    }

    async getItemById(id) {
        console.log(`📦 API: Fetching item by ID: ${id}`);
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
        console.log('📦 API: Creating new item:', itemData);
        return this.post('/items', itemData);
    }

    async updateItem(id, itemData) {
        console.log(`📦 API: Updating item ${id}:`, itemData);
        return this.put(`/items/${id}`, itemData);
    }

    async deleteItem(id) {
        console.log(`📦 API: Deleting item ${id}`);
        return this.delete(`/items/${id}`);
    }

    // Shop and inventory APIs
    async getShopItems() {
        console.log('🛒 API: Fetching shop items...');
        return this.get('/shop/items');
    }

    async getUserInventory(userId) {
        console.log(`🎒 API: Fetching inventory for user ${userId}`);
        return this.get(`/users/${userId}/inventory`);
    }

    async buyItem(itemId, quantity = 1) {
        console.log(`🛒 API: Buying item ${itemId}, quantity: ${quantity}`);
        return this.post('/shop/buy', { itemId, quantity });
    }

    async sellItem(itemId, quantity = 1) {
        console.log(`💰 API: Selling item ${itemId}, quantity: ${quantity}`);
        return this.post('/shop/sell', { itemId, quantity });
    }

    async useItem(itemId, petId = null) {
        console.log(`🧪 API: Using item ${itemId} on pet ${petId}`);
        return this.post('/items/use', { itemId, petId });
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
