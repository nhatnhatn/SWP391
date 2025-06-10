// Simple endpoint test
const axios = require('axios');

async function testEndpoints() {
    try {
        console.log('🔍 Testing critical endpoints...\n');

        // 1. Login to get token
        console.log('1. Testing login...');
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });
        console.log('✅ Login successful');

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test the paginated endpoints that were causing 404
        console.log('\n2. Testing paginated endpoints...');

        // Users endpoint
        try {
            const usersResponse = await axios.get('http://localhost:8080/api/users/paginated?page=0&size=6', { headers });
            console.log('✅ /api/users/paginated - Status:', usersResponse.status);
            console.log('   Data structure:', Object.keys(usersResponse.data));
        } catch (err) {
            console.log('❌ /api/users/paginated failed:', err.response?.status);
        }

        // Pets endpoint
        try {
            const petsResponse = await axios.get('http://localhost:8080/api/pets/paginated?page=0&size=6', { headers });
            console.log('✅ /api/pets/paginated - Status:', petsResponse.status);
            console.log('   Data structure:', Object.keys(petsResponse.data));
        } catch (err) {
            console.log('❌ /api/pets/paginated failed:', err.response?.status);
        }

        // Items endpoint
        try {
            const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=6', { headers });
            console.log('✅ /api/items/paginated - Status:', itemsResponse.status);
            console.log('   Data structure:', Object.keys(itemsResponse.data));
        } catch (err) {
            console.log('❌ /api/items/paginated failed:', err.response?.status);
        }

        console.log('\n🎉 All critical endpoints tested!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEndpoints();
