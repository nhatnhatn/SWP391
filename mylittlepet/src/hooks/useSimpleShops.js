// React Hook for Shop Management - Integrated with Backend API
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimpleShops = () => {
    // Basic state management
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Load shops from backend
    const loadShops = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllShops();
            console.log('✅ Shops loaded:', response);

            const allShops = Array.isArray(response) ? response : [];
            setShops(allShops);

        } catch (error) {
            console.error('Load shops error:', error);
            setError('Không thể tải danh sách shop');
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Search shops
    const searchShops = useCallback(async (keyword) => {
        try {
            setLoading(true);
            setError(null);

            if (keyword.trim()) {
                const response = await apiService.searchShops(keyword);
                setShops(Array.isArray(response) ? response : []);
            } else {
                await loadShops();
            }

        } catch (error) {
            console.error('Search shops error:', error);
            setError('Không thể tìm kiếm shop');
        } finally {
            setLoading(false);
        }
    }, [loadShops]);

    // Filter shops by type
    const filterByType = useCallback(async (type) => {
        try {
            setLoading(true);
            setError(null);

            if (type) {
                const response = await apiService.getShopsByType(type);
                setShops(Array.isArray(response) ? response : []);
            } else {
                await loadShops();
            }

        } catch (error) {
            console.error('Filter shops by type error:', error);
            setError('Không thể lọc shop theo loại');
        } finally {
            setLoading(false);
        }
    }, [loadShops]);

    // Create shop
    const createShop = useCallback(async (shopData) => {
        try {
            setLoading(true);
            const newShop = await apiService.createShop(shopData);
            console.log('✅ Shop created:', newShop);
            await loadShops(); // Refresh list
            return newShop;

        } catch (error) {
            console.error('Create shop error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShops]);

    // Update shop
    const updateShop = useCallback(async (shopId, shopData) => {
        try {
            setLoading(true);
            const updatedShop = await apiService.updateShop(shopId, shopData);
            console.log('✅ Shop updated:', updatedShop);
            await loadShops(); // Refresh list
            return updatedShop;

        } catch (error) {
            console.error('Update shop error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShops]);

    // Delete shop
    const deleteShop = useCallback(async (shopId) => {
        try {
            setLoading(true);
            await apiService.deleteShop(shopId);
            console.log('✅ Shop deleted:', shopId);
            await loadShops(); // Refresh list
            return true;

        } catch (error) {
            console.error('Delete shop error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShops]);

    // Get shop by ID
    const getShopById = useCallback(async (shopId) => {
        try {
            setLoading(true);
            const shop = await apiService.getShopById(shopId);
            console.log('✅ Shop fetched:', shop);
            return shop;

        } catch (error) {
            console.error('Get shop error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh data
    const refreshData = useCallback(() => {
        loadShops();
    }, [loadShops]);

    // Initialize on mount
    useEffect(() => {
        loadShops();
    }, [loadShops]);

    return {
        // Data
        shops,
        loading,
        error,

        // Search & Filter
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,

        // Actions
        createShop,
        updateShop,
        deleteShop,
        getShopById,
        searchShops,
        filterByType,
        refreshData
    };
};
