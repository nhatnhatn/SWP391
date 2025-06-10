// Test the fixed data flow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testFixedDataFlow() {
    console.log('🔍 Testing Fixed Data Flow...\n');

    try {
        // Login first
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Test Items API Response
        console.log('📊 Testing Items API Response:');
        const itemsResponse = await axios.get(`${API_BASE_URL}/items`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Items API Response Success');
        console.log(`📦 Total Items: ${itemsResponse.data.data.length}`);

        // Simulate the fixed data flow
        console.log('\n🔧 Testing Fixed Data Transformation:');

        // This simulates what the fixed dataService.getItems() method now does
        const response = itemsResponse.data;
        const itemsData = response.data || response.content || response || [];
        const paginationData = response.pagination || {};

        const transformedItems = itemsData.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type || item.itemType,
            rarity: item.rarity,
            description: item.description || '',
            price: item.price || 0,
            quantity: item.quantity || 0,
            imageUrl: item.imageUrl || item.image || '',
        }));

        console.log('\n🎯 First 3 Transformed Items:');
        transformedItems.slice(0, 3).forEach((item, index) => {
            const icon = getTypeIcon(item.type);
            const translation = getVietnameseRarity(item.rarity);
            console.log(`${index + 1}. ${item.name}`);
            console.log(`   Type: "${item.type}" -> ${icon}`);
            console.log(`   Rarity: "${item.rarity}" -> "${translation}"`);
            console.log('   ---');
        });

        console.log('\n✅ Data flow should now work correctly!');
        console.log('🎨 Icons should display: 🍞, 🧸, 💊 instead of 📦');
        console.log('🌏 Translations should display Vietnamese text instead of "Không xác định"');

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    }
}

// Helper functions (copied from frontend)
function getTypeIcon(type) {
    switch (type?.toLowerCase()) {
        case 'food':
            return '🍞';
        case 'toy':
            return '🧸';
        case 'medicine':
            return '💊';
        case 'accessory':
            return '💍';
        case 'consumable':
            return '🧪';
        case 'material':
            return '⚗️';
        default:
            return '📦';
    }
}

function getVietnameseRarity(rarity) {
    const rarityTranslations = {
        common: 'Thông Thường',
        uncommon: 'Không Phổ Biến',
        rare: 'Hiếm',
        epic: 'Sử thi',
        legendary: 'Huyền Thoại',
        mythic: 'Thần Thoại'
    };

    return rarityTranslations[rarity?.toLowerCase()] || 'Không xác định';
}

// Run the test
testFixedDataFlow();
