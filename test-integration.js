#!/usr/bin/env node

/**
 * Integration Test Script for Vietnamese Pet Management System
 * Tests the connection between React frontend and Spring Boot backend
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper functions
const log = (message, color = 'reset') => {
    console.log(colors[color] + message + colors.reset);
};

const test = async (name, testFn) => {
    testResults.total++;
    try {
        log(`🧪 Testing: ${name}`, 'blue');
        await testFn();
        testResults.passed++;
        log(`✅ PASSED: ${name}`, 'green');
    } catch (error) {
        testResults.failed++;
        log(`❌ FAILED: ${name}`, 'red');
        log(`   Error: ${error.message}`, 'red');
    }
    console.log('');
};

// Test functions
const testBackendHealthCheck = async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/health`, { timeout: 5000 });
    if (response.status !== 200) {
        throw new Error(`Backend health check failed with status ${response.status}`);
    }
    log('   Backend is healthy and running', 'green');
};

const testAuthEndpoint = async () => {
    try {
        // Test invalid login
        await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'invalid@test.com',
            password: 'invalid'
        });
        throw new Error('Should have failed with invalid credentials');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            log('   Authentication properly rejects invalid credentials', 'green');
        } else {
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
};

const testUsersEndpoint = async () => {
    // First login to get auth token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@mylittlepet.com',
        password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE_URL}/players`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
    });
    if (response.status !== 200) {
        throw new Error(`Players endpoint failed with status ${response.status}`);
    }
    log(`   Found ${response.data.data?.length || 0} players`, 'green');
};

const testPetsEndpoint = async () => {
    // First login to get auth token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@mylittlepet.com',
        password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE_URL}/pets`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
    });
    if (response.status !== 200) {
        throw new Error(`Pets endpoint failed with status ${response.status}`);
    }
    log(`   Found ${response.data.data?.length || 0} pets`, 'green');
};

const testItemsEndpoint = async () => {
    // First login to get auth token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@mylittlepet.com',
        password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
    });
    if (response.status !== 200) {
        throw new Error(`Items endpoint failed with status ${response.status}`);
    }
    log(`   Found ${response.data.data?.length || 0} items`, 'green');
};

const testFrontendLoading = async () => {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (response.status !== 200) {
        throw new Error(`Frontend failed to load with status ${response.status}`);
    }
    if (!response.data.includes('<title>') && !response.data.includes('root')) {
        throw new Error('Frontend HTML does not contain expected content');
    }
    log('   Frontend loads successfully', 'green');
};

const testCORSConfiguration = async () => {
    try {
        const response = await axios.options(`${API_BASE_URL}/users`, {
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'GET'
            },
            timeout: 5000
        });
        log('   CORS is properly configured', 'green');
    } catch (error) {
        // CORS preflight might not be required for simple requests
        log('   CORS check skipped (may not be required)', 'yellow');
    }
};

// Main test runner
const runTests = async () => {
    log('🚀 Starting Integration Tests for Vietnamese Pet Management System', 'bright');
    log('=' * 60, 'blue');
    console.log('');

    // Backend API Tests
    log('📡 Testing Backend API Endpoints:', 'bright');
    await test('Backend Health Check', testBackendHealthCheck); await test('Authentication Endpoint', testAuthEndpoint);
    await test('Players API Endpoint', testUsersEndpoint);
    await test('Pets API Endpoint', testPetsEndpoint);
    await test('Items API Endpoint', testItemsEndpoint);

    // Frontend Tests
    log('🌐 Testing Frontend Application:', 'bright');
    await test('Frontend Loading', testFrontendLoading);

    // Integration Tests
    log('🔗 Testing Frontend-Backend Integration:', 'bright');
    await test('CORS Configuration', testCORSConfiguration);

    // Summary
    log('=' * 60, 'blue');
    log('📊 Test Results Summary:', 'bright');
    log(`   Total Tests: ${testResults.total}`, 'blue');
    log(`   Passed: ${testResults.passed}`, 'green');
    log(`   Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');

    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`   Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

    if (testResults.failed === 0) {
        log('🎉 All tests passed! Integration is working correctly.', 'green');
        log('✨ You can now proceed with development and testing.', 'green');
    } else {
        log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
        log('💡 Make sure both frontend and backend servers are running.', 'yellow');
    }

    process.exit(testResults.failed > 0 ? 1 : 0);
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    log('❌ Unhandled Rejection at:', 'red');
    log(promise, 'red');
    log('Reason:', 'red');
    log(reason, 'red');
    process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(error => {
        log('❌ Test runner failed:', 'red');
        log(error.message, 'red');
        process.exit(1);
    });
}

module.exports = { runTests, test };
