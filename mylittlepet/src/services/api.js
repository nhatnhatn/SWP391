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
    }

    async patch(endpoint, data = null) {
        return this.request(endpoint, {
            method: 'PATCH',
            ...(data ? { body: JSON.stringify(data) } : {})
        });
    }

    // Authentication API
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
    } async banPlayer(id, banEndDate = null) {
        try {
            console.log(`🚫 Banning player ${id}${banEndDate ? ` until ${banEndDate.toISOString()}` : ''}`);

            let response;
            if (banEndDate) {
                // Send ban with end date
                response = await this.put(`/players/${id}/ban`, {
                    banEndDate: banEndDate.toISOString()
                });
            } else {
                // Permanent ban (fallback)
                response = await this.put(`/players/${id}/ban`);
            }

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
    } async testPlayerApi() {
        try {
            console.log('🧪 Testing player API connection');
            const response = await this.get('/players/test');
            console.log('✅ Player API test successful:', response);
            return response;
        } catch (error) {
            console.error('❌ Player API test failed:', error);
            throw error;
        }
    }

    async getPlayerPets(playerId) {
        try {
            console.log(`🐾 Fetching pets for player ${playerId}`);
            const response = await this.get(`/players/${playerId}/pets`);
            console.log('✅ Player pets fetched successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch pets for player ${playerId}:`, error);
            throw error;
        }
    }

    // ===== PET MANAGEMENT API =====

    // Get all pets
    async getAllPets() {
        console.log('🐕 API: Getting all pets');
        return this.get('/pets');
    }

    // Get pet by ID
    async getPetById(id) {
        console.log(`🐕 API: Getting pet ${id}`);
        return this.get(`/pets/${id}`);
    }

    // Get pets by type
    async getPetsByType(type) {
        console.log(`🐕 API: Getting pets by type: ${type}`);
        return this.get(`/pets/type/${encodeURIComponent(type)}`);
    }

    // Get pets by status
    async getPetsByStatus(status) {
        console.log(`🐕 API: Getting pets by status: ${status}`);
        return this.get(`/pets/status/${status}`);
    }

    // Search pets
    async searchPets(keyword) {
        console.log(`🐕 API: Searching pets with keyword: ${keyword}`);
        return this.get(`/pets/search?keyword=${encodeURIComponent(keyword)}`);
    }

    // Create pet
    async createPet(petData) {
        console.log('🐕 API: Creating pet:', petData);
        return this.post('/pets', petData);
    }

    // Update pet
    async updatePet(id, petData) {
        console.log(`🐕 API: Updating pet ${id}:`, petData);
        return this.put(`/pets/${id}`, petData);
    }

    // Delete pet (soft delete)
    async deletePet(id) {
        console.log(`🐕 API: Deleting pet ${id}`);
        return this.delete(`/pets/${id}`);
    }

    // Test pet API
    async testPetApi() {
        console.log('🐕 API: Testing pet API');
        return this.get('/pets/test');
    }

    // API Documentation & Health Check
    async getApiDocumentation() {
        return this.get('/docs');
    }

    async healthCheck() {
        return this.get('/health');
    }

    // ===== SHOP PRODUCT MANAGEMENT API =====

    // Get all shop products
    async getAllShopProducts() {
        console.log('🛒 API: Getting all shop products');
        return this.get('/shop-products');
    }

    // Get shop product by ID
    async getShopProductById(id) {
        console.log(`🛒 API: Getting shop product ${id}`);
        return this.get(`/shop-products/${id}`);
    }

    // Get shop products by shop ID
    async getShopProductsByShopId(shopId) {
        console.log(`🛒 API: Getting shop products by shop ID: ${shopId}`);
        return this.get(`/shop-products/shop/${shopId}`);
    }

    // Get shop products by type
    async getShopProductsByType(type) {
        console.log(`🛒 API: Getting shop products by type: ${type}`);
        return this.get(`/shop-products/type/${encodeURIComponent(type)}`);
    }

    // Get shop products by status
    async getShopProductsByStatus(status) {
        console.log(`🛒 API: Getting shop products by status: ${status}`);
        return this.get(`/shop-products/status/${status}`);
    }

    // Get shop products by currency type
    async getShopProductsByCurrencyType(currencyType) {
        console.log(`🛒 API: Getting shop products by currency: ${currencyType}`);
        return this.get(`/shop-products/currency/${encodeURIComponent(currencyType)}`);
    }

    // Get shop products by admin ID
    async getShopProductsByAdminId(adminId) {
        console.log(`🛒 API: Getting shop products by admin ID: ${adminId}`);
        return this.get(`/shop-products/admin/${adminId}`);
    }

    // Get shop products by price range
    async getShopProductsByPriceRange(minPrice, maxPrice) {
        console.log(`🛒 API: Getting shop products by price range: ${minPrice}-${maxPrice}`);
        return this.get(`/shop-products/price-range?min=${minPrice}&max=${maxPrice}`);
    }

    // Search shop products
    async searchShopProducts(keyword) {
        console.log(`🛒 API: Searching shop products with keyword: ${keyword}`);
        return this.get(`/shop-products/search?keyword=${encodeURIComponent(keyword)}`);
    }

    // Get active shop products
    async getActiveShopProducts() {
        console.log('🛒 API: Getting active shop products');
        return this.get('/shop-products/active');
    }

    // Create shop product
    async createShopProduct(shopProductData) {
        console.log('🛒 API: Creating shop product:', shopProductData);
        return this.post('/shop-products', shopProductData);
    }

    // Update shop product
    async updateShopProduct(id, shopProductData) {
        console.log(`🛒 API: Updating shop product ${id}:`, shopProductData);
        return this.put(`/shop-products/${id}`, shopProductData);
    }

    // Delete shop product
    async deleteShopProduct(id) {
        console.log(`🛒 API: Deleting shop product ${id}`);
        return this.delete(`/shop-products/${id}`);
    }

    // Update shop product status
    async updateShopProductStatus(id, status) {
        console.log(`🛒 API: Updating shop product ${id} status to: ${status}`);
        return this.patch(`/shop-products/${id}/status?status=${status}`);
    }

    // Test shop product API
    async testShopProductApi() {
        console.log('🛒 API: Testing shop product API');
        return this.get('/shop-products/test');
    }
}

export default new ApiService();
