import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Power, Eye, Filter, Package, Store, DollarSign, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Save, RotateCcw } from 'lucide-react';
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts';
import { useSimplePets } from '../../hooks/useSimplePets';
import { useAuth } from '../../contexts/AuthContextV2';
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
    // Use auth hook to get current user
    const { user } = useAuth();

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

    // Use pets hook for Pet ID dropdown
    const {
        pets,
        loading: petsLoading
    } = useSimplePets();

    // Helper function to check if a product is a Pet
    const isPetProduct = (product) => {
        // Check if product has petID (indicating it's linked to a pet)
        if (product.petID) return true;

        // Check if product type is 'Pet' or one of the common pet types
        const petTypes = ['Pet', 'Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster'];
        return petTypes.includes(product.type);
    };

    // Local search state - separated for debouncing
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');    // Filter states
    const [statusFilter, setStatusFilter] = useState('all'); // Đang hoạt động, Hết hàng
    const [currencyFilter, setCurrencyFilter] = useState('all'); // COIN, DIAMOND, GEM
    const [shopTypeFilter, setShopTypeFilter] = useState('all'); // Pet, Food, Toy
    // Debounce search term to prevent excessive filtering
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
        setStatusFilter('all');
        setCurrencyFilter('all');
        setShopTypeFilter('all');
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
        petType: '',
        description: '',
        imageUrl: '',
        price: '',
        currencyType: 'Coin',
        quantity: 10,
        status: 1
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

            // 1. Status filter (Đang hoạt động, Hết hàng)
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && product.status !== 1) return false;
                if (statusFilter === 'outOfStock' && (product.status !== 0 && product.quantity > 0)) return false;
            }

            // 2. Currency filter (Coin, Diamond, Gem)
            if (currencyFilter !== 'all') {
                if (product.currencyType !== currencyFilter) return false;
            }

            // 3. Shop Type filter - categorize products
            if (shopTypeFilter !== 'all') {
                if (shopTypeFilter === 'Pet') {
                    // Pet products are those with pet types
                    const petTypes = ['Cat', 'Dog', 'Bird', 'Fish', 'Chicken'];
                    if (!petTypes.includes(product.type) && !product.petID) return false;
                } else if (shopTypeFilter === 'Food') {
                    if (product.type !== 'Food') return false;
                } else if (shopTypeFilter === 'Toy') {
                    if (product.type !== 'Toy') return false;
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
    }, [allShopProducts, shopProducts, debouncedSearchTerm, statusFilter, currencyFilter, shopTypeFilter, sortConfig]);

    // Calculate pagination (use filteredAndSortedProducts)
    const totalItems = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter, currencyFilter, shopTypeFilter]);

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
    // Updated filter handlers - no API calls, just state updates
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };

    const handleCurrencyFilter = (currency) => {
        setCurrencyFilter(currency);
    };

    const handleShopTypeFilter = (shopType) => {
        setShopTypeFilter(shopType);
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
        const predefinedTypes = ['Food', 'Toy'];
        const petTypes = ['Cat', 'Dog', 'Bird', 'Fish', 'Chicken'];

        let formType = '';
        let formPetType = '';

        if (petTypes.includes(product.type)) {
            formType = 'Pet';
            formPetType = product.type;
        } else if (predefinedTypes.includes(product.type)) {
            formType = product.type;
        }

        setEditForm({
            petID: product.petID || null,
            name: product.name || '',
            type: formType,
            petType: formPetType,
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            price: product.price || '',
            currencyType: product.currencyType || 'COIN',
            quantity: product.quantity || 10,
            status: product.status !== undefined ? product.status : 1
        });
        setEditModal({ isOpen: true, product });
    };

    // Open create modal
    const handleCreate = () => {
        setEditForm({
            petID: null,
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            currencyType: 'Coin',
            quantity: 10,
            status: 1
        });
        setCreateModal(true);
    };

    // Handle delete (disable product)
    const handleDelete = async (productId) => {
        const product = shopProducts.find(p => p.shopProductId === productId);
        if (!product) return;

        if (product.status === 0) {
            alert('Sản phẩm này đã bị vô hiệu hóa rồi!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn vô hiệu hóa sản phẩm này?')) {
            try {
                // Update product status to 0 (inactive)
                await updateShopProduct(productId, { ...product, status: 0 });
                alert('Vô hiệu hóa sản phẩm thành công!');
            } catch (error) {
                console.error('Failed to disable product:', error);
                alert('Vô hiệu hóa thất bại: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    // Handle enable product
    const handleEnable = async (productId) => {
        const product = shopProducts.find(p => p.shopProductId === productId);
        if (!product) return;

        if (product.status === 1) {
            alert('Sản phẩm này đã được kích hoạt rồi!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn kích hoạt lại sản phẩm này?')) {
            try {
                // Update product status to 1 (active)
                await updateShopProduct(productId, { ...product, status: 1 });
                alert('Kích hoạt sản phẩm thành công!');
            } catch (error) {
                console.error('Failed to enable product:', error);
                alert('Kích hoạt thất bại: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    // Handle form submission for create/edit
    const handleSubmit = async (isEdit = false) => {
        try {
            // Validation: Check if required fields are filled
            if (!editForm.name.trim()) {
                alert('Vui lòng nhập tên sản phẩm');
                return;
            }

            // Chỉ validate type khi đang tạo mới sản phẩm
            if (createModal && !editForm.type) {
                alert('Vui lòng chọn loại sản phẩm');
                return;
            }

            if (!editForm.price || editForm.price <= 0) {
                alert('Vui lòng nhập giá hợp lệ');
                return;
            }

            if (!editForm.quantity || editForm.quantity < 0) {
                alert('Vui lòng nhập số lượng hợp lệ');
                return;
            }

            // Chỉ validate pet type và petID khi đang tạo mới và loại sản phẩm là Pet
            if (!isEdit && editForm.type === 'Pet') {
                if (!editForm.petType) {
                    alert('Vui lòng chọn loại thú cưng');
                    return;
                }
                if (!editForm.petID) {
                    alert('Vui lòng chọn thú cưng cụ thể');
                    return;
                }
            }

            // Determine the actual type to submit - chỉ khi tạo mới
            let actualType = '';
            let isPetType = false;

            if (!isEdit) {
                // Logic xử lý type chỉ cho tạo mới sản phẩm
                if (editForm.type === 'Pet') {
                    // Always use "Pet" for all pet products, regardless of specific pet type
                    actualType = 'Pet';
                    isPetType = true;
                } else {
                    actualType = editForm.type;
                    isPetType = false;
                }
            }

            // Prepare submission data
            let submissionData = {
                ...editForm,
                price: parseFloat(editForm.price) || 0, // Ensure numeric
                quantity: parseInt(editForm.quantity) || 0, // Ensure integer
                status: parseInt(editForm.status) || 0, // Ensure integer
                // Add adminId from current user
                adminId: user?.adminId || user?.id
            };

            // Chỉ thêm logic type khi tạo mới
            if (!isEdit) {
                submissionData.type = actualType; // Use the actual type (pet type from selection, or item type)
                submissionData.shopId = isPetType ? 1 : 2; // Set shopId based on product type: Pet types = 1, Item types = 2

                // For Pet types, use the selected petID, otherwise set to null
                if (isPetType && editForm.petID) {
                    submissionData.petID = parseInt(editForm.petID);
                } else {
                    submissionData.petID = null;
                }
            }

            // Remove petType field since we use type directly (or not needed for edit)
            delete submissionData.petType;

            // Remove undefined fields
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] === undefined) {
                    delete submissionData[key];
                }
            });

            console.log('🚀 Submitting product data:', submissionData);
            console.log('🔍 Product type being saved:', submissionData.type);
            console.log('🐾 Pet ID being saved:', submissionData.petID);

            if (isEdit) {
                await updateShopProduct(editModal.product.shopProductId, submissionData);
                setEditModal({ isOpen: false, product: null });
            } else {
                await createShopProduct(submissionData);
                setCreateModal(false);
            }

            // Reset form
            setEditForm({
                petID: null,
                name: '',
                type: '',
                petType: '',
                description: '',
                imageUrl: '',
                price: '',
                currencyType: 'Coin',
                quantity: 10,
                status: 1
            });

            refreshData();
        } catch (error) {
            console.error('❌ Error saving product:', error);
            console.error('❌ Error details:', error.response?.data);

            let errorMessage = 'Lỗi khi lưu sản phẩm';
            if (error.response?.data?.message) {
                errorMessage += ': ' + error.response.data.message;
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            } else {
                errorMessage += ': HTTP ' + (error.response?.status || 500);
            }

            alert(errorMessage);
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

                    {/* Statistics in Header */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <Package className="h-4 w-4 text-purple-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Tổng Sản phẩm</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold text-sm">✕</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {shopProducts.filter(p => p.status === 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Statistics */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Package className="h-4 w-4 text-purple-600" />
                                <p className="text-xs font-medium text-gray-600">Tổng</p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">
                                {shopProducts.filter(p => p.status === 0).length}
                            </p>
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

            {/* Search and Filters Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 border-b border-purple-100">
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
                            <div className="flex gap-3">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors duration-200" />                                    <input
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
                                </div>

                                <button
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
                                >
                                    <Plus className="h-5 w-5" />
                                    Thêm Sản phẩm
                                </button>

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
                            </button>
                        </div>

                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Content Filters */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Lọc theo nội dung</span>
                                    </div>                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {/* 1. Shop Type Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Loại vật phẩm
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={shopTypeFilter}
                                                    onChange={(e) => handleShopTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả vật phẩm</option>
                                                    <option value="Pet"> Pet</option>
                                                    <option value="Food"> Food</option>
                                                    <option value="Toy"> Toy</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 2. Currency Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Tiền tệ
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={currencyFilter}
                                                    onChange={(e) => handleCurrencyFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả loại tiền</option>
                                                    <option value="Coin">Coin</option>
                                                    <option value="Diamond">Diamond</option>
                                                    <option value="Gem">Gem</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 3. Status Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Trạng thái
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả trạng thái</option>
                                                    <option value="active"> Active</option>
                                                    <option value="outOfStock">Inactive</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sort Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Sắp xếp dữ liệu</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Sort Field */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sắp xếp theo
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={sortConfig.key || ''}
                                                    onChange={(e) => {
                                                        const key = e.target.value;
                                                        if (key) {
                                                            handleSort(key);
                                                        } else {
                                                            setSortConfig({ key: null, direction: 'asc' });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> Không sắp xếp</option>
                                                    <option value="name">Tên sản phẩm</option>
                                                    <option value="price">Giá</option>
                                                    <option value="quantity">Số lượng</option>
                                                    <option value="status">Trạng thái</option>
                                                    <option value="type">Loại sản phẩm</option>
                                                    <option value="currencyType">Loại tiền tệ</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Thứ tự
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSortConfig(prev => ({ ...prev, direction: 'asc' }))}
                                                    disabled={!sortConfig.key}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${sortConfig.direction === 'asc' && sortConfig.key
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : sortConfig.key
                                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        <ChevronUp className="h-4 w-4" />
                                                        Tăng dần
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setSortConfig(prev => ({ ...prev, direction: 'desc' }))}
                                                    disabled={!sortConfig.key}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${sortConfig.direction === 'desc' && sortConfig.key
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : sortConfig.key
                                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        <ChevronDown className="h-4 w-4" />
                                                        Giảm dần
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Sort Display */}
                                    {sortConfig.key && (
                                        <div className="mt-3 p-2.5 bg-blue-100 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <span className="text-blue-800 font-medium">
                                                        Đang sắp xếp theo: <span className="font-bold">
                                                            {sortConfig.key === 'name' && 'Tên sản phẩm'}
                                                            {sortConfig.key === 'price' && 'Giá'}
                                                            {sortConfig.key === 'quantity' && 'Số lượng'}
                                                            {sortConfig.key === 'status' && 'Trạng thái'}
                                                            {sortConfig.key === 'type' && 'Loại sản phẩm'}
                                                            {sortConfig.key === 'currencyType' && 'Loại tiền tệ'}
                                                        </span> ({sortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'})
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                                >
                                                    Bỏ sắp xếp
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                                            disabled={statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm}
                                            className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'Không có bộ lọc nào'
                                                : 'Xóa tất cả bộ lọc'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(statusFilter !== 'all' || currencyFilter !== 'all' || shopTypeFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Tìm kiếm',
                                                    statusFilter !== 'all' && 'Trạng thái',
                                                    currencyFilter !== 'all' && 'Tiền tệ',
                                                    shopTypeFilter !== 'all' && 'Loại cửa hàng',
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

            {/* Results Summary */}
            {(debouncedSearchTerm || statusFilter !== 'all' || currencyFilter !== 'all' || shopTypeFilter !== 'all' || sortConfig.key) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                                Hiển thị <span className="font-bold text-blue-600">{currentProducts.length}</span> / <span className="font-bold">{totalItems}</span> sản phẩm
                                {debouncedSearchTerm && <span className="text-gray-500"> với từ khóa "{debouncedSearchTerm}"</span>}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            {sortConfig.key && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded border">
                                    {sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    <span>Sắp xếp: {
                                        sortConfig.key === 'name' ? 'Tên' :
                                            sortConfig.key === 'price' ? 'Giá' :
                                                sortConfig.key === 'quantity' ? 'Số lượng' :
                                                    sortConfig.key === 'status' ? 'Trạng thái' :
                                                        sortConfig.key === 'type' ? 'Loại' :
                                                            sortConfig.key === 'currencyType' ? 'Tiền tệ' :
                                                                sortConfig.key
                                    } ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})</span>
                                </div>
                            )}
                            <span>Trang {currentPage}/{totalPages}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[25%]" />
                                <col className="w-[10%]" />
                                <col className="w-[20%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[15%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-purple-600 to-pink-600 border-b-4 border-purple-800 shadow-lg">
                                <tr>
                                    <th
                                        className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30 cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                                        onClick={() => handleSort('name')}
                                        title="Click để sắp xếp theo tên sản phẩm"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Sản phẩm
                                            {sortConfig.key === 'name' && (
                                                sortConfig.direction === 'asc' ?
                                                    <ChevronUp className="h-4 w-4" /> :
                                                    <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30 cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                                        onClick={() => handleSort('type')}
                                        title="Click để sắp xếp theo loại sản phẩm"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Loại
                                            {sortConfig.key === 'type' && (
                                                sortConfig.direction === 'asc' ?
                                                    <ChevronUp className="h-4 w-4" /> :
                                                    <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Mô tả
                                    </th>
                                    <th
                                        className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30 cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                                        onClick={() => handleSort('price')}
                                        title="Click để sắp xếp theo giá"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Giá
                                            {sortConfig.key === 'price' && (
                                                sortConfig.direction === 'asc' ?
                                                    <ChevronUp className="h-4 w-4" /> :
                                                    <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30 cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                                        onClick={() => handleSort('quantity')}
                                        title="Click để sắp xếp theo số lượng"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Số lượng
                                            {sortConfig.key === 'quantity' && (
                                                sortConfig.direction === 'asc' ?
                                                    <ChevronUp className="h-4 w-4" /> :
                                                    <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30 cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                                        onClick={() => handleSort('status')}
                                        title="Click để sắp xếp theo trạng thái"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Trạng thái
                                            {sortConfig.key === 'status' && (
                                                sortConfig.direction === 'asc' ?
                                                    <ChevronUp className="h-4 w-4" /> :
                                                    <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">Không có sản phẩm nào</h3>                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || shopTypeFilter !== 'all' || statusFilter !== 'all' || currencyFilter !== 'all' ?
                                                            'Không tìm thấy sản phẩm phù hợp với bộ lọc.' :
                                                            'Hãy bắt đầu bằng cách thêm sản phẩm mới.'
                                                        }
                                                    </p>
                                                    {!(localSearchTerm || debouncedSearchTerm) && shopTypeFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && (
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
                                        <td className="px-3 py-4">
                                            <div className="flex items-start space-x-3 ml-10">
                                                {product.imageUrl ? (
                                                    <ProductImage
                                                        imageUrl={product.imageUrl}
                                                        productName={product.name}
                                                        className="h-10 w-10 rounded-lg flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 break-words" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {product.type === 'Food' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                        Food
                                                    </span>
                                                )}
                                                {product.type === 'Toy' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200 shadow-sm">
                                                        Toy
                                                    </span>
                                                )}
                                                {isPetProduct(product) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        Pet
                                                    </span>
                                                )}
                                                {!isPetProduct(product) && !['Food', 'Toy'].includes(product.type) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                        {product.type || 'Chưa phân loại'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                <div className="text-xs text-gray-700 truncate max-w-[150px]" title={product.description || 'Không có mô tả'}>
                                                    {product.description || 'Không có mô tả'}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-3 py-4">
                                            <div className="flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-gray-900">
                                                        {formatCurrency(product.price, product.currencyType)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                    {product.quantity}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {product.status === 1 ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-sm">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center space-x-1">
                                                <button
                                                    onClick={() => handleView(product)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {product.status === 1 ? (
                                                    <button
                                                        onClick={() => handleDelete(product.shopProductId)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Vô hiệu hóa"
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnable(product.shopProductId)}
                                                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Kích hoạt"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
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
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(createModal || editModal.isOpen) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {createModal ? 'Thêm Sản phẩm Mới' : 'Chỉnh sửa Sản phẩm'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
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

                                {/* Chỉ hiển thị box "Loại sản phẩm" khi tạo mới, không hiển thị khi chỉnh sửa */}
                                {createModal && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Loại sản phẩm *</label>
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => {
                                                setEditForm({ ...editForm, type: e.target.value, petType: '', petID: null });
                                            }}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        >
                                            <option value="">Chọn loại sản phẩm</option>
                                            <option value="Pet"> Pet</option>
                                            <option value="Food"> Food</option>
                                            <option value="Toy"> Toy</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Chọn loại sản phẩm: thú cưng, thức ăn, hoặc đồ chơi
                                        </p>
                                    </div>
                                )}

                                {/* Pet Type Selection - chỉ hiển thị khi tạo mới và loại sản phẩm là Pet */}
                                {createModal && editForm.type === 'Pet' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Chọn loại thú cưng *</label>
                                        <select
                                            value={editForm.petType || ''}
                                            onChange={(e) => setEditForm({ ...editForm, petType: e.target.value, petID: null })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        >
                                            <option value="">Chọn loại thú cưng</option>
                                            {/* Get unique pet types from pets database */}
                                            {[...new Set(pets.map(pet => pet.petType))].map(petType => (
                                                <option key={petType} value={petType}>
                                                    {petType}
                                                </option>
                                            ))}
                                        </select>
                                        {petsLoading && (
                                            <p className="mt-1 text-xs text-blue-600">
                                                ⏳ Đang tải danh sách thú cưng...
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Chọn loại thú cưng mà sản phẩm này dành cho
                                        </p>
                                    </div>
                                )}

                                {/* Pet ID Selection - chỉ hiển thị khi đã chọn loại thú cưng */}
                                {createModal && editForm.type === 'Pet' && editForm.petType && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Chọn thú cưng cụ thể *</label>
                                        <select
                                            value={editForm.petID || ''}
                                            onChange={(e) => setEditForm({ ...editForm, petID: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        >
                                            <option value="">Chọn thú cưng</option>
                                            {pets.filter(pet => pet.petType === editForm.petType).map(pet => (
                                                <option key={pet.petId} value={pet.petId}>
                                                    {pet.petName} (ID: {pet.petId})
                                                </option>
                                            ))}
                                        </select>
                                        {petsLoading && (
                                            <p className="mt-1 text-xs text-blue-600">
                                                ⏳ Đang tải danh sách thú cưng...
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Chọn thú cưng cụ thể từ loại {editForm.petType}
                                        </p>
                                    </div>
                                )}

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
                                        Hỗ trợ tự động chuyển đổi link Google Drive sang định dạng hiển thị phù hợp
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
                                        <option value="Coin">Coin</option>
                                        <option value="Diamond">Diamond</option>
                                        <option value="Gem">Gem</option>
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
                                        <option value="1"> Active</option>
                                        <option value="0"> Inactive</option>
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
                                disabled={
                                    !editForm.name.trim() ||
                                    (createModal && !editForm.type.trim()) ||
                                    (createModal && editForm.type === 'Pet' && !editForm.petType.trim()) ||
                                    (createModal && editForm.type === 'Pet' && !editForm.petID) ||
                                    !editForm.price ||
                                    !editForm.quantity
                                }
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
                                    <label className="block text-sm font-medium text-gray-700">Thú cưng liên kết</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.petID ? (
                                            (() => {
                                                const linkedPet = pets.find(pet => pet.petId == selectedProduct.petID);
                                                return linkedPet
                                                    ? `${linkedPet.petName} (ID: ${selectedProduct.petID})`
                                                    : `ID: ${selectedProduct.petID}`;
                                            })()
                                        ) : 'Không có'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.type === 'Food' ? 'Food' :
                                            selectedProduct.type === 'Toy' ? 'Toy' :
                                                isPetProduct(selectedProduct) ? 'Pet' :
                                                    selectedProduct.type}
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
                                        {selectedProduct.currencyType === 'Coin' && 'Coin'}
                                        {selectedProduct.currencyType === 'Diamond' && 'Diamond'}
                                        {selectedProduct.currencyType === 'Gem' && 'Gem'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.quantity}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.status === 1 ? 'Active' : 'Inactive'}
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
