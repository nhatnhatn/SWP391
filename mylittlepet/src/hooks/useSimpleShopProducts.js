/**
 * Custom Hook for Shop Product Management
 * 
 * Provides comprehensive shop product data management functionality including:
 * - CRUD operations for shop products
 * - Multiple filtering options (type, status, currency, price range)
 * - Search functionality
 * - Shop management integration
 * - API integration with error handling
 * 
 * @returns {Object} Hook state and methods for shop product management
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimpleShopProducts = () => {
    // ===== STATE MANAGEMENT =====
    const [shopProducts, setShopProducts] = useState([]);           // Filtered products
    const [allShopProducts, setAllShopProducts] = useState([]);     // All unfiltered products
    const [shops, setShops] = useState([]);                         // Available shops
    const [loading, setLoading] = useState(false);                  // Loading state
    const [error, setError] = useState(null);                       // Error state

    // ===== DATA LOADING =====
    /**
     * Load all shop products from the backend API
     * Maintains both filtered and unfiltered data sets
     */
    const loadShopProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllShopProducts();
            console.log('✅ Shop products loaded successfully:', response.length, 'products');

            const allProducts = Array.isArray(response) ? response : [];
            setShopProducts(allProducts);
            setAllShopProducts(allProducts); // Keep original unfiltered data

        } catch (error) {
            console.error('❌ Load shop products error:', error);
            setError('Không thể tải danh sách sản phẩm cửa hàng');
            setShopProducts([]);
            setAllShopProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Load available shops for dropdown selection
     * Uses static data since shop management is simplified
     */
    const loadShops = useCallback(async () => {
        try {
            // Static shops data - Pet and Item shops only
            const staticShops = [
                { shopId: 1, name: 'Pet' },
                { shopId: 2, name: 'Item' }
            ];
            setShops(staticShops);
            console.log('✅ Shop options loaded:', staticShops.length, 'shops');
        } catch (error) {
            console.error('❌ Load shops error:', error);
        }
    }, []);

    // ===== SEARCH & BASIC FILTERING =====
    /**
     * Search shop products by keyword
     * @param {string} keyword - Search term to filter products
     */
    const searchShopProducts = useCallback(async (keyword) => {
        try {
            setLoading(true);
            setError(null);

            if (keyword.trim()) {
                const response = await apiService.searchShopProducts(keyword);
                setShopProducts(Array.isArray(response) ? response : []);
                console.log(`🔍 Search completed: Found ${response?.length || 0} products for "${keyword}"`);
            } else {
                await loadShopProducts(); // Reset to all products if search is empty
            }

        } catch (error) {
            console.error('❌ Search shop products error:', error);
            setError('Không thể tìm kiếm sản phẩm cửa hàng');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // ===== CRUD OPERATIONS =====
    /**
     * Create a new shop product
     * @param {Object} shopProductData - Product data for creation
     * @returns {Object} Created product data
     */
    const createShopProduct = useCallback(async (shopProductData) => {
        try {
            setLoading(true);
            const newShopProduct = await apiService.createShopProduct(shopProductData);
            console.log('✅ Shop product created successfully:', newShopProduct.name);
            await loadShopProducts(); // Refresh product list
            return newShopProduct;

        } catch (error) {
            console.error('❌ Create shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    /**
     * Update an existing shop product
     * @param {number} shopProductId - Product ID to update
     * @param {Object} shopProductData - Updated product data
     * @returns {Object} Updated product data
     */
    const updateShopProduct = useCallback(async (shopProductId, shopProductData) => {
        try {
            setLoading(true);
            const updatedShopProduct = await apiService.updateShopProduct(shopProductId, shopProductData);
            console.log('✅ Shop product updated successfully:', updatedShopProduct.name);
            await loadShopProducts(); // Refresh product list
            return updatedShopProduct;

        } catch (error) {
            console.error('❌ Update shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    /**
     * Delete a shop product
     * @param {number} shopProductId - Product ID to delete
     * @returns {boolean} Success status
     */
    const deleteShopProduct = useCallback(async (shopProductId) => {
        try {
            setLoading(true);
            await apiService.deleteShopProduct(shopProductId);
            console.log('✅ Shop product deleted successfully:', shopProductId);
            await loadShopProducts(); // Refresh product list
            return true;

        } catch (error) {
            console.error('❌ Delete shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    /**
     * Update shop product status (enable/disable)
     * @param {number} shopProductId - Product ID
     * @param {number} status - New status (1 = active, 0 = inactive)
     * @returns {Object} Updated product data
     */
    const updateShopProductStatus = useCallback(async (shopProductId, status) => {
        try {
            setLoading(true);
            const updatedShopProduct = await apiService.updateShopProductStatus(shopProductId, status);
            console.log('✅ Shop product status updated successfully:', updatedShopProduct.name, 'Status:', status);
            await loadShopProducts(); // Refresh product list
            return updatedShopProduct;

        } catch (error) {
            console.error('❌ Update shop product status error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // ===== UTILITY FUNCTIONS =====
    /**
     * Get a specific shop product by ID
     * @param {number} shopProductId - Product ID
     * @returns {Object} Product data
     */
    const getShopProductById = useCallback(async (shopProductId) => {
        try {
            setLoading(true);
            const shopProduct = await apiService.getShopProductById(shopProductId);
            console.log('✅ Shop product retrieved:', shopProduct.name);
            return shopProduct;

        } catch (error) {
            console.error('❌ Get shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh all product data
     */
    const refreshData = useCallback(() => {
        loadShopProducts();
    }, [loadShopProducts]);

    /**
     * Helper function to get shop name by shopId
     * @param {number} shopId - Shop ID
     * @returns {string} Shop name
     */
    const getShopName = useCallback((shopId) => {
        const shop = shops.find(s => s.shopId === parseInt(shopId));
        return shop ? shop.name : `Cửa Hàng ${shopId}`;
    }, [shops]);

    // ===== INITIALIZATION =====
    // Auto-load shop products and shops when hook is first used
    useEffect(() => {
        loadShopProducts();
        loadShops();
    }, [loadShopProducts, loadShops]);    // ===== RETURN HOOK INTERFACE =====
    return {
        // ===== DATA STATE =====
        shopProducts,                    // Current list of shop products (filtered)
        allShopProducts,                 // All unfiltered products (for client-side filtering)
        shops,                           // Available shops
        loading,                         // Loading state for UI feedback
        error,                           // Error state for error handling

        // ===== CRUD OPERATIONS =====
        createShopProduct,               // Create new shop product
        updateShopProduct,               // Update existing shop product
        deleteShopProduct,               // Delete shop product
        updateShopProductStatus,         // Enable/disable shop product
        getShopProductById,              // Get specific product by ID

        // ===== SEARCH FUNCTIONALITY =====
        searchShopProducts,              // Search products by keyword

        // ===== UTILITIES =====
        refreshData,                     // Refresh all product data
        getShopName,                     // Get shop name by ID
        clearError: () => setError(null) // Clear error state
    };
};
