// Mock API service layer that simulates backend communication
// This service uses mock data instead of making real HTTP requests

import { mockPlayers, mockPets, mockItems } from '../data/mockData';

class ApiService {
    constructor() {
        this.isConnected = true; // Simulate connected state
        console.log('📢 API Service initialized in MOCK mode - No backend required');
    }

    // Simulate delay for API calls
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get stored auth token
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Generate a mock JWT token
    generateMockToken() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `mock_${token}`;
    }

    // Mock HTTP request method
    async request(endpoint, options = {}) {
        try {
            console.log('🌐 Making MOCK API request to:', endpoint);
            console.log('🔧 Request config:', options);

            // Simulate network delay
            await this.delay();

            // Simulate a network error occasionally (1% chance)
            if (Math.random() < 0.01) {
                throw new Error('Simulated network error');
            }

            const mockData = this.getMockResponse(endpoint, options);
            console.log('📦 Mock response data:', mockData);
            return mockData;
        } catch (error) {
            console.error(`Mock API request failed: ${endpoint}`, error);
            console.error('Full error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            // Simulate appropriate error messages
            if (error.message === 'Simulated network error') {
                throw new Error('Không thể kết nối đến máy chủ. Đây là lỗi giả lập.');
            } else if (error.message === 'Invalid credentials') {
                throw new Error('Email hoặc mật khẩu không đúng.');
            } else if (error.message === 'Not found') {
                throw new Error('Không tìm thấy tài nguyên yêu cầu.');
            }

            throw error;
        }
    }

    // Get appropriate mock response based on endpoint and request options
    getMockResponse(endpoint, options = {}) {
        const method = options.method || 'GET';
        let data = {};

        // Parse request body if present
        if (options.body) {
            try {
                data = JSON.parse(options.body);
            } catch (e) {
                console.error('Failed to parse request body:', e);
            }
        }

        // Handle different API endpoints
        if (endpoint.startsWith('/auth/login')) {
            return this.handleLogin(data.email, data.password);
        } else if (endpoint.startsWith('/auth/register')) {
            return this.handleRegister(data);
        } else if (endpoint.startsWith('/auth/health')) {
            return { status: 'ok', message: 'Mock API is healthy' };
        } else if (endpoint.startsWith('/pets')) {
            return mockPets;
        } else if (endpoint.startsWith('/items')) {
            return mockItems;
        } else if (endpoint.startsWith('/players') || endpoint.startsWith('/users')) {
            return mockPlayers;
        } else {
            // Default response for unknown endpoints
            return {
                status: 'success',
                message: 'Mock data response',
                data: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    // HTTP Methods
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
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

    // Authentication API
    async login(email, password) {
        console.log('🔐 Login attempt with:', { email, password });
        const response = await this.post('/auth/login', { email, password });
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    }

    async register(userData) {
        console.log('🔧 Register request data:', userData);
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    }

    // Mock login handler
    handleLogin(email, password) {
        console.log('🔐 Mock login for:', email);

        // Hardcoded admin credentials
        if (email === 'admin@mylittlepet.com' && password === 'Admin123!') {
            const token = this.generateMockToken();
            localStorage.setItem('authToken', token);

            return {
                token: token,
                adminInfo: {
                    id: 1,
                    username: 'Admin User',
                    email: 'admin@mylittlepet.com',
                    role: 'admin',
                },
                success: true,
                message: 'Login successful'
            };
        }

        throw new Error('Invalid credentials');
    }

    // Mock register handler
    handleRegister(userData) {
        console.log('👤 Mock register for:', userData);
        const token = this.generateMockToken();
        localStorage.setItem('authToken', token);

        return {
            token: token,
            userId: Math.floor(Math.random() * 1000) + 10,
            email: userData.email,
            name: userData.fullName || userData.username || 'New User',
            success: true,
            message: 'Registration successful'
        };
    }

    // Health check API
    async checkHealth() {
        try {
            await this.delay();
            // Always return connected since we're using mock API
            return { status: 'connected', response: { status: 'ok' } };
        } catch (error) {
            return { status: 'disconnected', error: error.message };
        }
    }

    // User profile API
    async getUserProfile() {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        // Return mock user profile
        return {
            id: 1,
            email: 'admin@mylittlepet.com',
            name: 'Admin User',
            role: 'admin',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
    }

    // CRUD operations for various resources
    async getPets() {
        return mockPets;
    }

    async getItems() {
        return mockItems;
    }

    async getPlayers() {
        return mockPlayers;
    }
}

const apiService = new ApiService();
export default apiService;
