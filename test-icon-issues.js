// Test for icon-related issues in the frontend
const axios = require('axios');

async function testIconIssues() {
    try {
        console.log('🔍 Testing icon-related issues...');

        // Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Test Items data for icon issues
        console.log('\n📦 Testing Items Data for Icon Issues:');
        const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=10', { headers });
        const items = itemsResponse.data.content;

        console.log(`Found ${items.length} items to test`);

        items.forEach((item, index) => {
            console.log(`\n${index + 1}. Testing item: ${item.name}`);
            console.log(`   Type: "${item.type}" (${typeof item.type})`);

            // Test icon mapping
            const iconMapping = {
                'food': '🍞',
                'toy': '🧸',
                'medicine': '💊',
                'accessory': '💍',
                'consumable': '🧪',
                'material': '⚗️'
            };

            const lowerType = item.type?.toLowerCase();
            const icon = iconMapping[lowerType] || '📦';
            console.log(`   Lower type: "${lowerType}"`);
            console.log(`   Icon: ${icon}`);

            // Test color mapping
            const colorMapping = {
                'food': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'toy': 'bg-pink-100 text-pink-800 border-pink-200',
                'medicine': 'bg-green-100 text-green-800 border-green-200',
                'accessory': 'bg-purple-100 text-purple-800 border-purple-200',
                'consumable': 'bg-blue-100 text-blue-800 border-blue-200',
                'material': 'bg-gray-100 text-gray-800 border-gray-200'
            };

            const color = colorMapping[lowerType] || 'bg-gray-100 text-gray-800 border-gray-200';
            console.log(`   Color class: ${color}`);

            // Test background mapping
            const bgMapping = {
                'food': 'bg-yellow-200',
                'toy': 'bg-pink-200',
                'medicine': 'bg-green-200',
                'accessory': 'bg-purple-200',
                'consumable': 'bg-blue-200',
                'material': 'bg-gray-200'
            };

            const bg = bgMapping[lowerType] || 'bg-gray-200';
            console.log(`   Background class: ${bg}`);

            // Check for potential issues
            if (!item.type || typeof item.type !== 'string') {
                console.log(`   ❌ ISSUE: Invalid type for ${item.name}`);
            } else if (!iconMapping[lowerType]) {
                console.log(`   ⚠️  WARNING: Using default icon for type "${lowerType}"`);
            } else {
                console.log(`   ✅ All icon mappings valid`);
            }
        });

        // Test players data for icon issues
        console.log('\n👥 Testing Players Data for Icon Issues:');
        const playersResponse = await axios.get('http://localhost:8080/api/users/paginated?page=0&size=5', { headers });
        const players = playersResponse.data.content;

        console.log(`Found ${players.length} players to test`);

        players.forEach((player, index) => {
            console.log(`\n${index + 1}. Testing player: ${player.name || player.username}`);
            console.log(`   Total Pets: ${player.totalPets} (${typeof player.totalPets})`);
            console.log(`   Total Items: ${player.totalItems} (${typeof player.totalItems})`);
            console.log(`   Total Achievements: ${player.totalAchievements} (${typeof player.totalAchievements})`);

            // Check for undefined values that might cause icon issues
            if (player.totalPets === undefined || player.totalPets === null) {
                console.log(`   ❌ ISSUE: totalPets is undefined for ${player.name}`);
            }
            if (player.totalItems === undefined || player.totalItems === null) {
                console.log(`   ❌ ISSUE: totalItems is undefined for ${player.name}`);
            }
            if (player.totalAchievements === undefined || player.totalAchievements === null) {
                console.log(`   ❌ ISSUE: totalAchievements is undefined for ${player.name}`);
            }
        });

        console.log('\n🏁 Icon testing complete!');

    } catch (error) {
        console.error('❌ Icon test failed:', error.message);
    }
}

testIconIssues();
