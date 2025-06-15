// Data service layer that integrates frontend with backend API
// This replaces mockData.js with real API calls

import apiService from './api';

// Constants from backend (these should match backend enums)
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

class DataService {
    // Cache for frequently accessed data
    constructor() {
        this.cache = {
            users: null,
            pets: null,
            items: null,
            shopItems: null
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.cacheTimestamps = {};
    }

    // Cache management
    isCacheValid(key) {
        const timestamp = this.cacheTimestamps[key];
        return timestamp && (Date.now() - timestamp) < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache[key] = data;
        this.cacheTimestamps[key] = Date.now();
    }

    clearCache(key = null) {
        if (key) {
            this.cache[key] = null;
            delete this.cacheTimestamps[key];
        } else {
            this.cache = { users: null, pets: null, items: null, shopItems: null };
            this.cacheTimestamps = {};
        }
    }

    // Users/Players Data Service
    async getPlayers(page = 0, size = 10, useCache = true) {
        try {
            if (useCache && this.isCacheValid('users')) {
                return this.cache.users;
            }

            const response = await apiService.getUsers(page, size);

            // Transform backend data to match frontend expectations
            const players = {
                content: response.content?.map(this.transformUserToPlayer) || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                size: response.size || size,
                number: response.number || page
            };

            this.setCache('users', players);
            return players;

        } catch (error) {
            console.error('Failed to fetch players:', error);
            return this.getFallbackPlayers();
        }
    }

    async getAllPlayers() {
        try {
            const users = await apiService.getAllUsers();
            return users.map(this.transformUserToPlayer);
        } catch (error) {
            console.error('Failed to fetch all players:', error);
            return [];
        }
    }

    async getPlayerById(id) {
        try {
            const user = await apiService.getUserById(id);
            return this.transformUserToPlayer(user);
        } catch (error) {
            console.error(`Failed to fetch player ${id}:`, error);
            return null;
        }
    }

    async searchPlayers(keyword, page = 0, size = 10) {
        try {
            const response = await apiService.searchUsers(keyword, page, size);
            return {
                content: response.content?.map(this.transformUserToPlayer) || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                size: response.size || size,
                number: response.number || page
            };
        } catch (error) {
            console.error('Failed to search players:', error);
            return { content: [], totalElements: 0, totalPages: 0, size, number: page };
        }
    }

    // Transform backend User to frontend Player format
    transformUserToPlayer(user) {
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level || 1,
            registeredAt: user.createdAt,
            lastLogin: user.lastLogin,
            status: user.status || 'Active',
            totalPets: user.totalPets || 0,
            totalItems: user.totalItems || 0,
            totalAchievements: user.totalAchievements || 0,
            coins: user.coins || 0,
            experience: user.experience || 0,
            pets: user.pets?.map(this.transformPetToSummary) || [],
            careHistory: user.careHistory?.map(this.transformCareHistory) || [],
            achievements: user.achievements || [],
            activityLogs: user.activityLogs || []
        };
    }

    // Pets Data Service
    async getPets(page = 0, size = 10, useCache = true) {
        try {
            if (useCache && this.isCacheValid('pets')) {
                return this.cache.pets;
            }

            const response = await apiService.getPets(page, size);

            const pets = {
                content: response.content?.map(this.transformPet) || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                size: response.size || size,
                number: response.number || page
            };

            this.setCache('pets', pets);
            return pets;

        } catch (error) {
            console.error('Failed to fetch pets:', error);
            return this.getFallbackPets();
        }
    }

    async getAllPets() {
        try {
            const pets = await apiService.getAllPets();
            return pets.map(this.transformPet);
        } catch (error) {
            console.error('Failed to fetch all pets:', error);
            return [];
        }
    }

    async getPetById(id) {
        try {
            const pet = await apiService.getPetById(id);
            return this.transformPet(pet);
        } catch (error) {
            console.error(`Failed to fetch pet ${id}:`, error);
            return null;
        }
    }

    async getPetsByOwner(ownerId) {
        try {
            const pets = await apiService.getPetsByOwner(ownerId);
            return pets.map(this.transformPet);
        } catch (error) {
            console.error(`Failed to fetch pets for owner ${ownerId}:`, error);
            return [];
        }
    }

    async searchPets(keyword, petType, rarity, page = 0, size = 10) {
        try {
            const response = await apiService.searchPets(keyword, petType, rarity, page, size);
            return {
                content: response.content?.map(this.transformPet) || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                size: response.size || size,
                number: response.number || page
            };
        } catch (error) {
            console.error('Failed to search pets:', error);
            return { content: [], totalElements: 0, totalPages: 0, size, number: page };
        }
    }

