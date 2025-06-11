// Simple test to check if the app is working
const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔍 Testing backend login...');

        // Test backend health
        const healthResponse = await axios.get('http://localhost:8080/api/auth/health');
        console.log('✅ Backend health:', healthResponse.data);

        // Test login
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });
        console.log('✅ Backend login successful:', loginResponse.data);

        console.log('\n🌐 Frontend URLs to test:');
        console.log('Login page: http://localhost:5173/login');
        console.log('Debug page (after login): http://localhost:5173/debug');
        console.log('Players page: http://localhost:5173/players');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testLogin();
