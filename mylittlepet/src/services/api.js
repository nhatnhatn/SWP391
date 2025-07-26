/**
 * ============================================================================================
 * API SERVICE LAYER - CENTRALIZED HTTP CLIENT FOR SPRING BOOT BACKEND
 * ============================================================================================
 * 
 * This service provides a centralized interface for all HTTP communications with the Spring Boot backend.
 * It handles authentication, request/response processing, error handling, and provides typed methods
 * for all API endpoints in the application.
 * 
 * Key Features:
 * - JWT token management and automatic header injection
 * - Comprehensive error handling with detailed logging
 * - Request/response logging for debugging
 * - Consistent API method patterns (CRUD operations)
 * - Environment-aware configuration
 * 
 * Architecture Pattern: Singleton service class with method chaining
 * Authentication: JWT Bearer token stored in localStorage
 * Error Handling: Custom error objects with status codes and details
 */

// Environment configuration - uses Vite environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('🌐 API Service: Using API base URL:', API_BASE_URL);

/**
 * Main API Service Class
 * Implements singleton pattern for consistent HTTP client across the application
 */
class ApiService {
    /**
     * Initialize API service with base configuration
     * Sets up the base URL for all API requests
     */
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Generate authentication headers for API requests
     * Automatically includes JWT token if user is authenticated
     * 
     * @returns {Object} Headers object with Content-Type and optional Authorization
     */
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            // Spread JWT token only if it exists - prevents undefined Authorization header
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    /**
     * ============================================================================================
     * CORE HTTP REQUEST HANDLER
     * ============================================================================================
     * 
     * Generic HTTP request method that handles all API communications
     * This is the foundation method that all other HTTP methods (GET, POST, etc.) use
     * 
     * Features:
     * - Automatic authentication header injection
     * - Comprehensive request/response logging for debugging
     * - Intelligent error handling with multiple response format support
     * - URL validation to prevent malformed requests
     * - Content-Type detection for proper response parsing
     * 
     * @param {string} endpoint - API endpoint path (e.g., '/users', '/auth/login')
     * @param {Object} options - Fetch API options (method, body, headers, etc.)
     * @returns {Promise<any>} Parsed response data or throws error
     */
    async request(endpoint, options = {}) {
        // Construct full URL by combining base URL with endpoint
        const url = `${this.baseURL}${endpoint}`;

        // Merge default headers with any custom options
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            // Debug logging - helps track API calls during development
            console.log('🌐 Making API request to:', url);
            console.log('🔧 Request config:', {
                ...config,
                // Parse body for logging if it exists (JSON.parse is safe here due to our JSON.stringify usage)
                body: config.body ? JSON.parse(config.body) : undefined
            });

            // URL validation - prevents requests to malformed URLs
            if (!url || !url.startsWith('http')) {
                console.error('❌ Invalid API URL:', url);
                throw new Error(`Invalid API URL: ${url}. Check your baseURL and endpoint.`);
            }

            // Execute the HTTP request using Fetch API
            const response = await fetch(url, config);

            // Debug logging for response analysis
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            // Intelligent response parsing based on Content-Type header
            const contentType = response.headers.get('content-type');
            let data;
            try {
                if (contentType && contentType.includes('application/json')) {
                    // Parse JSON responses (most common for our API)
                    data = await response.json();
                } else {
                    // Handle text responses (error messages, plain text)
                    data = await response.text();
                }
            } catch (parseError) {
                console.error('❌ Error parsing response:', parseError);
                // Fallback to text if JSON parsing fails
                data = await response.text();
            }

            console.log('📦 Response data:', data);

            /**
             * ============================================================================================
             * ERROR HANDLING AND RESPONSE VALIDATION
             * ============================================================================================
             * 
             * This section handles HTTP error responses and creates meaningful error objects
             * for the frontend to display appropriate user messages
             */
            if (!response.ok) {
                // Comprehensive error logging for debugging failed requests
                console.error('❌ Request failed with status:', response.status);
                console.error('❌ Response body:', data);
                console.error('❌ Content-Type:', contentType);
                console.error('❌ Request URL:', url);
                console.error('❌ Request method:', config.method || 'GET');
                if (config.body) {
                    console.error('❌ Request body:', JSON.parse(config.body));
                }

                // Extract meaningful error messages from different response formats
                let errorMessage = `HTTP ${response.status}`;
                let errorDetails = [];

                // Special handling for 404 errors with helpful context
                if (response.status === 404) {
                    errorMessage = `API not found: ${endpoint}. Verify that this endpoint exists on the server.`;
                } else if (typeof data === 'object' && data !== null) {
                    // Extract error message from common Spring Boot error response formats
                    if (data.message) {
                        errorMessage = data.message;
                    } else if (data.error) {
                        errorMessage = data.error;
                    } else if (data.details) {
                        errorMessage = data.details;
                    }

                    // Collect validation errors if any (useful for form validation)
                    if (data.errors) {
                        errorDetails = Array.isArray(data.errors) ? data.errors : [data.errors];
                    }
                }

                // Create enhanced error object with additional context
                const error = new Error(errorMessage);
                error.status = response.status;     // HTTP status code
                error.details = errorDetails;       // Validation details
                error.response = data;              // Full response for debugging
                throw error;
            }

            // Return parsed data for successful responses
            return data;
        } catch (error) {
            // Log any network or parsing errors
            console.error('❌ API Error:', error);
            if (error.stack) {
                console.error('❌ Stack trace:', error.stack);
            }
            throw error; // Re-throw for handling by calling code
        }
    }

    /**
     * ============================================================================================
     * HTTP METHOD SHORTCUTS
     * ============================================================================================
     * 
     * These methods provide convenient shortcuts for common HTTP operations
     * They all use the core request() method with appropriate configurations
     */

    /**
     * GET request - retrieve data from server
     * @param {string} endpoint - API endpoint path
     * @returns {Promise<any>} Response data
     */
    async get(endpoint) {
        return this.request(endpoint);
    }

    /**
     * POST request - create new resources
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Data to send in request body
     * @returns {Promise<any>} Response data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request - update existing resources (full replacement)
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Data to send in request body
     * @returns {Promise<any>} Response data
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request - remove resources
     * @param {string} endpoint - API endpoint path
     * @returns {Promise<any>} Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * PATCH request - partial updates to resources
     * @param {string} endpoint - API endpoint path
     * @param {Object|null} data - Optional data to send in request body
     * @returns {Promise<any>} Response data
     */
    async patch(endpoint, data = null) {
        return this.request(endpoint, {
            method: 'PATCH',
            // Only include body if data is provided
            ...(data ? { body: JSON.stringify(data) } : {})
        });
    }

    // ============================================================================================
    // AUTHENTICATION API METHODS
    // ============================================================================================

    /**
     * User login authentication
     * Sends credentials to backend and stores JWT token on successful login
     * 
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response with user data and token
     */
    async login(email, password) {
        console.log('🌐 ApiService: Attempting to login with backend:', { email });
        try {
            const response = await this.post('/auth/login', { email, password });
            console.log('✅ ApiService: Backend login response:', response);

            // Store JWT token in localStorage for subsequent requests
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }
            return response;
        } catch (error) {
            console.error('❌ ApiService: Backend login error:', error.message);
            throw error;
        }
    }

    /**
     * User registration
     * Creates new user account and automatically logs them in
     * 
     * @param {Object} userData - User registration data (email, password, name, etc.)
     * @returns {Promise<Object>} Registration response with user data and token
     */
    async register(userData) {
        console.log('🔧 Register request data:', userData);
        const response = await this.post('/auth/register', userData);

        // Auto-login after successful registration
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    }

    /**
     * Backend health check
     * Tests connection to backend server with timeout
     * 
     * @returns {Promise<Object>} Connection status and response data
     */
    async checkHealth() {
        try {
            // Test connection with 5-second timeout to prevent hanging
            const response = await this.request('/auth/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return { status: 'connected', response };
        } catch (error) {
            return { status: 'disconnected', error: error.message };
        }
    }

    /**
     * Change user password
     * Requires current password for security verification
     * 
     * @param {string} oldPassword - Current password for verification
     * @param {string} newPassword - New password to set
     * @returns {Promise<Object>} Password change response
     */
    async changePassword(oldPassword, newPassword) {
        return this.post('/auth/change-password', { oldPassword, newPassword });
    }

    /**
     * User logout
     * Clears stored authentication data from localStorage
     * Note: This is client-side only - server-side token invalidation may be needed for production
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
    }

    // ============================================================================================
    // USER MANAGEMENT API METHODS
    // ============================================================================================

    /**
     * Get paginated list of users
     * Supports server-side pagination for large user datasets
     * 
     * @param {number} page - Page number (0-based)
     * @param {number} size - Number of users per page
     * @returns {Promise<Object>} Paginated user data with metadata
     */
    async getUsers(page = 0, size = 10) {
        return this.get(`/users/paginated?page=${page}&size=${size}`);
    }

    /**
     * Get all users without pagination
     * Use with caution for large datasets
     * 
     * @returns {Promise<Array>} Complete list of all users
     */
    async getAllUsers() {
        return this.get('/users');
    }

    /**
     * Get specific user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object>} User data
     */
    async getUserById(id) {
        return this.get(`/users/${id}`);
    }

    /**
     * Get all admin users
     * For admin management and username lookup
     * 
     * @returns {Promise<Array>} List of all admin users
     */
    async getAllAdmins() {
        return this.get('/users/admins');
    }

    /**
     * Get user by email address
     * Useful for user lookup and duplicate checking
     * 
     * @param {string} email - User email address
     * @returns {Promise<Object>} User data
     */
    async getUserByEmail(email) {
        return this.get(`/users/email/${email}`);
    }

    /**
     * Search users by keyword with pagination
     * Searches across multiple user fields (name, email, etc.)
     * 
     * @param {string} keyword - Search term
     * @param {number} page - Page number (0-based)
     * @param {number} size - Number of results per page
     * @returns {Promise<Object>} Paginated search results
     */
    async searchUsers(keyword, page = 0, size = 10) {
        return this.get(`/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    }

    /**
     * Create new user account
     * @param {Object} userData - User data (email, password, name, etc.)
     * @returns {Promise<Object>} Created user data
     */
    async createUser(userData) {
        return this.post('/users', userData);
    }

    /**
     * Update existing user data
     * @param {number} id - User ID to update
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} Updated user data
     */
    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    /**
     * Delete user account
     * @param {number} id - User ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    /**
     * Add coins to user account
     * Game economy feature for rewarding users
     * 
     * @param {number} userId - Target user ID
     * @param {number} amount - Number of coins to add
     * @returns {Promise<Object>} Updated user balance
     */
    async addCoins(userId, amount) {
        return this.post(`/users/${userId}/coins`, { amount });
    }

    /**
     * Add experience points to user
     * Game progression feature
     * 
     * @param {number} userId - Target user ID
     * @param {number} experience - Experience points to add
     * @returns {Promise<Object>} Updated user experience
     */
    async addExperience(userId, experience) {
        return this.post(`/users/${userId}/experience`, { experience });
    }

    // ============================================================================================
    // PLAYER MANAGEMENT API METHODS
    // ============================================================================================
    // Players are a specialized type of user with game-specific features and data

    /**
     * Get all players for admin management
     * Includes comprehensive error handling to prevent app crashes
     * 
     * @returns {Promise<Array>} List of all players, guaranteed to return array
     */
    async getAllPlayers() {
        try {
            console.log('🔍 Fetching all players from backend');
            const response = await this.get('/players');
            console.log('✅ Players fetched successfully:', response);

            // Defensive programming: Ensure we always return an array
            // Handle different API response formats from Spring Boot
            if (Array.isArray(response)) {
                return response;
            } else if (response && typeof response === 'object') {
                // Handle paginated responses or wrapped data
                if (Array.isArray(response.content)) {
                    return response.content; // Spring Boot Page<> format
                } else if (Array.isArray(response.data)) {
                    return response.data;    // Custom wrapper format
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

    /**
     * Get specific player by ID
     * @param {number} id - Player ID
     * @returns {Promise<Object>} Player data with game statistics
     */
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

    /**
     * Get player by email address
     * Useful for player lookup and account management
     * 
     * @param {string} email - Player email address
     * @returns {Promise<Object>} Player data
     */
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

    /**
     * Get player by username
     * For username-based lookup and validation
     * 
     * @param {string} username - Player username
     * @returns {Promise<Object>} Player data
     */
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

    /**
     * Get players filtered by status
     * Supports player moderation (active, banned, etc.)
     * 
     * @param {string} status - Player status filter
     * @returns {Promise<Array>} Filtered list of players
     */
    async getPlayersByStatus(status) {
        try {
            console.log(`🔍 Fetching players with status: ${status}`);
            const response = await this.get(`/players/status/${encodeURIComponent(status)}`);
            console.log('✅ Players fetched by status successfully:', response);

            // Consistent array return handling
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

    /**
     * Update player information
     * For admin editing of player profiles and game data
     * 
     * @param {number} id - Player ID to update
     * @param {Object} playerData - Updated player data
     * @returns {Promise<Object>} Updated player data
     */
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

    /**
     * Delete player account
     * Permanent removal of player data
     * 
     * @param {number} id - Player ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
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

    /**
     * Ban player with optional end date
     * Supports both temporary and permanent bans for moderation
     * 
     * @param {number} id - Player ID to ban
     * @param {Date|null} banEndDate - Optional ban expiration date
     * @returns {Promise<Object>} Ban confirmation with details
     */
    async banPlayer(id, banEndDate = null) {
        try {
            console.log(`🚫 Banning player ${id}${banEndDate ? ` until ${banEndDate.toISOString()}` : ''}`);

            let response;
            if (banEndDate) {
                // Temporary ban with expiration date
                response = await this.put(`/players/${id}/ban`, {
                    banEndDate: banEndDate.toISOString()
                });
            } else {
                // Permanent ban (no end date)
                response = await this.put(`/players/${id}/ban`);
            }

            console.log('✅ Player banned successfully:', response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to ban player ${id}:`, error);
            throw error;
        }
    }

    /**
     * Remove ban from player
     * Restores player access to the game
     * 
     * @param {number} id - Player ID to unban
     * @returns {Promise<Object>} Unban confirmation
     */
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

    /**
     * Test player API connectivity
     * Diagnostic method for troubleshooting
     * 
     * @returns {Promise<Object>} API test results
     */
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
    }

    /**
     * Get pets owned by specific player
     * For player profile and inventory management
     * 
     * @param {number} playerId - Player ID
     * @returns {Promise<Array>} List of player's pets
     */
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

    // ============================================================================================
    // PET MANAGEMENT API METHODS
    // ============================================================================================
    // Pets are the core game entities that players can collect, train, and customize

    /**
     * Get complete list of all pets
     * Used for admin management and game content overview
     * 
     * @returns {Promise<Array>} All pets in the system
     */
    async getAllPets() {
        console.log('🐕 API: Getting all pets');
        return this.get('/pets');
    }

    /**
     * Get specific pet by ID
     * For detailed pet information and editing
     * 
     * @param {number} id - Pet ID
     * @returns {Promise<Object>} Pet data with stats and attributes
     */
    async getPetById(id) {
        console.log(`🐕 API: Getting pet ${id}`);
        return this.get(`/pets/${id}`);
    }

    /**
     * Get pets filtered by type
     * For browsing pets by category (Dog, Cat, etc.)
     * 
     * @param {string} type - Pet type filter
     * @returns {Promise<Array>} Pets of specified type
     */
    async getPetsByType(type) {
        console.log(`🐕 API: Getting pets by type: ${type}`);
        return this.get(`/pets/type/${encodeURIComponent(type)}`);
    }

    /**
     * Get pets filtered by status
     * For content management (active, disabled pets)
     * 
     * @param {number} status - Pet status (1=active, 0=inactive)
     * @returns {Promise<Array>} Pets with specified status
     */
    async getPetsByStatus(status) {
        console.log(`🐕 API: Getting pets by status: ${status}`);
        return this.get(`/pets/status/${status}`);
    }

    /**
     * Search pets by keyword
     * Full-text search across pet names and descriptions
     * 
     * @param {string} keyword - Search term
     * @returns {Promise<Array>} Matching pets
     */
    async searchPets(keyword) {
        console.log(`🐕 API: Searching pets with keyword: ${keyword}`);
        return this.get(`/pets/search?keyword=${encodeURIComponent(keyword)}`);
    }

    /**
     * Create new pet
     * For adding new pets to the game content
     * 
     * @param {Object} petData - Pet data (name, type, stats, image, etc.)
     * @returns {Promise<Object>} Created pet data
     */
    async createPet(petData) {
        console.log('🐕 API: Creating pet:', petData);
        return this.post('/pets', petData);
    }

    /**
     * Update existing pet
     * For modifying pet attributes and balancing
     * 
     * @param {number} id - Pet ID to update
     * @param {Object} petData - Updated pet data
     * @returns {Promise<Object>} Updated pet data
     */
    async updatePet(id, petData) {
        console.log(`🐕 API: Updating pet ${id}:`, petData);
        return this.put(`/pets/${id}`, petData);
    }

    /**
     * Delete pet (soft delete)
     * Removes pet from active content while preserving data
     * 
     * @param {number} id - Pet ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deletePet(id) {
        console.log(`🐕 API: Deleting pet ${id}`);
        return this.delete(`/pets/${id}`);
    }

    /**
     * Test pet API connectivity
     * Diagnostic method for troubleshooting
     * 
     * @returns {Promise<Object>} API test results
     */
    async testPetApi() {
        console.log('🐕 API: Testing pet API');
        return this.get('/pets/test');
    }

    // ============================================================================================
    // SYSTEM API METHODS
    // ============================================================================================

    /**
     * Get API documentation
     * Access to Swagger/OpenAPI documentation
     * 
     * @returns {Promise<Object>} API documentation
     */
    async getApiDocumentation() {
        return this.get('/docs');
    }

    /**
     * System health check
     * Verify overall system status
     * 
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        return this.get('/health');
    }

    // ============================================================================================
    // SHOP PRODUCT MANAGEMENT API METHODS
    // ============================================================================================
    // Shop products are items that players can purchase using in-game currency

    /**
     * Get complete catalog of all shop products
     * Used for admin management and shop content overview
     * 
     * @returns {Promise<Array>} All shop products in the system
     */
    async getAllShopProducts() {
        console.log('🛒 API: Getting all shop products');
        return this.get('/shop-products');
    }

    /**
     * Get specific shop product by ID
     * For detailed product information and editing
     * 
     * @param {number} id - Shop product ID
     * @returns {Promise<Object>} Product data with pricing and availability
     */
    async getShopProductById(id) {
        console.log(`🛒 API: Getting shop product ${id}`);
        return this.get(`/shop-products/${id}`);
    }

    /**
     * Get products from specific shop
     * For shop-specific inventory management
     * 
     * @param {number} shopId - Shop ID to filter by
     * @returns {Promise<Array>} Products in specified shop
     */
    async getShopProductsByShopId(shopId) {
        console.log(`🛒 API: Getting shop products by shop ID: ${shopId}`);
        return this.get(`/shop-products/shop/${shopId}`);
    }

    /**
     * Get products filtered by type
     * For browsing products by category (Pet, Food, etc.)
     * 
     * @param {string} type - Product type filter
     * @returns {Promise<Array>} Products of specified type
     */
    async getShopProductsByType(type) {
        console.log(`🛒 API: Getting shop products by type: ${type}`);
        return this.get(`/shop-products/type/${encodeURIComponent(type)}`);
    }

    /**
     * Get products filtered by status
     * For inventory management (active, disabled products)
     * 
     * @param {number} status - Product status (1=active, 0=inactive)
     * @returns {Promise<Array>} Products with specified status
     */
    async getShopProductsByStatus(status) {
        console.log(`🛒 API: Getting shop products by status: ${status}`);
        return this.get(`/shop-products/status/${status}`);
    }

    /**
     * Get products filtered by currency type
     * For browsing by payment method (Coin, Diamond, Gem)
     * 
     * @param {string} currencyType - Currency type filter
     * @returns {Promise<Array>} Products using specified currency
     */
    async getShopProductsByCurrencyType(currencyType) {
        console.log(`🛒 API: Getting shop products by currency: ${currencyType}`);
        return this.get(`/shop-products/currency/${encodeURIComponent(currencyType)}`);
    }

    /**
     * Get products managed by specific admin
     * For admin-specific content management
     * 
     * @param {number} adminId - Admin ID to filter by
     * @returns {Promise<Array>} Products managed by specified admin
     */
    async getShopProductsByAdminId(adminId) {
        console.log(`🛒 API: Getting shop products by admin ID: ${adminId}`);
        return this.get(`/shop-products/admin/${adminId}`);
    }

    /**
     * Get products within price range
     * For price-based filtering and analytics
     * 
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @returns {Promise<Array>} Products within specified price range
     */
    async getShopProductsByPriceRange(minPrice, maxPrice) {
        console.log(`🛒 API: Getting shop products by price range: ${minPrice}-${maxPrice}`);
        return this.get(`/shop-products/price-range?min=${minPrice}&max=${maxPrice}`);
    }

    /**
     * Search products by keyword
     * Full-text search across product names and descriptions
     * 
     * @param {string} keyword - Search term
     * @returns {Promise<Array>} Matching products
     */
    async searchShopProducts(keyword) {
        console.log(`🛒 API: Searching shop products with keyword: ${keyword}`);
        return this.get(`/shop-products/search?keyword=${encodeURIComponent(keyword)}`);
    }

    /**
     * Get only active shop products
     * For public shop display (excludes disabled products)
     * 
     * @returns {Promise<Array>} Active products available for purchase
     */
    async getActiveShopProducts() {
        console.log('🛒 API: Getting active shop products');
        return this.get('/shop-products/active');
    }

    /**
     * Create new shop product
     * For adding new items to the shop catalog
     * 
     * @param {Object} shopProductData - Product data (name, type, price, currency, etc.)
     * @returns {Promise<Object>} Created product data
     */
    async createShopProduct(shopProductData) {
        console.log('🛒 API: Creating shop product:', shopProductData);
        return this.post('/shop-products', shopProductData);
    }

    /**
     * Update existing shop product
     * For modifying product details, pricing, and availability
     * 
     * @param {number} id - Product ID to update
     * @param {Object} shopProductData - Updated product data
     * @returns {Promise<Object>} Updated product data
     */
    async updateShopProduct(id, shopProductData) {
        console.log(`🛒 API: Updating shop product ${id}:`, shopProductData);
        return this.put(`/shop-products/${id}`, shopProductData);
    }

    /**
     * Delete shop product
     * Removes product from shop catalog
     * 
     * @param {number} id - Product ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteShopProduct(id) {
        console.log(`🛒 API: Deleting shop product ${id}`);
        return this.delete(`/shop-products/${id}`);
    }

    /**
     * Update product status only
     * Quick enable/disable toggle for products
     * 
     * @param {number} id - Product ID to update
     * @param {number} status - New status (1=active, 0=inactive)
     * @returns {Promise<Object>} Updated product status
     */
    async updateShopProductStatus(id, status) {
        console.log(`🛒 API: Updating shop product ${id} status to: ${status}`);
        return this.patch(`/shop-products/${id}/status?status=${status}`);
    }

    /**
     * Test shop product API connectivity
     * Diagnostic method for troubleshooting
     * 
     * @returns {Promise<Object>} API test results
     */
    async testShopProductApi() {
        console.log('🛒 API: Testing shop product API');
        return this.get('/shop-products/test');
    }

    // ============================================================================================
    // SESSION MANAGEMENT METHODS
    // ============================================================================================

    /**
     * Get current admin session status
     * Checks remaining time and expiration warnings
     * 
     * @returns {Promise<Object>} Session status with remaining time
     */
    async getSessionStatus() {
        console.log('🔐 API: Getting session status');
        return this.get('/session/status');
    }

    /**
     * Refresh current admin session
     * Extends session timeout with new token
     * 
     * @returns {Promise<Object>} New token and session info
     */
    async refreshSession() {
        console.log('🔐 API: Refreshing session');
        return this.post('/session/refresh');
    }

    /**
     * Logout admin session
     * Invalidates current session
     * 
     * @returns {Promise<Object>} Logout confirmation
     */
    async logoutSession() {
        console.log('🔐 API: Logging out session');
        return this.post('/session/logout');
    }
}

/**
 * ============================================================================================
 * SINGLETON EXPORT
 * ============================================================================================
 * 
 * Export a single instance of ApiService to ensure consistent state management
 * across the entire application. This prevents multiple instances with different
 * configurations and provides a centralized point for API interactions.
 */
export default new ApiService();
