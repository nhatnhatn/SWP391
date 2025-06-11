// Custom React hooks for data management with backend integration
import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

// Custom hook for players data management
export const usePlayers = (initialPage = 0, initialSize = 10) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: initialPage,
        size: initialSize,
        totalElements: 0,
        totalPages: 0
    });

    const fetchPlayers = useCallback(async (page = pagination.page, size = pagination.size, useCache = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await dataService.getPlayers(page, size, useCache);
            setPlayers(response.content || []);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to fetch players:', err);
            setError(err.message || 'Lỗi tải dữ liệu người chơi');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size]);

    const searchPlayers = useCallback(async (keyword, page = 0, size = pagination.size) => {
        setLoading(true);
        setError(null);

        try {
            const response = await dataService.searchPlayers(keyword, page, size);
            setPlayers(response.content || []);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to search players:', err);
            setError(err.message || 'Lỗi tìm kiếm người chơi');
        } finally {
            setLoading(false);
        }
    }, [pagination.size]);

    const createPlayer = useCallback(async (playerData) => {
        try {
            const newPlayer = await dataService.createPlayer(playerData);
            await fetchPlayers(0, pagination.size, false); // Refresh from server
            return newPlayer;
        } catch (err) {
            console.error('Failed to create player:', err);
            throw err;
        }
    }, [fetchPlayers, pagination.size]);

    const updatePlayer = useCallback(async (id, playerData) => {
        try {
            const updatedPlayer = await dataService.updatePlayer(id, playerData);
            await fetchPlayers(pagination.page, pagination.size, false); // Refresh current page
            return updatedPlayer;
        } catch (err) {
            console.error('Failed to update player:', err);
            throw err;
        }
    }, [fetchPlayers, pagination.page, pagination.size]);

    const deletePlayer = useCallback(async (id) => {
        try {
            await dataService.deletePlayer(id);
            await fetchPlayers(pagination.page, pagination.size, false); // Refresh current page
            return true;
        } catch (err) {
            console.error('Failed to delete player:', err);
            throw err;
        }
    }, [fetchPlayers, pagination.page, pagination.size]);

    // Initial load
    useEffect(() => {
        fetchPlayers();
    }, []);

    return {
        players,
        loading,
        error,
        pagination,
        fetchPlayers,
        searchPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,
        refresh: () => fetchPlayers(pagination.page, pagination.size, false)
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
            const response = await dataService.getPets(page, size, useCache);
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
            const response = await dataService.searchPets(keyword, petType, rarity, page, size);
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
            const newPet = await dataService.createPet(petData);
            await fetchPets(0, pagination.size, false);
            return newPet;
        } catch (err) {
            console.error('Failed to create pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.size]);

    const updatePet = useCallback(async (id, petData) => {
        try {
            const updatedPet = await dataService.updatePet(id, petData);
            await fetchPets(pagination.page, pagination.size, false);
            return updatedPet;
        } catch (err) {
            console.error('Failed to update pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const deletePet = useCallback(async (id) => {
        try {
            await dataService.deletePet(id);
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
            const result = await dataService.feedPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to feed pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const playWithPet = useCallback(async (petId) => {
        try {
            const result = await dataService.playWithPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to play with pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const restPet = useCallback(async (petId) => {
        try {
            const result = await dataService.restPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to rest pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    const healPet = useCallback(async (petId) => {
        try {
            const result = await dataService.healPet(petId);
            await fetchPets(pagination.page, pagination.size, false);
            return result;
        } catch (err) {
            console.error('Failed to heal pet:', err);
            throw err;
        }
    }, [fetchPets, pagination.page, pagination.size]);

    useEffect(() => {
        fetchPets();
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
    const [pagination, setPagination] = useState({
        page: initialPage,
        size: initialSize,
        totalElements: 0,
        totalPages: 0
    });

    const fetchItems = useCallback(async (page = pagination.page, size = pagination.size, useCache = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await dataService.getItems(page, size, useCache);
            setItems(response.content || []);
            setPagination({
                page: response.number || page,
                size: response.size || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0
            });
        } catch (err) {
            console.error('Failed to fetch items:', err);
            setError(err.message || 'Lỗi tải dữ liệu vật phẩm');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size]);

    const createItem = useCallback(async (itemData) => {
        try {
            const newItem = await dataService.createItem(itemData);
            await fetchItems(0, pagination.size, false);
            return newItem;
        } catch (err) {
            console.error('Failed to create item:', err);
            throw err;
        }
    }, [fetchItems, pagination.size]);

    const updateItem = useCallback(async (id, itemData) => {
        try {
            const updatedItem = await dataService.updateItem(id, itemData);
            await fetchItems(pagination.page, pagination.size, false);
            return updatedItem;
        } catch (err) {
            console.error('Failed to update item:', err);
            throw err;
        }
    }, [fetchItems, pagination.page, pagination.size]);

    const deleteItem = useCallback(async (id) => {
        try {
            await dataService.deleteItem(id);
            await fetchItems(pagination.page, pagination.size, false);
            return true;
        } catch (err) {
            console.error('Failed to delete item:', err);
            throw err;
        }
    }, [fetchItems, pagination.page, pagination.size]);

    useEffect(() => {
        fetchItems();
    }, []);

    return {
        items,
        loading,
        error,
        pagination,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
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
            const items = await dataService.getShopItems(useCache);
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
            const inventory = await dataService.getUserInventory(userId);
            setUserInventory(inventory);
        } catch (err) {
            console.error('Failed to fetch user inventory:', err);
            setError(err.message || 'Lỗi tải kho đồ');
        }
    }, []);

    const buyItem = useCallback(async (itemId, quantity = 1) => {
        try {
            const result = await dataService.buyItem(itemId, quantity);
            await fetchShopItems(false); // Refresh shop
            return result;
        } catch (err) {
            console.error('Failed to buy item:', err);
            throw err;
        }
    }, [fetchShopItems]);

    const sellItem = useCallback(async (itemId, quantity = 1) => {
        try {
            const result = await dataService.sellItem(itemId, quantity);
            await fetchShopItems(false);
            return result;
        } catch (err) {
            console.error('Failed to sell item:', err);
            throw err;
        }
    }, [fetchShopItems]);

    const useItem = useCallback(async (itemId, petId) => {
        try {
            const result = await dataService.useItem(itemId, petId);
            return result;
        } catch (err) {
            console.error('Failed to use item:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
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
            const playerData = await dataService.getPlayerById(playerId);
            setPlayer(playerData);

            // Fetch related data
            const [playerPets, playerInventory] = await Promise.all([
                dataService.getPetsByOwner(playerId),
                dataService.getUserInventory(playerId)
            ]);

            setPets(playerPets);
            setInventory(playerInventory);
        } catch (err) {
            console.error('Failed to fetch player data:', err);
            setError(err.message || 'Lỗi tải dữ liệu người chơi');
        } finally {
            setLoading(false);
        }
    }, [playerId]);

    useEffect(() => {
        fetchPlayer();
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
