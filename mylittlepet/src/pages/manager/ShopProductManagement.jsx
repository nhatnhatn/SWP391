import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Package, Store, DollarSign, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Save } from 'lucide-react';
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts';
import { convertGoogleDriveLink, formatCurrency } from '../../utils/helpers';

// Component riêng để hiển thị ảnh với fallback URLs
const ProductImage = ({ imageUrl, productName, className }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Generate fallback URLs - prioritize formats that work better with CORS
    const fallbackUrls = useMemo(() => {
        if (!imageUrl) return [];

        const convertedUrl = convertGoogleDriveLink(imageUrl);
        const fileId = convertedUrl.split('id=')[1];

        if (!fileId) return [convertedUrl];

        return [
            // Google User Content - usually works better with CORS
            `https://lh3.googleusercontent.com/d/${fileId}=w400-h400-c`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,
            // Alternative Google User Content formats
            `https://lh3.googleusercontent.com/d/${fileId}`,
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?id=${fileId}`,
            // Fallback to original
            convertedUrl
        ];
    }, [imageUrl]);

    // Reset state when imageUrl changes
    useEffect(() => {
        setCurrentUrlIndex(0);
        setImageError(false);
    }, [imageUrl]);

    const handleImageError = () => {
        console.log(`❌ Image failed to load (attempt ${currentUrlIndex + 1}):`, fallbackUrls[currentUrlIndex]);
        if (currentUrlIndex < fallbackUrls.length - 1) {
            setCurrentUrlIndex(prev => prev + 1);
            setImageError(false);
            console.log(`🔄 Trying fallback URL ${currentUrlIndex + 2}:`, fallbackUrls[currentUrlIndex + 1]);
        } else {
            setImageError(true);
            console.log('💥 All image URLs failed to load');
        }
    };

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully:', fallbackUrls[currentUrlIndex]);
        setImageError(false);
    };

    if (!imageUrl) {
        return (
            <div className={`bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center ${className}`}>
                <Package className="h-8 w-8 text-gray-400" />
            </div>
        );
    }

    if (imageError) {
        return (
            <div className={`bg-red-50 rounded-lg border border-red-300 flex flex-col items-center justify-center p-2 ${className}`}>
                <Package className="h-6 w-6 text-red-400 mb-1" />
                <span className="text-xs text-red-600 text-center">Lỗi CORS</span>
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 text-center"
                >
                    Xem ảnh
                </a>
                <button
                    onClick={() => {
                        setCurrentUrlIndex(0);
                        setImageError(false);
                    }}
                    className="text-xs text-gray-600 hover:underline mt-1"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <img
                src={fallbackUrls[currentUrlIndex]}
                alt={productName}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                style={{ display: 'block' }}
            />
        </div>
    );
};

// Simple ShopProduct Management Component
const ShopProductManagement = () => {
    // Use hook for data management
    const {
        shopProducts,
        allShopProducts, // All unfiltered products
        shops,
        loading,
        error,
        createShopProduct,
        updateShopProduct,
        deleteShopProduct,
        updateShopProductStatus,
        refreshData,
        getShopName
    } = useSimpleShopProducts();

    // Local search state - separated for debouncing
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');    // Filter states
    const [shopFilter, setShopFilter] = useState('all'); // Pet, Item
    const [statusFilter, setStatusFilter] = useState('all'); // Đang hoạt động, Hết hàng
    const [currencyFilter, setCurrencyFilter] = useState('all'); // COIN, DIAMOND, GEM
    const [typeFilter, setTypeFilter] = useState('all'); // Pet types hoặc Item types// Debounce search term to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(localSearchTerm);
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Handle search - Use local state with debouncing
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
    }, []);

    // Clear search with debouncing reset
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        clearSearch();
        setShopFilter('all');
        setStatusFilter('all');
        setCurrencyFilter('all');
        setTypeFilter('all');
        setSortConfig({ key: null, direction: 'asc' });
    }, []);

    // Local UI state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [linkConverted, setLinkConverted] = useState(false);
    const [showGoogleDriveHelp, setShowGoogleDriveHelp] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const [editForm, setEditForm] = useState({
        petID: null,
        name: '',
        type: '',
        description: '',
        imageUrl: '',
        price: '',
        currencyType: 'COIN',
        quantity: 10,
        status: 1,
        shop: 'Item' // Shop type: Pet or Item (for dynamic Type dropdown)
    });

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);    // Filter and sort all products, then paginate (proper client-side filtering)
    const filteredAndSortedProducts = useMemo(() => {
        // Start with all products (assume allShopProducts exists or use shopProducts)
        const allProducts = allShopProducts || shopProducts;

        // Apply filters first
        let filtered = allProducts.filter(product => {
            // Search filter - use debounced search term
            if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const productName = (product.name || '').toLowerCase();
                const productDescription = (product.description || '').toLowerCase();
                if (!productName.includes(searchLower) && !productDescription.includes(searchLower)) {
                    return false;
                }
            }

            // 1. Shop filter (Pet, Item) - based on petID
            if (shopFilter !== 'all') {
                if (shopFilter === 'Pet' && !product.petID) return false;
                if (shopFilter === 'Item' && product.petID) return false;
            }

            // 2. Status filter (Đang hoạt động, Hết hàng)
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && product.status !== 1) return false;
                if (statusFilter === 'outOfStock' && (product.status !== 0 && product.quantity > 0)) return false;
            }

            // 3. Currency filter (COIN, DIAMOND, GEM)
            if (currencyFilter !== 'all') {
                if (product.currencyType !== currencyFilter) return false;
            }            // 4. Type filter - depends on shop filter
            if (typeFilter !== 'all') {
                if (shopFilter === 'Pet') {
                    // For pets, filter by pet type from petID relationship
                    // We'll need to get pet data and match types
                    // For now, we'll filter by product type field if it contains pet type info
                    if (product.type !== typeFilter) return false;
                } else if (shopFilter === 'Item') {
                    // For items, filter by item categories
                    if (product.type !== typeFilter) return false;
                } else {
                    // No shop filter, check both pet and item types
                    if (product.type !== typeFilter) return false;
                }
            }

            return true;
        });

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Special handling for numeric fields
                if (sortConfig.key === 'price' || sortConfig.key === 'quantity') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Special handling for status (ensure numeric comparison)
                if (sortConfig.key === 'status') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                // Handle string comparisons
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [allShopProducts, shopProducts, debouncedSearchTerm, shopFilter, statusFilter, currencyFilter, typeFilter, sortConfig]);

    // Calculate pagination (use filteredAndSortedProducts)
    const totalItems = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, shopFilter, statusFilter, currencyFilter, typeFilter]);

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle filters
    const handleTypeFilter = (type) => {
        setTypeFilter(type);
    };

    // Updated filter handlers - no API calls, just state updates
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    }; const handleShopFilter = (shopId) => {
        setShopFilter(shopId);
        // Reset type filter when shop filter changes
        setTypeFilter('all');
    };

    const handleCurrencyFilter = (currency) => {
        setCurrencyFilter(currency);
    };

    // Handle Shop change in modal - reset Type and petID when shop changes
    const handleModalShopChange = (shopType) => {
        setEditForm(prev => ({
            ...prev,
            shop: shopType,
            type: '', // Reset type when shop changes
            petID: shopType === 'Item' ? null : prev.petID // Clear petID if switching to Item
        }));
    };

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // View product details
    const handleView = (product) => {
        setSelectedProduct(product);
    };

    // Open edit modal
    const handleEdit = (product) => {
        // Determine shop type based on petID
        const shopType = product.petID ? 'Pet' : 'Item';

        setEditForm({
            petID: product.petID || null,
            name: product.name || '',
            type: product.type || '',
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            price: product.price || '',
            currencyType: product.currencyType || 'COIN',
            quantity: product.quantity || 10,
            status: product.status !== undefined ? product.status : 1,
            shop: shopType
        });
        setEditModal({ isOpen: true, product });
    };

    // Open create modal
    const handleCreate = () => {
        setEditForm({
            shopId: '',
            petID: null,
            name: '',
            type: '',
            description: '',
            imageUrl: '',
            price: '',
            currencyType: 'COIN',
            quantity: 10,
            status: 1,
            shop: 'Item' // Default to Item shop
        });
        setCreateModal(true);
    };

    // Handle delete
    const handleDelete = (product) => {
        setDeleteModal({ isOpen: true, product });
    };

    // Handle form submission for create/edit
    const handleSubmit = async (isEdit = false) => {
        try {
            // Prepare submission data
            const submissionData = {
                ...editForm,
                // Set shopId based on shop type: Pet Shop = 1, Item Shop = 2
                shopId: editForm.shop === 'Pet' ? 1 : 2,
                // Ensure petID is null for Item shop, and properly handle for Pet shop
                petID: editForm.shop === 'Item' ? null : editForm.petID,
                // Remove the shop field as it's only for UI
                shop: undefined
            };

            // Remove undefined fields
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] === undefined) {
                    delete submissionData[key];
                }
            });

            if (isEdit) {
                await updateShopProduct(editModal.product.shopProductId, submissionData);
                setEditModal({ isOpen: false, product: null });
            } else {
                await createShopProduct(submissionData);
                setCreateModal(false);
            }

            // Reset form
            setEditForm({
                shopId: '',
                petID: null,
                name: '',
                type: '',
                description: '',
                imageUrl: '',
                price: '',
                currencyType: 'COIN',
                quantity: 10,
                status: 1,
                shop: 'Item'
            });

            refreshData();
        } catch (error) {
            alert('Lỗi khi lưu sản phẩm: ' + error.message);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        try {
            await deleteShopProduct(deleteModal.product.shopProductId);
            setDeleteModal({ isOpen: false, product: null });
            refreshData();
        } catch (error) {
            alert('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm Cửa Hàng</h1>
                            <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm trong các cửa hàng một cách hiệu quả</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 text-gray-500">
                        <div className="text-center">
                            <p className="text-sm font-medium">Tổng sản phẩm</p>
                            <p className="text-2xl font-bold text-purple-600">{shopProducts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng Sản phẩm</p>
                            <p className="text-2xl font-bold text-gray-900">{shopProducts.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <span className="text-emerald-600 font-bold text-lg">✓</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang Bán</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-red-600 font-bold text-lg">✕</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Hết Hàng</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {shopProducts.filter(p => p.status === 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
                                <p className="text-purple-100 text-sm">Tìm kiếm và lọc danh sách sản phẩm một cách thông minh</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-white/80 text-sm">
                            <Package className="h-4 w-4" />
                            <span>Quản lý hiệu quả</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Search */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Tìm kiếm sản phẩm</span>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Tìm kiếm sản phẩm
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors duration-200" />                                <input
                                    type="text"
                                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                />
                                {localSearchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                        title="Xóa tìm kiếm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>                            {(localSearchTerm || debouncedSearchTerm) && (
                                <div className="bg-purple-100 rounded-md p-3 border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-purple-800 font-medium">
                                            🔍 Đang hiển thị kết quả tìm kiếm cho: "<span className="font-semibold text-purple-900">{debouncedSearchTerm || localSearchTerm}</span>"
                                            {localSearchTerm !== debouncedSearchTerm && localSearchTerm && (
                                                <span className="text-xs text-purple-600 ml-2">(đang nhập...)</span>
                                            )}
                                        </p>
                                        <button
                                            onClick={clearSearch}
                                            className="ml-auto text-purple-600 hover:text-purple-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                        >
                                            Xóa tìm kiếm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Product Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleCreate}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <Plus className="h-5 w-5" />
                                Thêm Sản phẩm
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg border border-gray-200 transition-all duration-200 group"
                            >
                                <Filter className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                    Bộ lọc nâng cao
                                </span>
                                {showAdvancedFilters ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                )}
                                {(statusFilter !== '' || typeFilter || shopFilter || currencyFilter || sortConfig.key) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                                        {[statusFilter !== '' ? 'status' : null, typeFilter ? 'type' : null, shopFilter ? 'shop' : null, currencyFilter ? 'currency' : null, sortConfig.key ? 'sort' : null].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Content Filters */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Lọc theo nội dung</span>
                                    </div>                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* 1. Shop Filter (Pet, Item) */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                🏪 Shop (Pet/Item)
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={shopFilter}
                                                    onChange={(e) => handleShopFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all">🛒 Tất cả shop</option>
                                                    <option value="Pet">🐾 Pet Shop</option>
                                                    <option value="Item">📦 Item Shop</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 2. Status Filter (Đang hoạt động, Hết hàng) */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                📊 Trạng thái
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all">📈 Tất cả trạng thái</option>
                                                    <option value="active">✅ Đang hoạt động</option>
                                                    <option value="outOfStock">❌ Hết hàng</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 3. Currency Filter (COIN, DIAMOND, GEM) */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                💰 Tiền tệ
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={currencyFilter}
                                                    onChange={(e) => handleCurrencyFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all">💸 Tất cả loại tiền</option>
                                                    <option value="COIN">💰 Coin</option>
                                                    <option value="DIAMOND">💎 Diamond</option>
                                                    <option value="GEM">💜 Gem</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 4. Type Filter (sẽ làm sau) */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                {shopFilter === 'Pet' ? '🐾 Loại Thú Cưng' :
                                                    shopFilter === 'Item' ? '🏷️ Loại Vật Phẩm' :
                                                        '🏷️ Type'}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={typeFilter}
                                                    onChange={(e) => handleTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all">
                                                        {shopFilter === 'Pet' ? '🐾 Tất cả loài thú cưng' :
                                                            shopFilter === 'Item' ? '📦 Tất cả loại vật phẩm' :
                                                                '📂 Tất cả loại'}
                                                    </option>

                                                    {shopFilter === 'Pet' ? (
                                                        // Pet types - giống như trong PetManagement
                                                        <>
                                                            <option value="Cat">🐱 Mèo (Cat)</option>
                                                            <option value="Dog">🐶 Chó (Dog)</option>
                                                            <option value="Bird">🐦 Chim (Bird)</option>
                                                            <option value="Fish">🐟 Cá (Fish)</option>
                                                            <option value="Chicken">🐔 Gà (Chicken)</option>
                                                            <option value="Other">🔄 Khác (Phần còn lại)</option>
                                                        </>
                                                    ) : shopFilter === 'Item' ? (
                                                        // Item types
                                                        <>
                                                            <option value="FOOD">🍖 Thức ăn (Food)</option>
                                                            <option value="TOY">🧸 Đồ chơi (Toy)</option>
                                                            <option value="ACCESSORY">👑 Phụ kiện (Accessory)</option>
                                                            <option value="MEDICINE">💊 Thuốc (Medicine)</option>
                                                        </>
                                                    ) : (
                                                        // All types when no shop filter
                                                        <>
                                                            <optgroup label="🐾 Loại Thú Cưng">
                                                                <option value="Cat">🐱 Mèo (Cat)</option>
                                                                <option value="Dog">🐶 Chó (Dog)</option>
                                                                <option value="Bird">🐦 Chim (Bird)</option>
                                                                <option value="Fish">🐟 Cá (Fish)</option>
                                                                <option value="Chicken">🐔 Gà (Chicken)</option>
                                                                <option value="Other">🔄 Khác (Phần còn lại)</option>
                                                            </optgroup>
                                                            <optgroup label="📦 Loại Vật Phẩm">
                                                                <option value="FOOD">🍖 Thức ăn (Food)</option>
                                                                <option value="TOY">🧸 Đồ chơi (Toy)</option>
                                                                <option value="ACCESSORY">👑 Phụ kiện (Accessory)</option>
                                                                <option value="MEDICINE">💊 Thuốc (Medicine)</option>
                                                                <option value="OTHER">📦 Khác</option>
                                                            </optgroup>
                                                        </>
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Thao tác</span>
                                    </div>                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={clearAllFilters}
                                            disabled={shopFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && typeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm}
                                            className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${shopFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && typeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {shopFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && typeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'Không có bộ lọc nào'
                                                : 'Xóa tất cả bộ lọc'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(shopFilter !== 'all' || statusFilter !== 'all' || currencyFilter !== 'all' || typeFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Tìm kiếm',
                                                    shopFilter !== 'all' && 'Shop',
                                                    statusFilter !== 'all' && 'Trạng thái',
                                                    currencyFilter !== 'all' && 'Tiền tệ',
                                                    typeFilter !== 'all' && 'Type',
                                                    sortConfig.key && 'Sắp xếp'
                                                ].filter(Boolean).length} bộ lọc đang áp dụng
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-4 border-purple-800 shadow-lg">
                                <tr>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Sản phẩm
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Cửa hàng
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Loại
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Giá
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Số lượng
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-purple-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Trạng thái
                                        </span>
                                    </th>
                                    <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2">
                                            Thao tác
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">Không có sản phẩm nào</h3>                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || typeFilter !== 'all' || statusFilter !== 'all' || shopFilter !== 'all' || currencyFilter !== 'all' ?
                                                            'Không tìm thấy sản phẩm phù hợp với bộ lọc.' :
                                                            'Hãy bắt đầu bằng cách thêm sản phẩm mới.'
                                                        }
                                                    </p>
                                                    {!(localSearchTerm || debouncedSearchTerm) && typeFilter === 'all' && statusFilter === 'all' && shopFilter === 'all' && currencyFilter === 'all' && (
                                                        <button
                                                            onClick={handleCreate}
                                                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Thêm sản phẩm
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (currentProducts.map((product) => (
                                    <tr key={product.shopProductId} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                                        {/* Product Info */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.imageUrl ? (
                                                    <ProductImage
                                                        imageUrl={product.imageUrl}
                                                        productName={product.name}
                                                        className="h-12 w-12 mr-4 rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mr-4">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate" title={product.description}>
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Shop */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 shadow-sm">
                                                {getShopName(product.shopId)}
                                            </span>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center">
                                                {product.type === 'FOOD' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                        🍖 Thức ăn
                                                    </span>
                                                )}
                                                {product.type === 'TOY' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200 shadow-sm">
                                                        🎾 Đồ chơi
                                                    </span>
                                                )}
                                                {product.type && !['FOOD', 'TOY'].includes(product.type) && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        {product.type}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                {product.currencyType === 'COIN' && <span className="mr-1">💰</span>}
                                                {product.currencyType === 'DIAMOND' && <span className="mr-1">💎</span>}
                                                {product.currencyType === 'GEM' && <span className="mr-1">💜</span>}
                                                <span className="font-medium text-gray-900">{formatCurrency(product.price, product.currencyType)}</span>
                                            </div>
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                {product.quantity}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center">
                                                {product.status === 1 ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                        ✅ Đang bán
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-sm">
                                                        ❌ Hết hàng
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => handleView(product)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-amber-600 hover:text-amber-900 hover:bg-amber-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Trước</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${currentPage === page
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                                            : 'bg-white text-purple-700 border border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:text-purple-800 shadow-sm'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <span className="hidden sm:inline">Tiếp</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>                    <div className="mt-3 text-center text-sm text-purple-600">
                        Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trong số {totalItems} sản phẩm
                        {(localSearchTerm || debouncedSearchTerm) && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                Kết quả tìm kiếm: "{debouncedSearchTerm || localSearchTerm}"
                            </span>
                        )}
                    </div>
                </div>
            )}            {/* Create/Edit Modal */}
            {(createModal || editModal.isOpen) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {createModal ? 'Thêm Sản phẩm Mới' : 'Chỉnh sửa Sản phẩm'}
                            </h3>
                            <button
                                onClick={() => {
                                    setCreateModal(false);
                                    setEditModal({ isOpen: false, product: null });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Shop Type Selection (Pet/Item) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại cửa hàng *</label>
                                    <select
                                        value={editForm.shop}
                                        onChange={(e) => handleModalShopChange(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="Pet">🐾 Pet Shop</option>
                                        <option value="Item">📦 Item Shop</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        💡 Pet Shop: sản phẩm dành cho thú cưng cụ thể | Item Shop: vật phẩm chung
                                    </p>
                                </div>

                                {/* Pet ID - only show for Pet Shop */}
                                {editForm.shop === 'Pet' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pet ID</label>
                                        <input
                                            type="number"
                                            value={editForm.petID || ''}
                                            onChange={(e) => setEditForm({ ...editForm, petID: e.target.value ? parseInt(e.target.value) : null })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Nhập Pet ID (tùy chọn)"
                                            min="1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            💡 Để trống nếu sản phẩm dành cho tất cả thú cưng cùng loài
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Nhập tên sản phẩm"
                                        required
                                    />
                                </div>

                                {/* Dynamic Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {editForm.shop === 'Pet' ? 'Loại thú cưng *' : 'Loại vật phẩm *'}
                                    </label>
                                    <select
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="">
                                            {editForm.shop === 'Pet' ? 'Chọn loài thú cưng' : 'Chọn loại vật phẩm'}
                                        </option>

                                        {editForm.shop === 'Pet' ? (
                                            // Pet types - giống như trong filter
                                            <>
                                                <option value="Cat">🐱 Mèo (Cat)</option>
                                                <option value="Dog">🐶 Chó (Dog)</option>
                                                <option value="Bird">🐦 Chim (Bird)</option>
                                                <option value="Fish">🐟 Cá (Fish)</option>
                                                <option value="Chicken">🐔 Gà (Chicken)</option>
                                                <option value="Other">🔄 Khác</option>
                                            </>
                                        ) : (
                                            // Item types - giống như trong filter
                                            <>
                                                <option value="FOOD">🍖 Thức ăn</option>
                                                <option value="TOY">🎾 Đồ chơi</option>
                                                <option value="ACCESSORY">👑 Phụ kiện</option>
                                                <option value="MEDICINE">💊 Thuốc</option>
                                                <option value="OTHER">📦 Khác</option>
                                            </>
                                        )}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {editForm.shop === 'Pet'
                                            ? '💡 Chọn loài thú cưng phù hợp với sản phẩm'
                                            : '💡 Chọn danh mục vật phẩm phù hợp'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>

                                    {/* Google Drive Helper Section */}
                                    <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800">Lấy ảnh từ Google Drive</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href="https://drive.google.com/drive/u/0/folders/14-F6VcATkQVW8qwHrA4flc0fX8ffC5Ha"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    📁 Mở thư mục
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGoogleDriveHelp(true)}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    ❓ Hướng dẫn
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Click "Mở thư mục" để truy cập thư mục ảnh, sau đó copy link ảnh và dán vào ô bên dưới
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        value={editForm.imageUrl}
                                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                        onBlur={(e) => {
                                            const originalUrl = e.target.value;
                                            const convertedUrl = convertGoogleDriveLink(originalUrl);

                                            // Debug logging để kiểm tra conversion
                                            if (originalUrl !== convertedUrl) {
                                                console.log('🔄 Google Drive Link Conversion:');
                                                console.log('Original:', originalUrl);
                                                console.log('Converted:', convertedUrl);
                                                setEditForm({ ...editForm, imageUrl: convertedUrl });

                                                // Hiển thị thông báo thành công
                                                setLinkConverted(true);
                                                setTimeout(() => setLinkConverted(false), 3000);
                                            }
                                        }}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Dán link Google Drive hoặc URL ảnh khác tại đây..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        💡 Hỗ trợ tự động chuyển đổi link Google Drive sang định dạng hiển thị phù hợp
                                    </p>
                                    {linkConverted && (
                                        <p className="mt-1 text-xs text-green-600 font-medium">
                                            ✅ Đã chuyển đổi link Google Drive thành công!
                                        </p>
                                    )}

                                    {editForm.imageUrl && (
                                        <div className="mt-2">
                                            <ProductImage
                                                imageUrl={editForm.imageUrl}
                                                productName="Preview"
                                                className="w-20 h-20"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Giá *</label>
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại tiền tệ *</label>
                                    <select
                                        value={editForm.currencyType}
                                        onChange={(e) => setEditForm({ ...editForm, currencyType: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="COIN">💰 COIN</option>
                                        <option value="DIAMOND">💎 DIAMOND</option>
                                        <option value="GEM">💜 GEM</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng *</label>
                                    <input
                                        type="number"
                                        value={editForm.quantity}
                                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Nhập số lượng"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: parseInt(e.target.value) })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="1">✅ Đang bán</option>
                                        <option value="0">❌ Hết hàng</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Nhập mô tả sản phẩm"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setCreateModal(false);
                                    setEditModal({ isOpen: false, product: null });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleSubmit(editModal.isOpen)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                disabled={!editForm.name.trim() || !editForm.type.trim() || !editForm.price || !editForm.quantity || !editForm.shop}
                            >
                                {createModal ? 'Tạo Sản phẩm' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Google Drive Help Modal */}
            {showGoogleDriveHelp && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Hướng dẫn sử dụng Google Drive
                            </h3>
                            <button
                                onClick={() => setShowGoogleDriveHelp(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">📁 Bước 1: Truy cập thư mục ảnh</h4>
                                <p className="text-sm text-blue-700">
                                    Click vào button "📁 Mở thư mục" để truy cập thư mục Google Drive chứa ảnh sản phẩm.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2">🖼️ Bước 2: Chọn ảnh</h4>
                                <p className="text-sm text-green-700 mb-2">
                                    Trong thư mục Google Drive:
                                </p>
                                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                                    <li>Tìm và click vào ảnh bạn muốn sử dụng</li>
                                    <li>Ảnh sẽ mở trong chế độ preview</li>
                                    <li>Click vào icon "⋮" (3 chấm dọc) ở góc trên bên phải</li>
                                    <li>Chọn "Chia sẻ" hoặc "Share"</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">🔗 Bước 3: Lấy link chia sẻ</h4>
                                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                    <li>Trong popup chia sẻ, click "Thay đổi" bên cạnh "Hạn chế"</li>
                                    <li>Chọn "Bất kỳ ai có liên kết"</li>
                                    <li>Click "Sao chép liên kết"</li>
                                    <li>Dán link vào ô "URL Hình ảnh" trong form</li>
                                </ol>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">✨ Bước 4: Hoàn thành</h4>
                                <p className="text-sm text-purple-700">
                                    Sau khi dán link, hệ thống sẽ tự động chuyển đổi sang định dạng phù hợp và hiển thị ảnh preview.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">💡 Lưu ý quan trọng</h4>
                                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                    <li>Đảm bảo ảnh được chia sẻ công khai ("Bất kỳ ai có liên kết")</li>
                                    <li>Chỉ sử dụng các file ảnh (JPG, PNG, GIF, WebP)</li>
                                    <li>Kích thước ảnh nên dưới 10MB để tải nhanh</li>
                                    <li>Hệ thống hỗ trợ tự động chuyển đổi nhiều định dạng link Google Drive</li>
                                </ul>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-800 mb-2">🔗 Các định dạng link được hỗ trợ:</h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>• <code>https://drive.google.com/file/d/FILE_ID/view</code></p>
                                    <p>• <code>https://drive.google.com/uc?id=FILE_ID</code></p>
                                    <p>• <code>https://drive.google.com/uc?export=view&id=FILE_ID</code></p>
                                    <p>• <code>https://drive.google.com/open?id=FILE_ID</code></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <a
                                href="https://drive.google.com/drive/u/0/folders/14-F6VcATkQVW8qwHrA4flc0fX8ffC5Ha"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                📁 Mở thư mục ngay
                            </a>
                            <button
                                onClick={() => setShowGoogleDriveHelp(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteModal.product?.name}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết Sản phẩm</h3>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cửa hàng</label>
                                    <p className="mt-1 text-sm text-gray-900">{getShopName(selectedProduct.shopId)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pet ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.petID || 'Không có'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.type === 'FOOD' ? '🍖 Thức ăn' :
                                            selectedProduct.type === 'TOY' ? '🎾 Đồ chơi' : selectedProduct.type}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                                    <div className="mt-1">
                                        {selectedProduct.imageUrl ? (
                                            <ProductImage
                                                imageUrl={selectedProduct.imageUrl}
                                                productName={selectedProduct.name}
                                                className="w-32 h-32"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                                <Package className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Giá</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProduct.price, selectedProduct.currencyType)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại tiền tệ</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.currencyType === 'COIN' && '💰 COIN'}
                                        {selectedProduct.currencyType === 'DIAMOND' && '💎 DIAMOND'}
                                        {selectedProduct.currencyType === 'GEM' && '💜 GEM'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.quantity}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.status === 1 ? '✅ Đang bán' : '❌ Hết hàng'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.description || 'Không có mô tả'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    handleEdit(selectedProduct);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProductManagement;
