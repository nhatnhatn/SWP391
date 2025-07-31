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
const API_BASE_URL = 'http://localhost:8080/api';
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
            // JWT bearer
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

    // ============================================================================================
    // USER MANAGEMENT API METHODS
    // ============================================================================================

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
