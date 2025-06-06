// Mock data for the game admin panel

export const RARITY_TYPES = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
};

export const PET_TYPES = {
    DRAGON: 'Dragon',
    BIRD: 'Bird',
    BEAST: 'Beast',
    ELEMENTAL: 'Elemental',
    FAIRY: 'Fairy',
    REPTILE: 'Reptile',
    MAGICAL: 'Magical',
    SPIRIT: 'Spirit',
    GOLEM: 'Golem'
};

export const RARITY_COLORS = {
    [RARITY_TYPES.COMMON]: '#9ca3af',
    [RARITY_TYPES.UNCOMMON]: '#22c55e',
    [RARITY_TYPES.RARE]: '#3b82f6',
    [RARITY_TYPES.EPIC]: '#8b5cf6',
    [RARITY_TYPES.LEGENDARY]: '#f59e0b',
    [RARITY_TYPES.MYTHIC]: '#ec4899'
};

// Mock players data
export const mockPlayers = [
    {
        id: 1,
        username: 'DragonSlayer',
        email: 'dragon@game.com',
        level: 45, registeredAt: '2024-01-15T08:30:00Z',
        lastLogin: '2024-05-23T14:20:00Z',
        status: 'Active',
        totalPets: 12,
        totalItems: 89,
        totalAchievements: 47,
        pets: [
            { id: 1, name: 'Ancient Dragon', type: 'Dragon', level: 100, rarity: 'mythic' },
            { id: 6, name: 'Forest Bunny', type: 'Beast', level: 15, rarity: 'common' }
        ],
        careHistory: [
            { date: '2024-05-24T10:30:00Z', action: 'Fed pet', petName: 'Ancient Dragon', details: 'Premium Dragon Food' },
            { date: '2024-05-23T15:45:00Z', action: 'Training', petName: 'Forest Bunny', details: 'Speed training session' }
        ], inventory: [
            { id: 1, name: 'Premium Pet Food', type: 'Food', quantity: 1, rarity: 'mythic' },
            { id: 4, name: 'Energy Drink', type: 'Medicine', quantity: 15, rarity: 'rare' }
        ], achievements: [
            { id: 1, name: 'Dragon Master', description: 'Có được một con rồng thần thoại', unlocked: '2024-01-20T12:00:00Z' },
            { id: 2, name: 'Collector', description: 'Sở hữu 10+ thú cưng', unlocked: '2024-02-15T09:30:00Z' }
        ], activityLogs: [
            { timestamp: '2024-05-24T14:20:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T14:25:00Z', action: 'Pet Care', details: 'Fed Ancient Dragon premium food', suspicious: false },
            { timestamp: '2024-05-24T14:30:00Z', action: 'Trade', details: 'Traded Mana Potion x5', suspicious: false }
        ],
        reports: [
            { id: 1, reporter: 'MysticMage', reason: 'Suspected cheating', status: 'Resolved', date: '2024-05-20T10:00:00Z' }
        ],
        adminNotes: [
            { date: '2024-05-20T11:00:00Z', admin: 'Admin1', note: 'Investigated cheating report - no evidence found' }
        ],
        adminHistory: [
            { date: '2024-05-20T11:00:00Z', admin: 'Admin1', action: 'Cleared report', details: 'Report #1 marked as resolved' }
        ]
    },
    {
        id: 2,
        username: 'MysticMage',
        email: 'mystic@game.com',
        level: 67, registeredAt: '2024-02-20T10:15:00Z',
        lastLogin: '2024-05-24T09:45:00Z',
        status: 'Active',
        totalPets: 23,
        totalItems: 156,
        totalAchievements: 89,
        pets: [
            { id: 2, name: 'Crystal Phoenix', type: 'Bird', level: 85, rarity: 'legendary' }
        ],
        careHistory: [
            { date: '2024-05-24T09:15:00Z', action: 'Evolution', petName: 'Crystal Phoenix', details: 'Evolved to final form' }
        ], inventory: [
            { id: 2, name: 'Luxury Pet Bed', type: 'Accessory', quantity: 1, rarity: 'legendary' },
            { id: 3, name: 'Revival Medicine', type: 'Medicine', quantity: 3, rarity: 'epic' }
        ], achievements: [
            { id: 3, name: 'Phoenix Rising', description: 'Tiến hóa một thú cưng phượng hoàng', unlocked: '2024-03-10T14:00:00Z' },
            { id: 4, name: 'Master Collector', description: 'Sở hữu 20+ thú cưng', unlocked: '2024-04-05T16:30:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T09:45:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T10:00:00Z', action: 'Pet Evolution', details: 'Crystal Phoenix evolved', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 3,
        username: 'ShadowHunter',
        email: 'shadow@game.com', level: 34,
        registeredAt: '2024-03-10T16:22:00Z', lastLogin: '2024-04-15T18:30:00Z',
        status: 'Inactive',
        totalPets: 8,
        totalItems: 45,
        totalAchievements: 23,
        pets: [
            { id: 3, name: 'Shadow Wolf', type: 'Beast', level: 60, rarity: 'epic' }
        ],
        careHistory: [
            { date: '2024-05-20T17:00:00Z', action: 'Fed pet', petName: 'Shadow Wolf', details: 'Raw meat' }
        ],
        inventory: [
            { id: 5, name: 'Health Potion', type: 'Consumable', quantity: 10, rarity: 'uncommon' }
        ],
        achievements: [
            { id: 5, name: 'Shadow Walker', description: 'Có được một thú cưng loại bóng tối', unlocked: '2024-03-15T20:00:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-20T18:30:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-20T18:45:00Z', action: 'Logout', details: 'Session ended', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 4,
        username: 'FireWarrior',
        email: 'fire@game.com',
        level: 52, registeredAt: '2024-01-05T12:45:00Z',
        lastLogin: '2024-05-24T11:15:00Z',
        status: 'Active',
        totalPets: 18,
        totalItems: 102,
        totalAchievements: 67,
        pets: [
            { id: 4, name: 'Earth Golem', type: 'Elemental', level: 45, rarity: 'rare' }
        ],
        careHistory: [
            { date: '2024-05-24T10:00:00Z', action: 'Training', petName: 'Earth Golem', details: 'Defense training' }
        ],
        inventory: [
            { id: 4, name: 'Mana Potion', type: 'Consumable', quantity: 20, rarity: 'rare' },
            { id: 6, name: 'Bread', type: 'Food', quantity: 50, rarity: 'common' }
        ], achievements: [
            { id: 6, name: 'Earth Caretaker', description: 'Chăm sóc thú cưng nguyên tố đất 100 lần', unlocked: '2024-04-01T12:00:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T11:15:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T11:30:00Z', action: 'Training', details: 'Earth Golem defense training', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 5,
        username: 'IceQueen',
        email: 'ice@game.com',
        level: 89, registeredAt: '2023-12-01T14:30:00Z', lastLogin: '2024-04-10T20:10:00Z',
        status: 'Inactive',
        totalPets: 31, totalItems: 234,
        totalAchievements: 156,
        pets: [
            { id: 5, name: 'Water Sprite', type: 'Fairy', level: 30, rarity: 'uncommon' }
        ],
        careHistory: [
            { date: '2024-05-23T19:30:00Z', action: 'Healing', petName: 'Water Sprite', details: 'Used healing spring' }
        ],
        inventory: [
            { id: 3, name: 'Phoenix Feather', type: 'Consumable', quantity: 5, rarity: 'epic' },
            { id: 5, name: 'Health Potion', type: 'Consumable', quantity: 25, rarity: 'uncommon' }
        ], achievements: [
            { id: 7, name: 'Ice Princess', description: 'Đạt cấp độ 80+', unlocked: '2024-03-20T15:00:00Z' },
            { id: 8, name: 'Ultimate Collector', description: 'Sở hữu 30+ thú cưng', unlocked: '2024-05-01T10:00:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-23T20:10:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-23T20:15:00Z', action: 'Healing', details: 'Healed Water Sprite', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 6,
        username: 'ToxicPlayer',
        email: 'toxic@game.com',
        level: 23,
        registeredAt: '2024-04-10T09:20:00Z',
        lastLogin: '2024-05-15T16:45:00Z',
        status: 'Banned',
        totalPets: 3,
        totalItems: 15,
        totalAchievements: 8,
        pets: [],
        careHistory: [
            { date: '2024-05-15T16:00:00Z', action: 'Fed pet', petName: 'Basic Cat', details: 'Cheap food' }
        ],
        inventory: [
            { id: 6, name: 'Bread', type: 'Food', quantity: 5, rarity: 'common' }
        ],
        achievements: [
            { id: 9, name: 'First Steps', description: 'Hoàn thành hướng dẫn', unlocked: '2024-04-10T10:00:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-15T16:45:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-15T16:50:00Z', action: 'Chat', details: 'Inappropriate language in global chat', suspicious: true },
            { timestamp: '2024-05-15T17:00:00Z', action: 'Ban', details: 'Account banned for toxic behavior', suspicious: false }
        ],
        reports: [
            { id: 2, reporter: 'IceQueen', reason: 'Toxic behavior', status: 'Confirmed', date: '2024-05-15T16:55:00Z' },
            { id: 3, reporter: 'FireWarrior', reason: 'Harassment', status: 'Confirmed', date: '2024-05-15T17:00:00Z' }
        ],
        adminNotes: [
            { date: '2024-05-15T17:05:00Z', admin: 'Admin2', note: 'Multiple reports of toxic behavior confirmed. Account banned.' }
        ], adminHistory: [
            { date: '2024-05-15T17:00:00Z', admin: 'Admin2', action: 'Account Ban', details: 'Banned for toxic behavior and harassment' }
        ]
    },
    {
        id: 7,
        username: 'SkyGazer',
        email: 'skygazer@game.com',
        level: 32,
        registeredAt: '2024-02-10T09:15:00Z',
        lastLogin: '2024-05-24T18:30:00Z',
        status: 'Active',
        totalPets: 8,
        totalItems: 67,
        totalAchievements: 29,
        pets: [
            { id: 7, name: 'Wind Eagle', type: 'Bird', level: 45, rarity: 'epic' },
            { id: 8, name: 'Cloud Sprite', type: 'Spirit', level: 30, rarity: 'rare' }
        ],
        careHistory: [
            { date: '2024-05-24T16:00:00Z', action: 'Pet Exercise', petName: 'Wind Eagle', details: 'Flight training in mountains' },
            { date: '2024-05-24T12:30:00Z', action: 'Fed pet', petName: 'Cloud Sprite', details: 'Ethereal Nectar' }
        ], inventory: [
            { id: 8, name: 'Interactive Toy Ball', type: 'Toy', quantity: 1, rarity: 'epic' },
            { id: 9, name: 'Wind Charm', type: 'Accessory', quantity: 3, rarity: 'rare' }
        ], achievements: [
            { id: 5, name: 'Sky Master', description: 'Huấn luyện thú cưng bay đến cấp 40+', unlocked: '2024-03-01T14:20:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T18:30:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T17:45:00Z', action: 'Trade', details: 'Traded Wind Charm with CrystalMage', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 8,
        username: 'CrystalMage',
        email: 'crystal@game.com',
        level: 41,
        registeredAt: '2024-01-08T11:20:00Z',
        lastLogin: '2024-05-24T20:15:00Z',
        status: 'Active',
        totalPets: 15,
        totalItems: 102,
        totalAchievements: 38,
        pets: [
            { id: 9, name: 'Crystal Golem', type: 'Golem', level: 50, rarity: 'legendary' },
            { id: 10, name: 'Gem Turtle', type: 'Beast', level: 35, rarity: 'rare' },
            { id: 11, name: 'Ruby Sprite', type: 'Spirit', level: 28, rarity: 'uncommon' }
        ],
        careHistory: [
            { date: '2024-05-24T19:00:00Z', action: 'Gem Feeding', petName: 'Crystal Golem', details: 'Fed rare crystals for power boost' },
            { date: '2024-05-24T18:15:00Z', action: 'Shell Polish', petName: 'Gem Turtle', details: 'Polished shell with crystal dust' }
        ], inventory: [
            { id: 10, name: 'Crystal Healing Stone', type: 'Medicine', quantity: 1, rarity: 'legendary' },
            { id: 11, name: 'Mana Crystal', type: 'Consumable', quantity: 25, rarity: 'epic' },
            { id: 12, name: 'Gem Fragments', type: 'Material', quantity: 150, rarity: 'rare' }
        ], achievements: [
            { id: 6, name: 'Crystal Collector', description: 'Thu thập 100+ mảnh đá quý', unlocked: '2024-02-14T16:30:00Z' },
            { id: 7, name: 'Golem Master', description: 'Sở hữu một golem huyền thoại', unlocked: '2024-03-05T10:45:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T20:15:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T19:30:00Z', action: 'Craft', details: 'Crafted 5 Mana Crystals', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 9,
        username: 'ShadowNinja',
        email: 'shadow@game.com',
        level: 38,
        registeredAt: '2024-01-25T14:45:00Z',
        lastLogin: '2024-05-24T22:00:00Z',
        status: 'Active',
        totalPets: 7,
        totalItems: 78,
        totalAchievements: 33,
        pets: [
            { id: 12, name: 'Shadow Wolf', type: 'Beast', level: 42, rarity: 'epic' },
            { id: 13, name: 'Void Cat', type: 'Spirit', level: 36, rarity: 'rare' }
        ],
        careHistory: [
            { date: '2024-05-24T21:30:00Z', action: 'Stealth Training', petName: 'Shadow Wolf', details: 'Advanced invisibility techniques' },
            { date: '2024-05-24T20:45:00Z', action: 'Fed pet', petName: 'Void Cat', details: 'Moonlight Essence' }
        ], inventory: [
            { id: 13, name: 'Stealth Training Toy', type: 'Toy', quantity: 2, rarity: 'epic' },
            { id: 14, name: 'Calming Smoke', type: 'Medicine', quantity: 20, rarity: 'uncommon' },
            { id: 15, name: 'Comfort Blanket', type: 'Accessory', quantity: 1, rarity: 'rare' }
        ], achievements: [
            { id: 8, name: 'Pet Care Expert', description: 'Thành thạo kỹ năng chăm sóc thú cưng', unlocked: '2024-02-28T19:20:00Z' }
        ], activityLogs: [
            { timestamp: '2024-05-24T22:00:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T21:15:00Z', action: 'Pet Training', details: 'Completed stealth training with Shadow Wolf', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 10,
        username: 'FlamePhoenix',
        email: 'flame@game.com',
        level: 47,
        registeredAt: '2024-01-12T16:30:00Z',
        lastLogin: '2024-05-24T19:45:00Z',
        status: 'Active',
        totalPets: 11,
        totalItems: 94,
        totalAchievements: 42,
        pets: [
            { id: 14, name: 'Fire Phoenix', type: 'Bird', level: 55, rarity: 'mythic' },
            { id: 15, name: 'Flame Salamander', type: 'Reptile', level: 38, rarity: 'epic' },
            { id: 16, name: 'Ember Sprite', type: 'Spirit', level: 25, rarity: 'rare' }
        ],
        careHistory: [
            { date: '2024-05-24T18:00:00Z', action: 'Fire Bath', petName: 'Fire Phoenix', details: 'Rejuvenation in volcanic springs' },
            { date: '2024-05-24T17:30:00Z', action: 'Heat Training', petName: 'Flame Salamander', details: 'Lava resistance training' }
        ], inventory: [
            { id: 16, name: 'Phoenix Feather', type: 'Material', quantity: 1, rarity: 'mythic' },
            { id: 17, name: 'Fire Resistance Treats', type: 'Food', quantity: 1, rarity: 'legendary' },
            { id: 18, name: 'Fire Potion', type: 'Consumable', quantity: 12, rarity: 'epic' }
        ], achievements: [
            { id: 9, name: 'Phoenix Rider', description: 'Có được một phượng hoàng thần thoại', unlocked: '2024-02-01T13:15:00Z' },
            { id: 10, name: 'Fire Care Specialist', description: 'Thành thạo chăm sóc thú cưng lửa', unlocked: '2024-03-10T11:30:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T19:45:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T19:00:00Z', action: 'Quest Complete', details: 'Completed Fire Temple quest', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 11,
        username: 'IceQueen',
        email: 'ice@game.com',
        level: 44,
        registeredAt: '2024-01-18T10:00:00Z',
        lastLogin: '2024-05-25T08:30:00Z',
        status: 'Active',
        totalPets: 9,
        totalItems: 85,
        totalAchievements: 36,
        pets: [
            { id: 17, name: 'Frost Dragon', type: 'Dragon', level: 48, rarity: 'legendary' },
            { id: 18, name: 'Snow Wolf', type: 'Beast', level: 40, rarity: 'epic' },
            { id: 19, name: 'Ice Fairy', type: 'Spirit', level: 32, rarity: 'rare' }
        ],
        careHistory: [
            { date: '2024-05-25T07:45:00Z', action: 'Ice Bath', petName: 'Frost Dragon', details: 'Glacial water treatment' },
            { date: '2024-05-24T20:00:00Z', action: 'Winter Hunt', petName: 'Snow Wolf', details: 'Hunting practice in tundra' }
        ], inventory: [
            { id: 19, name: 'Ice Therapy Kit', type: 'Medicine', quantity: 1, rarity: 'legendary' },
            { id: 20, name: 'Ice Shard', type: 'Material', quantity: 45, rarity: 'rare' },
            { id: 21, name: 'Warm Winter Coat', type: 'Accessory', quantity: 1, rarity: 'epic' }
        ], achievements: [
            { id: 11, name: 'Ice Care Specialist', description: 'Thành thạo chăm sóc thú cưng băng', unlocked: '2024-02-20T15:00:00Z' },
            { id: 12, name: 'Winter Guardian', description: 'Bảo vệ vương quốc băng giá', unlocked: '2024-03-15T12:45:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-25T08:30:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T23:15:00Z', action: 'Guild Event', details: 'Participated in Ice Festival', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 12,
        username: 'LightPaladin',
        email: 'light@game.com',
        level: 40,
        registeredAt: '2024-02-01T12:15:00Z',
        lastLogin: '2024-05-24T16:20:00Z',
        status: 'Active',
        totalPets: 6,
        totalItems: 71,
        totalAchievements: 31,
        pets: [
            { id: 20, name: 'Holy Unicorn', type: 'Beast', level: 44, rarity: 'legendary' },
            { id: 21, name: 'Light Angel', type: 'Spirit', level: 38, rarity: 'epic' }
        ],
        careHistory: [
            { date: '2024-05-24T15:30:00Z', action: 'Blessing Ritual', petName: 'Holy Unicorn', details: 'Divine blessing ceremony' },
            { date: '2024-05-24T14:45:00Z', action: 'Purification', petName: 'Light Angel', details: 'Cleansing with holy water' }
        ], inventory: [
            { id: 22, name: 'Blessed Pet Treats', type: 'Food', quantity: 1, rarity: 'legendary' },
            { id: 23, name: 'Light Potion', type: 'Consumable', quantity: 18, rarity: 'rare' },
            { id: 24, name: 'Protective Charm', type: 'Accessory', quantity: 1, rarity: 'epic' }
        ], achievements: [
            { id: 13, name: 'Divine Protector', description: 'Bảo vệ đồng minh bằng phép thuật thiêng liêng', unlocked: '2024-02-25T10:30:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T16:20:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T15:00:00Z', action: 'Healing', details: 'Healed 10 players in guild event', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 13,
        username: 'NatureDruid',
        email: 'nature@game.com',
        level: 36,
        registeredAt: '2024-02-05T09:30:00Z',
        lastLogin: '2024-05-24T21:10:00Z',
        status: 'Active',
        totalPets: 13,
        totalItems: 96,
        totalAchievements: 28,
        pets: [
            { id: 22, name: 'Ancient Tree', type: 'Plant', level: 41, rarity: 'epic' },
            { id: 23, name: 'Forest Bear', type: 'Beast', level: 37, rarity: 'rare' },
            { id: 24, name: 'Flower Fairy', type: 'Spirit', level: 29, rarity: 'uncommon' }
        ],
        careHistory: [
            { date: '2024-05-24T20:30:00Z', action: 'Photosynthesis', petName: 'Ancient Tree', details: 'Sunlight absorption session' },
            { date: '2024-05-24T19:45:00Z', action: 'Berry Feast', petName: 'Forest Bear', details: 'Fed wild berries and honey' }
        ], inventory: [
            { id: 25, name: 'Healing Garden Kit', type: 'Accessory', quantity: 1, rarity: 'epic' },
            { id: 26, name: 'Healing Herb', type: 'Consumable', quantity: 32, rarity: 'common' },
            { id: 27, name: 'Nature Essence', type: 'Material', quantity: 28, rarity: 'rare' }
        ],
        achievements: [
            { id: 14, name: 'Green Thumb', description: 'Nuôi trồng 20+ thú cưng thực vật', unlocked: '2024-03-01T14:15:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T21:10:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T20:00:00Z', action: 'Craft', details: 'Brewed 10 healing potions', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 14,
        username: 'StormBringer',
        email: 'storm@game.com',
        level: 43,
        registeredAt: '2024-01-20T13:45:00Z',
        lastLogin: '2024-05-25T07:15:00Z',
        status: 'Active',
        totalPets: 10,
        totalItems: 88,
        totalAchievements: 39,
        pets: [
            { id: 25, name: 'Thunder Bird', type: 'Bird', level: 46, rarity: 'epic' },
            { id: 26, name: 'Lightning Wolf', type: 'Beast', level: 41, rarity: 'rare' },
            { id: 27, name: 'Storm Elemental', type: 'Elemental', level: 39, rarity: 'epic' }
        ],
        careHistory: [
            { date: '2024-05-25T06:30:00Z', action: 'Storm Training', petName: 'Thunder Bird', details: 'Lightning strike practice' },
            { date: '2024-05-24T22:15:00Z', action: 'Electric Charge', petName: 'Lightning Wolf', details: 'Energy boost session' }
        ], inventory: [
            { id: 28, name: 'Thunder Training Drum', type: 'Toy', quantity: 1, rarity: 'legendary' },
            { id: 29, name: 'Storm Potion', type: 'Consumable', quantity: 14, rarity: 'epic' },
            { id: 30, name: 'Lightning Rod', type: 'Accessory', quantity: 2, rarity: 'rare' }
        ], achievements: [
            { id: 15, name: 'Storm Care Expert', description: 'Chăm sóc thú cưng trong mọi điều kiện thời tiết', unlocked: '2024-02-28T16:45:00Z' },
            { id: 16, name: 'Thunder Care Specialist', description: 'Thành thạo chăm sóc thú cưng sét', unlocked: '2024-03-20T09:30:00Z' }
        ], activityLogs: [
            { timestamp: '2024-05-25T07:15:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T23:45:00Z', action: 'Pet Care', details: 'Groomed Thunder Bird after storm training', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 15,
        username: 'MoonSorcerer',
        email: 'moon@game.com',
        level: 39,
        registeredAt: '2024-01-28T15:20:00Z',
        lastLogin: '2024-05-24T23:30:00Z',
        status: 'Active',
        totalPets: 8,
        totalItems: 73,
        totalAchievements: 34,
        pets: [
            { id: 28, name: 'Lunar Wolf', type: 'Beast', level: 43, rarity: 'epic' },
            { id: 29, name: 'Night Owl', type: 'Bird', level: 35, rarity: 'rare' },
            { id: 30, name: 'Star Sprite', type: 'Spirit', level: 31, rarity: 'uncommon' }
        ],
        careHistory: [
            { date: '2024-05-24T22:45:00Z', action: 'Moonbath', petName: 'Lunar Wolf', details: 'Lunar energy absorption under full moon' },
            { date: '2024-05-24T21:30:00Z', action: 'Night Flight', petName: 'Night Owl', details: 'Nocturnal hunting practice' }
        ], inventory: [
            { id: 31, name: 'Moonlight Grooming Kit', type: 'Accessory', quantity: 1, rarity: 'epic' },
            { id: 32, name: 'Night Potion', type: 'Consumable', quantity: 16, rarity: 'rare' },
            { id: 33, name: 'Lunar Comfort Blanket', type: 'Accessory', quantity: 1, rarity: 'epic' }
        ], achievements: [
            { id: 17, name: 'Night Care Specialist', description: 'Thành thạo chăm sóc thú cưng ban đêm', unlocked: '2024-02-15T23:00:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T23:30:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-24T22:00:00Z', action: 'Ritual', details: 'Performed lunar blessing ceremony', suspicious: false }
        ],
        reports: [],
        adminNotes: [],
        adminHistory: []
    },
    {
        id: 16,
        username: 'ChaosWarrior',
        email: 'chaos@game.com', level: 35,
        registeredAt: '2024-02-12T11:10:00Z', lastLogin: '2024-03-20T17:45:00Z',
        status: 'Inactive',
        totalPets: 5,
        totalItems: 52,
        totalAchievements: 22,
        pets: [
            { id: 31, name: 'Chaos Beast', type: 'Demon', level: 38, rarity: 'rare' },
            { id: 32, name: 'Void Hound', type: 'Beast', level: 33, rarity: 'uncommon' }
        ],
        careHistory: [
            { date: '2024-05-20T14:20:00Z', action: 'Dark Ritual', petName: 'Chaos Beast', details: 'Power enhancement ritual' },
            { date: '2024-05-19T16:30:00Z', action: 'Void Training', petName: 'Void Hound', details: 'Dimensional travel practice' }
        ], inventory: [
            { id: 34, name: 'Chaos Enrichment Toy', type: 'Toy', quantity: 1, rarity: 'rare' },
            { id: 35, name: 'Calming Potion', type: 'Medicine', quantity: 8, rarity: 'uncommon' }
        ], achievements: [
            { id: 18, name: 'Chaos Pet Caretaker', description: 'Chăm sóc thú cưng khó tính và phức tạp', unlocked: '2024-03-05T12:20:00Z' }
        ],
        activityLogs: [
            { timestamp: '2024-05-24T17:45:00Z', action: 'Login', details: 'Successful login', suspicious: false },
            { timestamp: '2024-05-20T15:00:00Z', action: 'PvP Battle', details: 'Lost match vs LightPaladin', suspicious: false }
        ],
        reports: [
            { id: 4, reporter: 'LightPaladin', reason: 'Excessive aggression in PvP', status: 'Under Review', date: '2024-05-21T10:30:00Z' }
        ],
        adminNotes: [
            { date: '2024-05-21T11:00:00Z', admin: 'Admin1', note: 'Player reported for aggressive behavior. Monitoring activity.' }
        ],
        adminHistory: [
            { date: '2024-05-21T11:00:00Z', admin: 'Admin1', action: 'Warning Issued', details: 'Warned about aggressive PvP behavior' }
        ]
    }
];

// Mock pets data
export const mockPets = [
    {
        id: 1,
        name: 'Ancient Dragon',
        type: 'Dragon',
        rarity: RARITY_TYPES.MYTHIC,
        level: 100,
        ownerId: 1,
        stats: { hp: 5000 },
        abilities: ['Hơi Thở Ấm Áp', 'Tiếng Gầm Bảo Vệ', 'Vảy Rồng Chữa Lành']
    },
    {
        id: 2,
        name: 'Crystal Phoenix',
        type: 'Bird',
        rarity: RARITY_TYPES.LEGENDARY,
        level: 85,
        ownerId: 2,
        stats: { hp: 3500 },
        abilities: ['Hồi Phục Năng Lượng', 'Cánh Pha Lê Sáng', 'Lửa Chữa Lành']
    },
    {
        id: 3,
        name: 'Shadow Wolf',
        type: 'Beast',
        rarity: RARITY_TYPES.EPIC,
        level: 60,
        ownerId: 3,
        stats: { hp: 2800 },
        abilities: ['Vỗ Về Dịu Dàng', 'Bảo Vệ Đồng Đội', 'Tầm Nhìn Ban Đêm']
    },
    {
        id: 4,
        name: 'Earth Golem',
        type: 'Elemental',
        rarity: RARITY_TYPES.RARE,
        level: 45,
        ownerId: 4,
        stats: { hp: 4000 },
        abilities: ['Tặng Đá Quý', 'Rung Lắc Nhẹ Nhàng', 'Giáp Bảo Vệ']
    },
    {
        id: 5,
        name: 'Water Sprite',
        type: 'Fairy',
        rarity: RARITY_TYPES.UNCOMMON,
        level: 30,
        ownerId: 5,
        stats: { hp: 1800 },
        abilities: ['Tưới Nước Mát', 'Hồi Máu', 'Sương Mù Dễ Chịu']
    }, {
        id: 6,
        name: 'Forest Bunny',
        type: 'Beast',
        rarity: RARITY_TYPES.COMMON,
        level: 15,
        ownerId: 1,
        stats: { hp: 800 },
        abilities: ['Nhảy Vui Vẻ', 'Cù Lét Dễ Thương']
    },
    {
        id: 7,
        name: 'Celestial Tiger',
        type: 'Beast',
        rarity: RARITY_TYPES.LEGENDARY,
        level: 78,
        ownerId: 2,
        stats: { hp: 3200 },
        abilities: ['Nhảy Múa Thiên Thể', 'Ánh Sao Chữa Lành', 'Tiếng Gầm Bảo Vệ']
    },
    {
        id: 8,
        name: 'Ice Serpent',
        type: 'Reptile',
        rarity: RARITY_TYPES.EPIC,
        level: 55,
        ownerId: 3,
        stats: { hp: 2600 },
        abilities: ['Làm Mát Dịu Dàng', 'Khiên Băng Bảo Vệ', 'Cuộn Tròn Dễ Thương']
    },
    {
        id: 9,
        name: 'Thunder Hawk',
        type: 'Bird',
        rarity: RARITY_TYPES.RARE,
        level: 42,
        ownerId: 4,
        stats: { hp: 2000 },
        abilities: ['Bay Lượn Uyển Chuyển', 'Hót Véo Von', 'Cánh Đập Nhẹ Nhàng']
    },
    {
        id: 10,
        name: 'Mystic Unicorn',
        type: 'Magical',
        rarity: RARITY_TYPES.MYTHIC,
        level: 95,
        ownerId: 5,
        stats: { hp: 4200 },
        abilities: ['Hào Quang Hồi Máu', 'Tia Cầu Vồng', 'Thanh Tẩy', 'Khiên Phép Thuật Bảo Vệ']
    },
    {
        id: 11,
        name: 'Lava Salamander',
        type: 'Reptile',
        rarity: RARITY_TYPES.UNCOMMON,
        level: 35,
        ownerId: 1,
        stats: { hp: 1600 },
        abilities: ['Hơi Ấm Dễ Chịu', 'Sóng Nhiệt Ấm Áp', 'Kháng Lạnh']
    },
    {
        id: 12,
        name: 'Void Cat',
        type: 'Magical',
        rarity: RARITY_TYPES.EPIC,
        level: 67,
        ownerId: 2,
        stats: { hp: 2400 },
        abilities: ['Bước Nhẹ Nhàng', 'Cổng Kết Nối', 'Năng Lượng Ấm Áp', 'Dịch Chuyển Vui Vẻ']
    }
];

// Mock items data
export const mockItems = [{
    id: 1,
    name: 'Premium Pet Food',
    type: 'Food',
    rarity: RARITY_TYPES.MYTHIC,
    description: 'Thức ăn cao cấp giúp thú cưng phát triển tối ưu',
    stats: { healthBoost: 500, happinessBoost: 100 },
    price: 100000,
    quantity: 1
}, {
    id: 2,
    name: 'Luxury Pet Bed',
    type: 'Accessory',
    rarity: RARITY_TYPES.LEGENDARY,
    description: 'Giường ngủ sang trọng giúp thú cưng nghỉ ngơi tốt hơn',
    stats: { comfortBoost: 400, restoreRate: 80 },
    price: 75000,
    quantity: 3
}, {
    id: 3,
    name: 'Revival Medicine',
    type: 'Medicine',
    rarity: RARITY_TYPES.EPIC,
    description: 'Thuốc hồi sinh thú cưng đã ngã xuống với đầy đủ sức khỏe',
    stats: { revive: true },
    price: 25000,
    quantity: 12
}, {
    id: 4,
    name: 'Energy Drink',
    type: 'Medicine',
    rarity: RARITY_TYPES.RARE,
    description: 'Nước tăng lực hồi phục năng lượng cho thú cưng',
    stats: { energyRestore: 500 },
    price: 1000,
    quantity: 150
}, {
    id: 5,
    name: 'Health Potion',
    type: 'Consumable',
    rarity: RARITY_TYPES.UNCOMMON,
    description: 'Hồi phục 300 HP',
    stats: { healthRestore: 300 },
    price: 500,
    quantity: 300
}, {
    id: 6,
    name: 'Bread',
    type: 'Food',
    rarity: RARITY_TYPES.COMMON,
    description: 'Thức ăn cơ bản',
    stats: { healthRestore: 50 },
    price: 10,
    quantity: 1000
}, {
    id: 7,
    name: 'Professional Grooming Kit',
    type: 'Accessory',
    rarity: RARITY_TYPES.EPIC,
    description: 'Bộ dụng cụ chăm sóc chuyên nghiệp giúp thú cưng luôn sạch sẽ',
    stats: { hygieneBoost: 300, beautyBoost: 150 },
    price: 15000,
    quantity: 45
}, {
    id: 8,
    name: 'Interactive Puzzle Toy',
    type: 'Toy',
    rarity: RARITY_TYPES.RARE,
    description: 'Đồ chơi giúp phát triển trí tuệ cho thú cưng',
    stats: { intelligenceBoost: 200, happinessBoost: 100 },
    price: 5000,
    quantity: 120
}, {
    id: 9,
    name: 'Vitamin Supplements',
    type: 'Medicine',
    rarity: RARITY_TYPES.UNCOMMON,
    description: 'Viên vitamin tăng cường sức khỏe tổng thể',
    stats: { healthBoost: 150, immunityBoost: 75 },
    price: 800,
    quantity: 200
}, {
    id: 10,
    name: 'Catnip Treats',
    type: 'Food',
    rarity: RARITY_TYPES.RARE,
    description: 'Bánh thưởng đặc biệt khiến thú cưng phấn khích',
    stats: { happinessBoost: 250, energyBoost: 100 },
    price: 2500,
    quantity: 80
}, {
    id: 11,
    name: 'Pet Shampoo',
    type: 'Consumable',
    rarity: RARITY_TYPES.COMMON,
    description: 'Dầu gội chuyên dụng cho thú cưng',
    stats: { cleanlinessBoost: 100 },
    price: 150,
    quantity: 500
}, {
    id: 12,
    name: 'Healing Herbs',
    type: 'Material',
    rarity: RARITY_TYPES.UNCOMMON,
    description: 'Thảo dược thiên nhiên có tác dụng chữa lành',
    stats: { healingPower: 80 },
    price: 300,
    quantity: 250
}, {
    id: 13,
    name: 'Diamond Collar',
    type: 'Accessory',
    rarity: RARITY_TYPES.LEGENDARY,
    description: 'Vòng cổ kim cương sang trọng tăng danh tiếng',
    stats: { prestigeBoost: 500, beautyBoost: 300 },
    price: 50000,
    quantity: 5
}, {
    id: 14,
    name: 'Comfort Blanket',
    type: 'Accessory',
    rarity: RARITY_TYPES.COMMON,
    description: 'Chăn ấm giúp thú cưng cảm thấy an toàn',
    stats: { comfortBoost: 80, stressReduction: 50 },
    price: 400,
    quantity: 300
}, {
    id: 15,
    name: 'Exercise Wheel',
    type: 'Toy',
    rarity: RARITY_TYPES.UNCOMMON,
    description: 'Bánh xe tập thể dục giúp thú cưng khỏe mạnh',
    stats: { fitnessBoost: 150, energyBoost: 75 },
    price: 1200,
    quantity: 90
}, {
    id: 16,
    name: 'Antibiotics',
    type: 'Medicine',
    rarity: RARITY_TYPES.RARE,
    description: 'Thuốc kháng sinh chữa trị bệnh tật',
    stats: { diseaseResistance: 400, healthRestore: 200 },
    price: 3000,
    quantity: 60
}, {
    id: 17,
    name: 'Dragon Scale Essence',
    type: 'Material',
    rarity: RARITY_TYPES.MYTHIC,
    description: 'Tinh chất vảy rồng hiếm có, tăng sức mạnh đặc biệt',
    stats: { powerBoost: 1000, magicResistance: 500 },
    price: 200000,
    quantity: 2
}, {
    id: 18,
    name: 'Feather Toy',
    type: 'Toy',
    rarity: RARITY_TYPES.COMMON,
    description: 'Đồ chơi lông vũ đơn giản nhưng hiệu quả',
    stats: { agilityBoost: 50, happinessBoost: 40 },
    price: 50,
    quantity: 800
}
]

