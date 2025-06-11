// Test to catch undefined types during frontend processing
const axios = require('axios');

async function testFrontendDataFlow() {
    try {
        console.log('🔍 Testing frontend data flow for undefined types...');

        // Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Get items data exactly as frontend would
        console.log('\n📋 Testing Items API Response...');
        const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=6', { headers });

        console.log('Raw API Response:');
        console.log('- Status:', itemsResponse.status);
        console.log('- Content-Type:', itemsResponse.headers['content-type']);
        console.log('- Data structure:', Object.keys(itemsResponse.data));

        if (itemsResponse.data && itemsResponse.data.content) {
            console.log('\n📦 Individual Items Analysis:');
            itemsResponse.data.content.forEach((item, index) => {
                console.log(`\n${index + 1}. Item Analysis:`);
                console.log(`   Name: "${item.name}"`);
                console.log(`   Type: ${JSON.stringify(item.type)} (${typeof item.type})`);
                console.log(`   Type exists: ${item.type !== undefined && item.type !== null}`);
                console.log(`   Type.toLowerCase(): ${item.type ? item.type.toLowerCase() : 'ERROR - undefined/null'}`);
                console.log(`   Price: ${JSON.stringify(item.price)} (${typeof item.price})`);
                console.log(`   Quantity: ${JSON.stringify(item.quantity)} (${typeof item.quantity})`);
                console.log(`   Rarity: ${JSON.stringify(item.rarity)} (${typeof item.rarity})`);

                // Simulate what the frontend translation would do
                if (item.type === undefined || item.type === null) {
                    console.log(`   ❌ FOUND ISSUE: itemTypes.undefined would be called for ${item.name}`);
                } else {
                    const translationKey = `itemTypes.${item.type.toLowerCase()}`;
                    console.log(`   ✅ Translation key would be: "${translationKey}"`);
                }
            });

            // Check if any items have problematic data
            const problematicItems = itemsResponse.data.content.filter(item =>
                item.type === undefined ||
                item.type === null ||
                item.type === 'undefined' ||
                typeof item.type !== 'string'
            );

            if (problematicItems.length > 0) {
                console.log('\n❌ PROBLEMATIC ITEMS FOUND:');
                problematicItems.forEach(item => {
                    console.log(`   - ${item.name}: type=${JSON.stringify(item.type)}`);
                });
            } else {
                console.log('\n✅ All items have valid types');
            }
        } else {
            console.log('❌ No content found in API response');
        }

        // Test edge cases
        console.log('\n🧪 Testing Edge Cases:');

        // Test with different page sizes
        const smallResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=1', { headers });
        console.log(`- Single item response: ${smallResponse.data.content.length} items`);

        // Test with search filter
        const searchResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=10&search=food', { headers });
        console.log(`- Search response: ${searchResponse.data.content.length} items`);

        console.log('\n🏁 Frontend data flow test complete!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFrontendDataFlow();
