// Test items data structure
const axios = require('axios');

async function testItemsData() {
    try {
        console.log('🔍 Testing items data structure...\n');

        // 1. Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test items endpoint
        const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=6', { headers });

        console.log('✅ Items Response Status:', itemsResponse.status);
        console.log('📊 Items Data Structure:');
        console.log('   - content:', itemsResponse.data.content.length, 'items');
        console.log('   - totalElements:', itemsResponse.data.totalElements);
        console.log('   - totalPages:', itemsResponse.data.totalPages);
        console.log('   - size:', itemsResponse.data.size);
        console.log('   - number:', itemsResponse.data.number);

        if (itemsResponse.data.content.length > 0) {
            const firstItem = itemsResponse.data.content[0];
            console.log('\n🎯 First Item Properties:');
            console.log('   - id:', firstItem.id);
            console.log('   - name:', firstItem.name);
            console.log('   - price:', firstItem.price, '(type:', typeof firstItem.price + ')');
            console.log('   - quantity:', firstItem.quantity, '(type:', typeof firstItem.quantity + ')');
            console.log('   - type:', firstItem.type);
            console.log('   - rarity:', firstItem.rarity);
            console.log('   - description:', firstItem.description);

            // Test formatNumber function
            console.log('\n🧪 Testing formatNumber function:');
            console.log('   - formatNumber(price):', firstItem.price, '→', formatNumber(firstItem.price));
            console.log('   - formatNumber(quantity):', firstItem.quantity, '→', formatNumber(firstItem.quantity));
        }

        console.log('\n🎉 Items data structure test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Copy of the fixed formatNumber function for testing
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return Number(num).toLocaleString();
}

testItemsData();