    // Pet care actions
    async feedPet(petId) {
        try {
            const result = await apiService.feedPet(petId);
            this.clearCache('pets'); // Clear cache to refresh data
            return result;
        } catch (error) {
            console.error(`Failed to feed pet ${petId}:`, error);
            throw error;
        }
    }

    async playWithPet(petId) {
        try {
            const result = await apiService.playWithPet(petId);
            this.clearCache('pets');
            return result;
        } catch (error) {
            console.error(`Failed to play with pet ${petId}:`, error);
            throw error;
        }
    }

    async restPet(petId) {
        try {
            const result = await apiService.restPet(petId);
            this.clearCache('pets');
            return result;
        } catch (error) {
            console.error(`Failed to rest pet ${petId}:`, error);
            throw error;
        }
    }

    async healPet(petId) {
        try {
            const result = await apiService.healPet(petId);
            this.clearCache('pets');
            return result;
        } catch (error) {
            console.error(`Failed to heal pet ${petId}:`, error);
            throw error;
        }
    }

    // Transform backend Pet to frontend format
    transformPet(pet) {
        if (!pet) return null;

        return {
            id: pet.id,
            name: pet.name,
            type: pet.petType,
            rarity: pet.rarity,
            level: pet.level || 1,
            experience: pet.experience || 0,
            maxHp: pet.maxHp || 100,
            currentHp: pet.currentHp || pet.maxHp || 100,
            attack: pet.attack || 10,
            defense: pet.defense || 10,
            speed: pet.speed || 10,
            happiness: pet.happiness || 50,
            hunger: pet.hunger || 50,
            energy: pet.energy || 50,
            abilities: pet.abilities || [],
            description: pet.description || '',
            imageUrl: pet.imageUrl || '',
            ownerId: pet.ownerId,
            ownerName: pet.ownerName,
            createdAt: pet.createdAt,
            lastCareTime: pet.lastCareTime
        };
    }

    transformPetToSummary(pet) {
        if (!pet) return null;

        return {
            id: pet.id,
            name: pet.name,
            type: pet.petType,
            level: pet.level || 1,
            rarity: pet.rarity
        };
    }    // Items Data Service
    async getItems(page = 0, size = 10, useCache = true) {
        // Commented out for auth-only testing
        // try {
        //     if (useCache && this.isCacheValid('items')) {
        //         return this.cache.items;
        //     }

        //     const response = await apiService.getItems(page, size);

        //     // Handle different API response structures
        //     const itemsData = response.data || response.content || response || [];
        //     const paginationData = response.pagination || {};

        //     const items = {
        //         content: itemsData.map(this.transformItem) || [],
        //         totalElements: paginationData.count || response.totalElements || itemsData.length,
        //         totalPages: paginationData.total || response.totalPages || 1,
        //         size: size,
        //         number: paginationData.current ? paginationData.current - 1 : page // API uses 1-based, we use 0-based
        //     };

        //     this.setCache('items', items);
        //     return items;
        // Return mock empty data for now
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: size,
            number: page
        };

