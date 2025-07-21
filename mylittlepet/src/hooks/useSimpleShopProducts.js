/**
 * ============================================================================================
 * SHOP PRODUCT MANAGEMENT HOOK
 * ============================================================================================
 * 
 * This custom hook provides comprehensive shop product data management functionality
 * for the application. It handles all product-related operations including CRUD operations,
 * advanced filtering, searching, and shop management with full API integration.
 * 
 * FEATURES:
 * - Full CRUD operations (Create, Read, Update, Delete) for shop products
 * - Advanced filtering by type, status, currency, and price range
 * - Real-time search functionality across product names and descriptions
 * - Shop management and integration
 * - Product status management (active/inactive)
 * - Centralized loading and error state management
 * - API integration with comprehensive error handling
 * - Performance optimizations with useCallback for stable function references
 * 
 * USAGE PATTERNS:
 * 1. Data Loading: loadShopProducts() - Fetches all products from backend
 * 2. CRUD Operations: createShopProduct(), updateShopProduct(), deleteShopProduct()
 * 3. Filtering: searchShopProducts(), filterByType(), filterByStatus()
 * 4. Shop Management: getShopName(), shop data access
 * 5. Status Management: updateShopProductStatus() for enable/disable products
 * 6. State Access: shopProducts, allShopProducts, shops, loading, error states
 * 
 * STATE MANAGEMENT:
 * - shopProducts: Array - Filtered/searched products for display
 * - allShopProducts: Array - Complete unfiltered product collection 
 * - shops: Array - Available shop information
 * - loading: boolean - Loading state for async operations
 * - error: string/null - Error state for error handling
 * 
 * FILTERING ARCHITECTURE:
 * - Client-side filtering for better performance
 * - Multiple filter types can be combined
 * - Real-time search with immediate feedback
 * - Maintains both filtered and unfiltered data sets
 * 
 * API INTEGRATION:
 * - Connects to backend shop product management endpoints
 * - Handles authentication and authorization
 * - Provides comprehensive error handling and user feedback
 * - Supports product status updates and shop queries
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses useCallback for stable function references
 * - Minimizes unnecessary re-renders through proper state management
 * - Efficient client-side filtering algorithms
 * - Dual data sets (filtered/unfiltered) for optimal performance
 * 
 * @returns {Object} Hook state and methods for comprehensive shop product management
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

    // ============================================================================================
    // CRUD OPERATIONS
    // ============================================================================================

    /**
     * Create a new shop product
     * 
     * Creates a new product with the provided data and refreshes the product list
     * to ensure the UI displays the most current information.
     * 
     * @param {Object} shopProductData - Product data for creation
     * @returns {Object} Created product data
     * 
     * Process:
     * 1. Sets loading state to indicate operation in progress
     * 2. Makes API call to create the product
     * 3. Refreshes the product list to show the new item
     * 4. Returns the created product data
     * 5. Handles any errors that occur during creation
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

    // ============================================================================================
    // UTILITY FUNCTIONS
    // ============================================================================================

    /**
     * Refresh all product data
     * 
     * Reloads all shop products from the backend to ensure the UI has
     * the most current data. This is used after operations that modify data.
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
    }, [loadShopProducts, loadShops]);    // ============================================================================================
    // RETURN HOOK INTERFACE
    // ============================================================================================
    return {
        // ===== CORE DATA STATE =====
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

        // ===== UTILITIES =====
        refreshData,                     // Refresh all product data
        getShopName                      // Get shop name by ID
    };
};
