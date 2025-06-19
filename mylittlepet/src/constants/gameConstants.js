// Constants for the game
// This file replaces constants previously defined in mockData.js

export const RARITY_TYPES = {
    COMMON: 'COMMON',
    UNCOMMON: 'UNCOMMON',
    RARE: 'RARE',
    EPIC: 'EPIC',
    LEGENDARY: 'LEGENDARY',
    MYTHIC: 'MYTHIC'
};

export const PET_TYPES = {
    DRAGON: 'DRAGON',
    BIRD: 'BIRD',
    BEAST: 'BEAST',
    ELEMENTAL: 'ELEMENTAL',
    FAIRY: 'FAIRY',
    REPTILE: 'REPTILE',
    MAGICAL: 'MAGICAL',
    SPIRIT: 'SPIRIT',
    GOLEM: 'GOLEM'
};

export const ITEM_TYPES = {
    FOOD: 'FOOD',
    TOY: 'TOY',
    MEDICINE: 'MEDICINE',
    ACCESSORY: 'ACCESSORY',
    SPECIAL: 'SPECIAL'
};

export const RARITY_COLORS = {
    [RARITY_TYPES.COMMON]: '#9ca3af',
    [RARITY_TYPES.UNCOMMON]: '#22c55e',
    [RARITY_TYPES.RARE]: '#3b82f6',
    [RARITY_TYPES.EPIC]: '#8b5cf6',
    [RARITY_TYPES.LEGENDARY]: '#f59e0b',
    [RARITY_TYPES.MYTHIC]: '#ec4899'
};

// Vietnamese translations for types
export const PET_TYPE_TRANSLATIONS = {
    [PET_TYPES.DRAGON]: 'Rồng',
    [PET_TYPES.BIRD]: 'Chim',
    [PET_TYPES.BEAST]: 'Thú',
    [PET_TYPES.ELEMENTAL]: 'Nguyên Tố',
    [PET_TYPES.FAIRY]: 'Tiên',
    [PET_TYPES.REPTILE]: 'Bò Sát',
    [PET_TYPES.MAGICAL]: 'Phép Thuật',
    [PET_TYPES.SPIRIT]: 'Linh Hồn',
    [PET_TYPES.GOLEM]: 'Golem'
};

export const RARITY_TRANSLATIONS = {
    [RARITY_TYPES.COMMON]: 'Thông Thường',
    [RARITY_TYPES.UNCOMMON]: 'Không Phổ Biến',
    [RARITY_TYPES.RARE]: 'Hiếm',
    [RARITY_TYPES.EPIC]: 'Sử Thi',
    [RARITY_TYPES.LEGENDARY]: 'Huyền Thoại',
    [RARITY_TYPES.MYTHIC]: 'Thần Thoại'
};

export const ITEM_TYPE_TRANSLATIONS = {
    [ITEM_TYPES.FOOD]: 'Thức Ăn',
    [ITEM_TYPES.TOY]: 'Đồ Chơi',
    [ITEM_TYPES.MEDICINE]: 'Thuốc',
    [ITEM_TYPES.ACCESSORY]: 'Phụ Kiện',
    [ITEM_TYPES.SPECIAL]: 'Đặc Biệt'
};
