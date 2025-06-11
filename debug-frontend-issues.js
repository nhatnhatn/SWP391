// Debug frontend icon and translation issues
const axios = require('axios');

async function debugFrontendIssues() {
    try {
        console.log('🔍 Debugging frontend icon and translation issues...');

        // Login to get token
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Get items data exactly as frontend would receive it
        console.log('\n📦 Testing Items Data Processing:');
        const itemsResponse = await axios.get('http://localhost:8080/api/items/paginated?page=0&size=6', { headers });
        const items = itemsResponse.data.content;

        console.log(`Found ${items.length} items to analyze`);

        items.forEach((item, index) => {
            console.log(`\n${index + 1}. Item: ${item.name}`);
            console.log(`   Raw Type: "${item.type}" (${typeof item.type})`);
            console.log(`   Raw Rarity: "${item.rarity}" (${typeof item.rarity})`);

            // Test type processing
            const lowerType = item.type?.toLowerCase();
            console.log(`   Processed Type: "${lowerType}"`);

            // Test icon mapping
            const getTypeIcon = (type) => {
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
            };

            const icon = getTypeIcon(item.type);
            console.log(`   Icon: ${icon} (should be specific, not 📦)`);

            // Test translation keys
            const typeTranslationKey = `itemTypes.${lowerType}`;
            const rarityTranslationKey = `rarities.${item.rarity}`;
            console.log(`   Type Translation Key: "${typeTranslationKey}"`);
            console.log(`   Rarity Translation Key: "${rarityTranslationKey}"`);

            // Test color mapping
            const getTypeColor = (type) => {
                switch (type?.toLowerCase()) {
                    case 'food':
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    case 'toy':
                        return 'bg-pink-100 text-pink-800 border-pink-200';
                    case 'medicine':
                        return 'bg-green-100 text-green-800 border-green-200';
                    case 'accessory':
                        return 'bg-purple-100 text-purple-800 border-purple-200';
                    case 'consumable':
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    case 'material':
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                }
            };

            const getRarityClass = (rarity) => {
                switch (rarity?.toLowerCase()) {
                    case 'common':
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                    case 'uncommon':
                        return 'bg-green-100 text-green-800 border-green-200';
                    case 'rare':
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    case 'epic':
                        return 'bg-purple-100 text-purple-800 border-purple-200';
                    case 'legendary':
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    case 'mythic':
                        return 'bg-pink-100 text-pink-800 border-pink-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                }
            };

            const typeColor = getTypeColor(item.type);
            const rarityClass = getRarityClass(item.rarity);

            console.log(`   Type Color Class: "${typeColor}"`);
            console.log(`   Rarity Class: "${rarityClass}"`);

            // Test Vietnamese translations
            const vietnameseTranslations = {
                itemTypes: {
                    food: 'Thức ăn',
                    toy: 'Đồ chơi',
                    medicine: 'Thuốc',
                    accessory: 'Phụ kiện',
                    consumable: 'Tiêu hao',
                    material: 'Nguyên liệu',
                    unknown: 'Không xác định'
                },
                rarities: {
                    common: 'Thông Thường',
                    uncommon: 'Không Phổ Biến',
                    rare: 'Hiếm',
                    epic: 'Sử thi',
                    legendary: 'Huyền thoại',
                    mythic: 'Thần thoại'
                }
            };

            const typeTranslation = vietnameseTranslations.itemTypes[lowerType] || item.type || 'Không xác định';
            const rarityTranslation = vietnameseTranslations.rarities[item.rarity] || 'Không xác định';

            console.log(`   Type Translation: "${typeTranslation}"`);
            console.log(`   Rarity Translation: "${rarityTranslation}"`);

            // Check for issues
            if (icon === '📦') {
                console.log(`   ❌ ISSUE: Using default icon instead of specific icon for ${item.type}`);
            }
            if (typeTranslation === 'Không xác định') {
                console.log(`   ❌ ISSUE: Type translation missing for "${lowerType}"`);
            }
            if (rarityTranslation === 'Không xác định') {
                console.log(`   ❌ ISSUE: Rarity translation missing for "${item.rarity}"`);
            }
            if (!typeColor.includes('bg-')) {
                console.log(`   ❌ ISSUE: Invalid type color class`);
            }
            if (!rarityClass.includes('bg-')) {
                console.log(`   ❌ ISSUE: Invalid rarity class`);
            }
        });

        console.log('\n🎯 Summary of Expected vs Actual:');
        console.log('Expected Icons:');
        console.log('- Food items: 🍞');
        console.log('- Toy items: 🧸');
        console.log('- Medicine items: 💊');
        console.log('Issue in screenshot: All items showing 📦 (generic box)');

        console.log('\nExpected Translations:');
        console.log('- Food: "Thức ăn"');
        console.log('- Toy: "Đồ chơi"');
        console.log('- Medicine: "Thuốc"');
        console.log('- Common rarity: "Thông Thường"');
        console.log('- Uncommon rarity: "Không Phổ Biến"');
        console.log('Issue in screenshot: All rarities showing "Không xác định" (Unknown)');

        console.log('\n🏁 Debug complete!');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugFrontendIssues();
