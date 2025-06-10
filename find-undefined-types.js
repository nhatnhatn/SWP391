// Test to find where itemTypes.undefined might be occurring
const axios = require('axios');

async function findUndefinedItemTypes() {
    try {
        console.log('🕵️ Searching for undefined item types...');

        // Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n📋 Testing all data sources...');

        // 1. Test Users/Players data
        console.log('\n1. Testing Users/Players data:');
        try {
            const usersResponse = await axios.get('http://localhost:8080/api/users/paginated?page=0&size=10', { headers });
            const users = usersResponse.data.content;

            // Check if users have inventory with items
            users.forEach(user => {
                if (user.inventory) {
                    user.inventory.forEach(item => {
                        if (!item.type || item.type === 'undefined') {
                            console.log(`   ❌ User ${user.name} has item with undefined type:`, item);
                        }
                    });
                }
            });
            console.log('   ✅ Users data checked');
        } catch (err) {
            console.log('   ❌ Users data error:', err.message);
        }

        // 2. Test Pets data
        console.log('\n2. Testing Pets data:');
        try {
            const petsResponse = await axios.get('http://localhost:8080/api/pets/paginated?page=0&size=10', { headers });
            const pets = petsResponse.data.content;

            // Check if pets have any item-related properties
            pets.forEach(pet => {
                if (pet.items || pet.inventory) {
                    console.log(`   Pet ${pet.name} has items:`, pet.items || pet.inventory);
                }
            });
            console.log('   ✅ Pets data checked');
        } catch (err) {
            console.log('   ❌ Pets data error:', err.message);
        }

        // 3. Test Items data (main focus)
        console.log('\n3. Testing Items data:');
        try {
            const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=10', { headers });
            const items = itemsResponse.data.content;

            items.forEach(item => {
                if (!item.type || item.type === 'undefined' || item.type === undefined) {
                    console.log(`   ❌ Item with undefined type:`, item);
                } else {
                    console.log(`   ✅ ${item.name}: type="${item.type}"`);
                }
            });
        } catch (err) {
            console.log('   ❌ Items data error:', err.message);
        }

        // 4. Check if there are any mock data inconsistencies
        console.log('\n4. Checking translation keys:');
        const validItemTypes = ['food', 'toy', 'medicine', 'accessory', 'consumable', 'material'];
        const mockItemTypes = ['Food', 'Toy', 'Medicine', 'Accessory', 'Consumable', 'Material'];

        mockItemTypes.forEach(type => {
            const lowerType = type.toLowerCase();
            const hasTranslation = validItemTypes.includes(lowerType);
            console.log(`   ${type} → ${lowerType} → ${hasTranslation ? '✅' : '❌'} translation`);
        });

        console.log('\n🏁 Analysis complete!');

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

findUndefinedItemTypes();
