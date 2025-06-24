// React Hook for Shop Product Management - Integrated with Backend API
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimpleShopProducts = () => {
    // Basic state management
    const [shopProducts, setShopProducts] = useState([]);
    const [allShopProducts, setAllShopProducts] = useState([]); // All unfiltered products
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load shop products from backend
    const loadShopProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllShopProducts();
            console.log('✅ Shop products loaded:', response);

            const allProducts = Array.isArray(response) ? response : [];
            setShopProducts(allProducts);
            setAllShopProducts(allProducts); // Keep original unfiltered data

        } catch (error) {
            console.error('Load shop products error:', error);
            setError('Không thể tải danh sách sản phẩm cửa hàng');
            setShopProducts([]);
            setAllShopProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);// Load shops for dropdown (static data since we removed shop management)
    const loadShops = useCallback(async () => {
        try {
            // Static shops data for dropdown - only Pet and Item shops
            const staticShops = [
                { shopId: 1, name: 'Pet' },
                { shopId: 2, name: 'Item' }
            ];
            setShops(staticShops);
        } catch (error) {
            console.error('Load shops for dropdown error:', error);
        }
    }, []);

    // Search shop products
    const searchShopProducts = useCallback(async (keyword) => {
        try {
            setLoading(true);
            setError(null);

            if (keyword.trim()) {
                const response = await apiService.searchShopProducts(keyword);
                setShopProducts(Array.isArray(response) ? response : []);
            } else {
                await loadShopProducts();
            }

        } catch (error) {
            console.error('Search shop products error:', error);
            setError('Không thể tìm kiếm sản phẩm cửa hàng');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Filter shop products by type
    const filterByType = useCallback(async (type) => {
        try {
            setLoading(true);
            setError(null);

            if (type) {
                const response = await apiService.getShopProductsByType(type);
                setShopProducts(Array.isArray(response) ? response : []);
            } else {
                await loadShopProducts();
            }

        } catch (error) {
            console.error('Filter shop products by type error:', error);
            setError('Không thể lọc sản phẩm cửa hàng theo loại');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Filter shop products by status
    const filterByStatus = useCallback(async (status) => {
        try {
            setLoading(true);
            setError(null);

            if (status !== '') {
                const response = await apiService.getShopProductsByStatus(parseInt(status));
                setShopProducts(Array.isArray(response) ? response : []);
            } else {
                await loadShopProducts();
            }

        } catch (error) {
            console.error('Filter shop products by status error:', error);
            setError('Không thể lọc sản phẩm cửa hàng theo trạng thái');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Filter shop products by shop
    const filterByShop = useCallback(async (shopId) => {
        try {
            setLoading(true);
            setError(null);

            if (shopId) {
                const response = await apiService.getShopProductsByShopId(parseInt(shopId));
                setShopProducts(Array.isArray(response) ? response : []);
            } else {
                await loadShopProducts();
            }

        } catch (error) {
            console.error('Filter shop products by shop error:', error);
            setError('Không thể lọc sản phẩm theo shop');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Filter shop products by currency type
    const filterByCurrency = useCallback(async (currencyType) => {
        try {
            setLoading(true);
            setError(null);

            if (currencyType) {
                const response = await apiService.getShopProductsByCurrencyType(currencyType);
                setShopProducts(Array.isArray(response) ? response : []);
            } else {
                await loadShopProducts();
            }

        } catch (error) {
            console.error('Filter shop products by currency error:', error);
            setError('Không thể lọc sản phẩm theo loại tiền');
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Get shop products by price range
    const filterByPriceRange = useCallback(async (minPrice, maxPrice) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getShopProductsByPriceRange(minPrice, maxPrice);
            setShopProducts(Array.isArray(response) ? response : []);

        } catch (error) {
            console.error('Filter shop products by price range error:', error);
            setError('Không thể lọc sản phẩm theo khoảng giá');
        } finally {
            setLoading(false);
        }
    }, []);

    // Create shop product
    const createShopProduct = useCallback(async (shopProductData) => {
        try {
            setLoading(true);
            const newShopProduct = await apiService.createShopProduct(shopProductData);
            console.log('✅ Shop product created:', newShopProduct);
            await loadShopProducts(); // Refresh list
            return newShopProduct;

        } catch (error) {
            console.error('Create shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Update shop product
    const updateShopProduct = useCallback(async (shopProductId, shopProductData) => {
        try {
            setLoading(true);
            const updatedShopProduct = await apiService.updateShopProduct(shopProductId, shopProductData);
            console.log('✅ Shop product updated:', updatedShopProduct);
            await loadShopProducts(); // Refresh list
            return updatedShopProduct;

        } catch (error) {
            console.error('Update shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Delete shop product
    const deleteShopProduct = useCallback(async (shopProductId) => {
        try {
            setLoading(true);
            await apiService.deleteShopProduct(shopProductId);
            console.log('✅ Shop product deleted:', shopProductId);
            await loadShopProducts(); // Refresh list
            return true;

        } catch (error) {
            console.error('Delete shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Update shop product status
    const updateShopProductStatus = useCallback(async (shopProductId, status) => {
        try {
            setLoading(true);
            const updatedShopProduct = await apiService.updateShopProductStatus(shopProductId, status);
            console.log('✅ Shop product status updated:', updatedShopProduct);
            await loadShopProducts(); // Refresh list
            return updatedShopProduct;

        } catch (error) {
            console.error('Update shop product status error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadShopProducts]);

    // Get shop product by ID
    const getShopProductById = useCallback(async (shopProductId) => {
        try {
            setLoading(true);
            const shopProduct = await apiService.getShopProductById(shopProductId);
            console.log('✅ Shop product fetched:', shopProduct);
            return shopProduct;

        } catch (error) {
            console.error('Get shop product error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh data
    const refreshData = useCallback(() => {
        loadShopProducts();
    }, [loadShopProducts]);

    // Helper function to get shop name by shopId
    const getShopName = useCallback((shopId) => {
        const shop = shops.find(s => s.shopId === parseInt(shopId));
        return shop ? shop.name : `Cửa Hàng ${shopId}`;
    }, [shops]);

    // Initialize on mount
    useEffect(() => {
        loadShopProducts();
        loadShops();
    }, [loadShopProducts, loadShops]); return {        // Data
        shopProducts,
        allShopProducts, // All unfiltered products for client-side filtering
        shops,
        loading,
        error,

        // Actions
        createShopProduct,
        updateShopProduct,
        deleteShopProduct, updateShopProductStatus,
        getShopProductById,
        refreshData,

        // Helpers
        getShopName
    };
};
