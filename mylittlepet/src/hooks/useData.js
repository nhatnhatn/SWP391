// Custom React hooks for data management with backend integration
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Custom hook for players data management
export const usePlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlayers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getAllPlayers();
            setPlayers(response || []);
        } catch (err) {
            console.error('Failed to fetch players:', err);
            setError(err.message || 'Lỗi tải dữ liệu người chơi');
        } finally {
            setLoading(false);
        }
    }, []);

    const getPlayerById = useCallback(async (id) => {
        try {
            const player = await apiService.getPlayerById(id);
            return player;
        } catch (err) {
            console.error('Failed to get player by id:', err);
            throw err;
        }
    }, []);

    const updatePlayer = useCallback(async (id, playerData) => {
        try {
            const updatedPlayer = await apiService.updatePlayer(id, playerData);
            // Refresh players list after update
            await fetchPlayers();
            return updatedPlayer;
        } catch (err) {
            console.error('Failed to update player:', err);
            throw err;
        }
    }, [fetchPlayers]);

    // Initial load
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    return {
        players,
        loading,
        error,
        fetchPlayers,
        getPlayerById,
        updatePlayer,
        refresh: () => fetchPlayers()
    };
};

// Custom hook for pets data management
export const usePets = (initialPage = 0, initialSize = 10) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: initialPage,
        size: initialSize,
        totalElements: 0,
        totalPages: 0
    });

    const fetchPets = useCallback(async (page = pagination.page, size = pagination.size, useCache = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getAllPets();
            setPets(response.content || []);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to fetch pets:', err);
            setError(err.message || 'Lỗi tải dữ liệu thú cưng');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size]);

    const searchPets = useCallback(async (keyword, petType, rarity, page = 0, size = pagination.size) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getAllPets(); // TODO: Implement search in frontend
            setPets(response.content || []);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to search pets:', err);
            setError(err.message || 'Lỗi tìm kiếm thú cưng');
        } finally {
            setLoading(false);
        }
    }, [pagination.size]);

    const createPet = useCallback(async (petData) => {
        try {
            const newPet = await apiService.createPet(petData);
            await fetchPets(0, pagination.size, false);
            return newPet;
        } catch (err) {
            console.error('Failed to create pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.size]);

    const updatePet = useCallback(async (id, petData) => {
        try {
            const updatedPet = await apiService.updatePet(id, petData);
            await fetchPets(pagination.page, pagination.size, false);
            return updatedPet;
        } catch (err) {
            console.error('Failed to update pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const deletePet = useCallback(async (id) => {
        try {
            await apiService.deletePet(id);
            await fetchPets(pagination.page, pagination.size, false);
            return true;
        } catch (err) {
            console.error('Failed to delete pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    // Pet care actions
    const feedPet = useCallback(async (petId) => {
        try {
            const result = await apiService.feedPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to feed pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const playWithPet = useCallback(async (petId) => {
        try {
            const result = await apiService.playWithPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to play with pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const restPet = useCallback(async (petId) => {
        try {
            const result = await apiService.restPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to rest pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const healPet = useCallback(async (petId) => {
        try {
            const result = await apiService.healPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to heal pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]); useEffect(() => {
        // Load pets on component mount
        fetchPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        pets,
        loading,
        error,
        pagination,
        fetchPets,
        searchPets,
        createPet,
        updatePet,
        deletePet,
        feedPet,
        playWithPet,
        restPet,
        healPet,
        refresh: () => fetchPets(pagination.page, pagination.size, false)
    };
};

// Custom hook for items data management
export const useItems = (initialPage = 0, initialSize = 10) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: null,
        rarity: null
    });
    const [pagination, setPagination] = useState({
        page: initialPage,
        size: initialSize,
        totalElements: 0,
        totalPages: 0
    }); const fetchItems = useCallback(async (page = pagination.page, size = pagination.size, useCache = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getAllItems();
            // Ensure all items have valid types
            const validItems = (response.content || []).map(item => ({
                ...item,
                type: item.type || 'unknown', // Fallback for undefined types
                price: item.price || 0,
                quantity: item.quantity || 0
            }));

            setItems(validItems);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to fetch items:', err);
            setError(err.message || 'Lỗi tải dữ liệu vật phẩm');
            setItems([]); // Set empty array on error to prevent undefined access
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size]);

    const createItem = useCallback(async (itemData) => {
        try {
            const newItem = await apiService.createItem(itemData);
            await fetchItems(0, pagination.size, false);
            return newItem;
        } catch (err) {
            console.error('Failed to create item:', err);
            throw err;
        }
    }, [fetchItems, pagination.size]);

    const updateItem = useCallback(async (id, itemData) => {
        try {
            const updatedItem = await apiService.updateItem(id, itemData);
            await fetchItems(pagination.page, pagination.size, false);
            return updatedItem;
        } catch (err) {
            console.error('Failed to update item:', err);
            throw err;
        }
    }, [fetchItems, pagination.page, pagination.size]);

    const deleteItem = useCallback(async (id) => {
        try {
            await apiService.deleteItem(id);
            await fetchItems(pagination.page, pagination.size, false);
            return true;
        } catch (err) {
            console.error('Failed to delete item:', err);
            throw err;
        }
    }, [fetchItems, pagination.page, pagination.size]);

    // Refresh items with current filters and search
    const refreshItems = useCallback(() => {
        fetchItems(pagination.page, pagination.size, false);
    }, [fetchItems, pagination.page, pagination.size]);

    // Purchase item functionality
    const purchaseItem = useCallback(async (itemId, quantity = 1) => {
        try {
            // This would be implemented when the purchase functionality is needed
            console.log(`Purchasing item ${itemId}, quantity: ${quantity}`);
            return { success: true };
        } catch (err) {
            console.error('Failed to purchase item:', err);
            throw err;
        }
    }, []); useEffect(() => {
        // Load items on component mount
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        items,
        loading,
        error,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        fetchItems,
        refreshItems,
        createItem,
        updateItem,
        deleteItem,
        purchaseItem,
        refresh: () => fetchItems(pagination.page, pagination.size, false)
    };
};

// Custom hook for shop items
export const useShop = () => {
    const [shopItems, setShopItems] = useState([]);
    const [userInventory, setUserInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchShopItems = useCallback(async (useCache = true) => {
        setLoading(true);
        setError(null);

        try {
            const items = await apiService.getShopItems();
            setShopItems(items);
        } catch (err) {
            console.error('Failed to fetch shop items:', err);
            setError(err.message || 'Lỗi tải cửa hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserInventory = useCallback(async (userId) => {
        if (!userId) return;

        try {
            const inventory = await apiService.getUserInventory(userId);
            setUserInventory(inventory);
        } catch (err) {
            console.error('Failed to fetch user inventory:', err);
            setError(err.message || 'Lỗi tải kho đồ');
        }
    }, []);

    const buyItem = useCallback(async (itemId, quantity = 1) => {
        try {
            const result = await apiService.buyItem(itemId, quantity);
            await fetchShopItems(false); // Refresh shop
            return result;
        } catch (err) {
            console.error('Failed to buy item:', err);
            throw err;
        }
    }, [fetchShopItems]);

    const sellItem = useCallback(async (itemId, quantity = 1) => {
        try {
            const result = await apiService.sellItem(itemId, quantity);
            await fetchShopItems(false);
            return result;
        } catch (err) {
            console.error('Failed to sell item:', err);
            throw err;
        }
    }, [fetchShopItems]);

    const useItem = useCallback(async (itemId, petId) => {
        try {
            const result = await apiService.useItem(itemId, petId);
            return result;
        } catch (err) {
            console.error('Failed to use item:', err);
            throw err;
        }
    }, []); useEffect(() => {
        // Load shop items on component mount
        fetchShopItems();
    }, [fetchShopItems]);

    return {
        shopItems,
        userInventory,
        loading,
        error,
        fetchShopItems,
        fetchUserInventory,
        buyItem,
        sellItem,
        useItem,
        refresh: () => fetchShopItems(false)
    };
};

// Custom hook for a single player's data
export const usePlayer = (playerId) => {
    const [player, setPlayer] = useState(null);
    const [pets, setPets] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlayer = useCallback(async () => {
        if (!playerId) return;

        setLoading(true);
        setError(null);

        try {
            const playerData = await apiService.getPlayerById(playerId);
            setPlayer(playerData);

            // Fetch related data
            const [playerPets, playerInventory] = await Promise.all([apiService.getAllPets(), // TODO: Filter by owner
            apiService.getUserInventory(playerId)
            ]);

            setPets(playerPets);
            setInventory(playerInventory);
        } catch (err) {
            console.error('Failed to fetch player data:', err);
            setError(err.message || 'Lỗi tải dữ liệu người chơi');
        } finally {
            setLoading(false);
        }
    }, [playerId]); useEffect(() => {
        // Load player data if playerId is available
        if (playerId) {
            fetchPlayer();
        }
    }, [fetchPlayer]);

    return {
        player,
        pets,
        inventory,
        loading,
        error,
        refresh: fetchPlayer
    };
};
