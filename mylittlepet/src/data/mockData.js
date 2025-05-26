// Mock data for the game admin dashboard

export const RARITY_TYPES = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
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
        level: 45,
        registeredAt: '2024-01-15T08:30:00Z',
        lastLogin: '2024-05-23T14:20:00Z',
        status: 'active',
        totalPets: 12,
        totalItems: 89
    },
    {
        id: 2,
        username: 'MysticMage',
        email: 'mystic@game.com',
        level: 67,
        registeredAt: '2024-02-20T10:15:00Z',
        lastLogin: '2024-05-24T09:45:00Z',
        status: 'active',
        totalPets: 23,
        totalItems: 156
    },
    {
        id: 3,
        username: 'ShadowHunter',
        email: 'shadow@game.com',
        level: 34,
        registeredAt: '2024-03-10T16:22:00Z',
        lastLogin: '2024-05-20T18:30:00Z',
        status: 'inactive',
        totalPets: 8,
        totalItems: 45
    },
    {
        id: 4,
        username: 'FireWarrior',
        email: 'fire@game.com',
        level: 52,
        registeredAt: '2024-01-05T12:45:00Z',
        lastLogin: '2024-05-24T11:15:00Z',
        status: 'active',
        totalPets: 18,
        totalItems: 102
    },
    {
        id: 5,
        username: 'IceQueen',
        email: 'ice@game.com',
        level: 89,
        registeredAt: '2023-12-01T14:30:00Z',
        lastLogin: '2024-05-23T20:10:00Z',
        status: 'active',
        totalPets: 31,
        totalItems: 234
    }
];

// Mock pets data
export const mockPets = [
    {
        id: 1,
        name: 'Rex',
        type: 'Dog',
        rarity: RARITY_TYPES.MYTHIC,
        level: 100,
        ownerId: 1,
        stats: { hp: 5000, attack: 800, defense: 600, speed: 450 },
        abilities: ['Loyal Guard', 'Powerful Bite', 'Tracking']
    },
    {
        id: 2,
        name: 'Fluffy',
        type: 'Cat',
        rarity: RARITY_TYPES.LEGENDARY,
        level: 85,
        ownerId: 2,
        stats: { hp: 3500, attack: 650, defense: 400, speed: 700 },
        abilities: ['Night Vision', 'Quick Reflexes', 'Silent Paws']
    },
    {
        id: 3,
        name: 'Thumper',
        type: 'Rabbit',
        rarity: RARITY_TYPES.EPIC,
        level: 60,
        ownerId: 3,
        stats: { hp: 2800, attack: 550, defense: 350, speed: 600 },
        abilities: ['Quick Hop', 'Heightened Hearing', 'Burrow']
    },
    {
        id: 4,
        name: 'Tank',
        type: 'Turtle',
        rarity: RARITY_TYPES.RARE,
        level: 45,
        ownerId: 4,
        stats: { hp: 4000, attack: 400, defense: 800, speed: 200 },
        abilities: ['Shell Defense', 'Water Adaptation', 'Patience']
    },
    {
        id: 5,
        name: 'Chirpy',
        type: 'Canary',
        rarity: RARITY_TYPES.UNCOMMON,
        level: 30,
        ownerId: 5,
        stats: { hp: 1800, attack: 300, defense: 250, speed: 500 },
        abilities: ['Sweet Song', 'Early Warning', 'Flight']
    },
    {
        id: 6,
        name: 'Whiskers',
        type: 'Mouse',
        rarity: RARITY_TYPES.COMMON,
        level: 15,
        ownerId: 1,
        stats: { hp: 800, attack: 150, defense: 100, speed: 400 },
        abilities: ['Tiny Squeeze', 'Quick Escape']
    }
];

// Mock items data
export const mockItems = [
    {
        id: 1,
        name: 'Excalibur',
        type: 'Weapon',
        rarity: RARITY_TYPES.MYTHIC,
        description: 'The legendary sword of kings',
        stats: { attack: 500, critRate: 25 },
        price: 100000,
        quantity: 1
    },
    {
        id: 2,
        name: 'Dragon Scale Armor',
        type: 'Armor',
        rarity: RARITY_TYPES.LEGENDARY,
        description: 'Armor forged from ancient dragon scales',
        stats: { defense: 400, fireResist: 80 },
        price: 75000,
        quantity: 3
    },
    {
        id: 3,
        name: 'Phoenix Feather',
        type: 'Consumable',
        rarity: RARITY_TYPES.EPIC,
        description: 'Resurrects a fallen pet with full health',
        stats: { revive: true },
        price: 25000,
        quantity: 12
    },
    {
        id: 4,
        name: 'Mana Potion',
        type: 'Consumable',
        rarity: RARITY_TYPES.RARE,
        description: 'Restores 500 MP',
        stats: { manaRestore: 500 },
        price: 1000,
        quantity: 150
    },
    {
        id: 5,
        name: 'Health Potion',
        type: 'Consumable',
        rarity: RARITY_TYPES.UNCOMMON,
        description: 'Restores 300 HP',
        stats: { healthRestore: 300 },
        price: 500,
        quantity: 300
    },
    {
        id: 6,
        name: 'Bread',
        type: 'Food',
        rarity: RARITY_TYPES.COMMON,
        description: 'Basic food item',
        stats: { healthRestore: 50 },
        price: 10,
        quantity: 1000
    }
];

// Mock analytics data
export const mockAnalytics = {
    playerGrowth: [
        { month: 'Jan', players: 1200 },
        { month: 'Feb', players: 1800 },
        { month: 'Mar', players: 2400 },
        { month: 'Apr', players: 3200 },
        { month: 'May', players: 4100 }
    ],
    rarityDistribution: [
        { rarity: 'Common', count: 1567, percentage: 45.2 },
        { rarity: 'Uncommon', count: 892, percentage: 25.7 },
        { rarity: 'Rare', count: 456, percentage: 13.1 },
        { rarity: 'Epic', count: 234, percentage: 6.7 },
        { rarity: 'Legendary', count: 167, percentage: 4.8 },
        { rarity: 'Mythic', count: 156, percentage: 4.5 }
    ],
    dailyActiveUsers: [
        { date: '2024-05-18', users: 3200 },
        { date: '2024-05-19', users: 3100 },
        { date: '2024-05-20', users: 2900 },
        { date: '2024-05-21', users: 3400 },
        { date: '2024-05-22', users: 3600 },
        { date: '2024-05-23', users: 3800 },
        { date: '2024-05-24', users: 4100 }
    ]
};
