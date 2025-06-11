// Debug items data types
const axios = require('axios');

async function debugItemTypes() {
    try {
        console.log('🔍 Debugging item types...');

        // Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Get items data
        const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=10', { headers });
        const items = itemsResponse.data.content;

        console.log('\n📋 All items and their types:');
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name}:`);
            console.log(`   - type: "${item.type}" (${typeof item.type})`);
            console.log(`   - type.toLowerCase(): "${item.type?.toLowerCase()}"`);
            console.log(`   - rarity: "${item.rarity}"`);
            console.log(`   - price: ${item.price} (${typeof item.price})`);
            console.log(`   - quantity: ${item.quantity} (${typeof item.quantity})`);
            console.log('');
        });

        // Check for undefined or problematic types
        const problematicItems = items.filter(item =>
            !item.type ||
            typeof item.type !== 'string' ||
            item.type === 'undefined' ||
            item.price === undefined ||
            item.quantity === undefined
        );

        if (problematicItems.length > 0) {
            console.log('❌ Problematic items found:');
            problematicItems.forEach(item => {
                console.log(`   - ${item.name}: type="${item.type}", price=${item.price}, quantity=${item.quantity}`);
            });
        } else {
            console.log('✅ All items have valid types and properties');
        }

        // Check valid translation keys
        const validItemTypes = ['food', 'toy', 'medicine', 'accessory', 'consumable', 'material'];
        console.log('\n🌐 Translation check:');
        items.forEach(item => {
            const lowerType = item.type?.toLowerCase();
            const hasTranslation = validItemTypes.includes(lowerType);
            console.log(`   - ${item.name}: "${lowerType}" → ${hasTranslation ? '✅ Valid' : '❌ Missing translation'}`);
        });

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugItemTypes();
