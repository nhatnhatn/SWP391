// Debug Icon Display Issue Test
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function debugIconIssue() {
    console.log('🔍 Debugging Icon and Translation Display Issue...\n');

    try {
        // Login first
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        // Test 1: Check Items API Response
        console.log('📊 Testing Items API Response:');
        console.log('Making request to:', `${API_BASE_URL}/items`);
        const itemsResponse = await axios.get(`${API_BASE_URL}/items`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response status:', itemsResponse.status);
        console.log('Response data structure:', Object.keys(itemsResponse.data));
        console.log('Response data:', JSON.stringify(itemsResponse.data, null, 2));
        if (itemsResponse.data && itemsResponse.data.data) {
            console.log('✅ Items API Response Success');
            console.log(`📦 Total Items: ${itemsResponse.data.data.length}`);

            // Show first few items with their types and rarities
            console.log('\n🎯 First 5 Items Details:');
            itemsResponse.data.data.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. ${item.name}`);
                console.log(`   Type: "${item.type}" (${typeof item.type})`);
                console.log(`   Rarity: "${item.rarity}" (${typeof item.rarity})`);
                console.log(`   Category: "${item.category}" (${typeof item.category})`);
                console.log('   ---');
            });

            // Test type icon mapping
            console.log('\n🎨 Testing Type Icon Mapping:');
            const uniqueTypes = [...new Set(itemsResponse.data.data.map(item => item.type))];
            uniqueTypes.forEach(type => {
                const icon = getTypeIcon(type);
                console.log(`   "${type}" -> ${icon}`);
            });

            // Test rarity mapping
            console.log('\n⭐ Testing Rarity Mapping:');
            const uniqueRarities = [...new Set(itemsResponse.data.data.map(item => item.rarity))];
            uniqueRarities.forEach(rarity => {
                const translation = getVietnameseRarity(rarity);
                console.log(`   "${rarity}" -> "${translation}"`);
            });

        } else {
            console.log('❌ Items API Response Failed or Empty');
        }

        // Test 2: Check Type Icon Function
        console.log('\n🧪 Testing Type Icon Function:');
        const testTypes = ['Food', 'food', 'Toy', 'toy', 'Medicine', 'medicine', 'unknown', null, undefined];
        testTypes.forEach(type => {
            const icon = getTypeIcon(type);
            console.log(`   getTypeIcon("${type}") = ${icon}`);
        });

        // Test 3: Check Translation Function
        console.log('\n🌏 Testing Vietnamese Translation Function:');
        const testRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unknown', null, undefined];
        testRarities.forEach(rarity => {
            const translation = getVietnameseRarity(rarity);
            console.log(`   getVietnameseRarity("${rarity}") = "${translation}"`);
        });

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

// Run the debug test
debugIconIssue();