        // } catch (error) {
        //     console.error('Failed to fetch items:', error);
        //     return this.getFallbackItems();
        // }
    } async getAllItems() {
        try {
            const response = await apiService.getAllItems();
            // Handle different API response structures - the response might be in response.data
            const items = response.data || response || [];
            return items.map(this.transformItem);
        } catch (error) {
            console.error('Failed to fetch all items:', error);
            return [];
        }
    }

    async getShopItems(useCache = true) {
        try {
            if (useCache && this.isCacheValid('shopItems')) {
                return this.cache.shopItems;
            }

            const items = await apiService.getShopItems();
            const shopItems = items.map(this.transformItem);

            this.setCache('shopItems', shopItems);
            return shopItems;

        } catch (error) {
            console.error('Failed to fetch shop items:', error);
            return [];
        }
    }

    async getUserInventory(userId) {
        try {
            const inventory = await apiService.getUserInventory(userId);
            return inventory.map(item => ({
                ...this.transformItem(item),
                quantity: item.quantity || 1
            }));
        } catch (error) {
            console.error(`Failed to fetch inventory for user ${userId}:`, error);
            return [];
        }
    }

    // Shop operations
    async buyItem(itemId, quantity = 1) {
        try {
            const result = await apiService.buyItem(itemId, quantity);
            this.clearCache(); // Clear all cache to refresh data
            return result;
        } catch (error) {
            console.error(`Failed to buy item ${itemId}:`, error);
            throw error;
        }
    }

    async sellItem(itemId, quantity = 1) {
        try {
            const result = await apiService.sellItem(itemId, quantity);
            this.clearCache();
            return result;
        } catch (error) {
            console.error(`Failed to sell item ${itemId}:`, error);
            throw error;
        }
    }

    async useItem(itemId, petId) {
        try {
            const result = await apiService.useItem(itemId, petId);
            this.clearCache();
            return result;
        } catch (error) {
            console.error(`Failed to use item ${itemId} on pet ${petId}:`, error);
            throw error;
        }
    }    // Transform backend Item to frontend format
    transformItem(item) {
        if (!item) return null;

        return {
            id: item.id,
            name: item.name,
            type: item.type || item.itemType, // Handle both possible field names
            rarity: item.rarity,
            description: item.description || '',
            price: item.price || 0,
            quantity: item.quantity || 0, // Add quantity field
            sellPrice: item.sellPrice || Math.floor((item.price || 0) * 0.7),
            imageUrl: item.imageUrl || item.image || '', // Handle both image field names
            effects: item.effects || {},
            stats: item.stats || {},
            isStackable: item.isStackable !== false,
            maxStack: item.maxStack || 99,
            requirements: item.requirements || {},
            createdAt: item.createdAt
        };
    }

    // Transform care history
    transformCareHistory(careHistory) {
        if (!careHistory) return null;

        return {
            date: careHistory.careTime,
            action: careHistory.careType,
            petName: careHistory.petName,
            details: careHistory.details || ''
        };
    }

    // Fallback data for offline/error scenarios
    getFallbackPlayers() {
        return {
            content: [
                {
                    id: 1,
                    username: 'DemoUser',
                    email: 'demo@mylittlepet.com',
                    level: 1,
                    registeredAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    status: 'Active',
                    totalPets: 0,
                    totalItems: 0,
                    totalAchievements: 0,
                    pets: [],
                    careHistory: []
                }
            ],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0
        };
    }

    getFallbackPets() {
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0
        };
    }

    getFallbackItems() {
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0
        };
    }

    // CRUD Operations
    async createPlayer(playerData) {
        try {
            const result = await apiService.createUser(playerData);
            this.clearCache('users');
            return this.transformUserToPlayer(result);
        } catch (error) {
            console.error('Failed to create player:', error);
            throw error;
        }
    }

    async updatePlayer(id, playerData) {
        try {
            const result = await apiService.updateUser(id, playerData);
            this.clearCache('users');
            return this.transformUserToPlayer(result);
        } catch (error) {
            console.error(`Failed to update player ${id}:`, error);
            throw error;
        }
    }

    async deletePlayer(id) {
        try {
            await apiService.deleteUser(id);
            this.clearCache('users');
            return true;
        } catch (error) {
            console.error(`Failed to delete player ${id}:`, error);
            throw error;
        }
    }

    async createPet(petData) {
        try {
            const result = await apiService.createPet(petData);
            this.clearCache('pets');
            return this.transformPet(result);
        } catch (error) {
            console.error('Failed to create pet:', error);
            throw error;
        }
    }

    async updatePet(id, petData) {
        try {
            const result = await apiService.updatePet(id, petData);
            this.clearCache('pets');
            return this.transformPet(result);
        } catch (error) {
            console.error(`Failed to update pet ${id}:`, error);
            throw error;
        }
    }

    async deletePet(id) {
        try {
            await apiService.deletePet(id);
            this.clearCache('pets');
            return true;
        } catch (error) {
            console.error(`Failed to delete pet ${id}:`, error);
            throw error;
        }
    }

    async createItem(itemData) {
        try {
            const result = await apiService.createItem(itemData);
            this.clearCache('items');
            return this.transformItem(result);
        } catch (error) {
            console.error('Failed to create item:', error);
            throw error;
        }
    }

    async updateItem(id, itemData) {
        try {
            const result = await apiService.updateItem(id, itemData);
            this.clearCache('items');
            return this.transformItem(result);
        } catch (error) {
            console.error(`Failed to update item ${id}:`, error);
            throw error;
        }
    }

    async deleteItem(id) {
        try {
            await apiService.deleteItem(id);
            this.clearCache('items');
            return true;
        } catch (error) {
            console.error(`Failed to delete item ${id}:`, error);
            throw error;
        }
    }
}

export default new DataService();
