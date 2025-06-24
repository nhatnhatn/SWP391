import React, { useState, useEffect, useMemo } from 'react';
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

    // Debug logging
    useEffect(() => {
        if (imageUrl) {
            const originalUrl = imageUrl;
            const convertedUrl = convertGoogleDriveLink(originalUrl);
            const fileId = convertedUrl.split('id=')[1];

            console.log('🖼️ Image Display Debug:');
            console.log('Product Name:', productName);
            console.log('Original URL:', originalUrl);
            console.log('Converted URL:', convertedUrl);
            console.log('File ID:', fileId);
            console.log('Generated fallback URLs:', fallbackUrls);
        }
    }, [imageUrl, productName, fallbackUrls]);

    if (!imageUrl) {
        console.log('📦 No image URL found for product:', productName);
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
        <div className="relative">
            <img
                src={fallbackUrls[currentUrlIndex]}
                alt={productName}
                className={`object-cover rounded-lg border border-gray-300 ${className}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
            />            {currentUrlIndex > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                    Alt {currentUrlIndex + 1}
                </div>
            )}
        </div>
    );
};

// Simple Shop Product Management Component
const ShopProductManagement = () => {
    // Use hook for data management
    const {
        shopProducts,
        shops,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        shopFilter,
        setShopFilter,
        currencyFilter,
        setCurrencyFilter,
        createShopProduct,
        updateShopProduct, deleteShopProduct,
        updateShopProductStatus,
        searchShopProducts,
        filterByType,
        filterByStatus,
        filterByShop,
        filterByCurrency,
        refreshData,
        getShopName
    } = useSimpleShopProducts();    // Local UI state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });
    const [createModal, setCreateModal] = useState(false); const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [linkConverted, setLinkConverted] = useState(false);
    const [showGoogleDriveHelp, setShowGoogleDriveHelp] = useState(false);    const [editForm, setEditForm] = useState({        shopId: '',
        petID: null,
        name: '',
        type: '',
        description: '',
        imageUrl: '',
        price: '',
        currencyType: 'COIN',
        quantity: 10,
        status: 1
    });// Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);    // Apply sorting to products (must be before pagination)
    const sortedProducts = useMemo(() => {
        if (!sortConfig.key) return shopProducts;

        return [...shopProducts].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];            // Special handling for numeric fields
            if (sortConfig.key === 'price' || sortConfig.key === 'quantity') {
                aValue = Number(aValue) || 0;
                bValue = Number(bValue) || 0;
            }

            // Special handling for status (ensure numeric comparison)
            if (sortConfig.key === 'status') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [shopProducts, sortConfig]);

    // Calculate pagination (use sortedProducts instead of shopProducts)
    const totalItems = sortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    // Reset to page 1 when products data changes (search, filter)
    useEffect(() => {
        setCurrentPage(1);
    }, [shopProducts.length, searchTerm, typeFilter, statusFilter, shopFilter, currencyFilter]);

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

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            searchShopProducts(value);
        } else {
            refreshData();
        }
    };

    // Handle filters
    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        if (type) {
            filterByType(type);
        } else {
            refreshData();
        }
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        if (status !== '') {
            filterByStatus(status);
        } else {
            refreshData();
        }
    };

    const handleShopFilter = (shopId) => {
        setShopFilter(shopId);
        if (shopId) {
            filterByShop(shopId);
        } else {
            refreshData();
        }
    };

    const handleCurrencyFilter = (currency) => {
        setCurrencyFilter(currency);
        if (currency) {
            filterByCurrency(currency);
        } else {
            refreshData();
        }
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
    const handleEdit = (product) => {        setEditForm({
            shopId: product.shopId || '',
            petID: product.petID || null,
            name: product.name || '',
            type: product.type || '',
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            price: product.price || '',
            currencyType: product.currencyType || 'COIN',
            quantity: product.quantity || 100,
            status: product.status || 1
        });
        setEditModal({ isOpen: true, product: product });
    };

    // Open create modal
    const handleCreate = () => {        setEditForm({
            shopId: '',
            petID: null,
            name: '',
            type: '',
            description: '',
            imageUrl: '',
            price: '',
            currencyType: 'COIN',
            quantity: 10,
            status: 1
        });
        setCreateModal(true);
    };

    // Open delete modal
    const handleDelete = (product) => {
        setDeleteModal({ isOpen: true, product: product });
    };

    // Submit create
    const handleCreateSubmit = async () => {        try {            const formData = {
                ...editForm,
                price: parseInt(editForm.price),
                quantity: parseInt(editForm.quantity),
                status: parseInt(editForm.status),
                shopId: parseInt(editForm.shopId),
                petID: editForm.petID ? parseInt(editForm.petID) : null,
                adminId: 1 // Default admin ID, you might want to get this from auth context
            };await createShopProduct(formData);
            setCreateModal(false);
            setEditForm({
                shopId: '', petID: null, name: '', type: '', description: '', imageUrl: '', price: '', currencyType: 'COIN', quantity: 10, status: 1
            });
            alert('Tạo sản phẩm cửa hàng thành công!');
        } catch (error) {
            alert('Lỗi khi tạo sản phẩm cửa hàng: ' + error.message);
        }    };

    // Submit edit
    const handleEditSubmit = async () => {
        try {
            const formData = {
                ...editForm,
                price: parseInt(editForm.price),
                quantity: parseInt(editForm.quantity),
                status: parseInt(editForm.status),
                shopId: parseInt(editForm.shopId),
                adminId: 1 // Default admin ID
            };
            await updateShopProduct(editModal.product.shopProductId, formData);
            setEditModal({ isOpen: false, product: null });
            setEditForm({
                shopId: '', name: '', type: '', description: '', imageUrl: '', price: '', currencyType: 'COIN', quantity: 10, status: 1
            });
            alert('Cập nhật sản phẩm cửa hàng thành công!');
        } catch (error) {
            alert('Lỗi khi cập nhật sản phẩm cửa hàng: ' + error.message);
        }
    };

    // Submit delete
    const handleDeleteSubmit = async () => {
        try {
            await deleteShopProduct(deleteModal.product.shopProductId);
            setDeleteModal({ isOpen: false, product: null });
            alert('Xóa sản phẩm cửa hàng thành công!');
        } catch (error) {
            alert('Lỗi khi xóa sản phẩm cửa hàng: ' + error.message);
        }
    };

    // Toggle product status
    const handleToggleStatus = async (product) => {
        try {
            const newStatus = product.status === 1 ? 0 : 1;
            await updateShopProductStatus(product.shopProductId, newStatus);
            alert(`${newStatus === 1 ? 'Kích hoạt' : 'Tắt'} sản phẩm thành công!`);
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái: ' + error.message);
        }
    };    // Get unique values for filters
    const getUniqueCurrencies = () => {
        const currencies = [...new Set(shopProducts.map(product => product.currencyType).filter(Boolean))];
        // Filter out uppercase variants as they are database errors
        return currencies.filter(currency => currency !== 'DIAMOND' && currency !== 'GEM');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (

        <div className="p-6 bg-gray-50 min-h-screen">            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm Cửa Hàng</h1>
                            <p className="text-gray-600">Quản lý danh sách sản phẩm trong các cửa hàng</p>
                        </div>
                    </div>

                    {/* Quick Access to Google Drive */}
                    <div className="flex gap-2">
                        <a
                            href="https://drive.google.com/drive/u/0/folders/14-F6VcATkQVW8qwHrA4flc0fX8ffC5Ha"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
                            title="Mở thư mục ảnh Google Drive"
                        >
                            📁 Thư mục ảnh
                        </a>
                        <button
                            onClick={() => setShowGoogleDriveHelp(true)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            title="Hướng dẫn sử dụng Google Drive"
                        >
                            ❓ Hướng dẫn
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Store className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Cửa Hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{shops.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Filter className="h-6 w-6 text-blue-600" />
                        </div>                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Loại SP</p>
                            <p className="text-2xl font-bold text-gray-900">2</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Loại Tiền</p>
                            <p className="text-2xl font-bold text-gray-900">{getUniqueCurrencies().length}</p>
                        </div>
                    </div>
                </div>            </div>            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Top row: Search and Add button */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm Sản phẩm
                        </button>
                    </div>

                    {/* Bottom row: Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-gray-500" />
                            <select
                                value={shopFilter}
                                onChange={(e) => handleShopFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Tất cả cửa hàng</option>
                                {shops.map(shop => (
                                    <option key={shop.shopId} value={shop.shopId}>{shop.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={typeFilter}
                                onChange={(e) => handleTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Tất cả loại</option>
                                <option value="Pet">Pet</option>
                                <option value="Item">Item</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <select
                                value={currencyFilter}
                                onChange={(e) => handleCurrencyFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Tất cả tiền tệ</option>
                                {getUniqueCurrencies().map(currency => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="1">Hoạt động</option>
                                <option value="0">Tắt</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>            {/* Product Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Sản phẩm</span>
                                    <div className="flex flex-col">
                                        <ChevronUp className={`h-3 w-3 ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <ChevronDown className={`h-3 w-3 ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa Hàng</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('type')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Loại</span>
                                    <div className="flex flex-col">
                                        <ChevronUp className={`h-3 w-3 ${sortConfig.key === 'type' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <ChevronDown className={`h-3 w-3 ${sortConfig.key === 'type' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('price')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Giá</span>
                                    <div className="flex flex-col">
                                        <ChevronUp className={`h-3 w-3 ${sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <ChevronDown className={`h-3 w-3 ${sortConfig.key === 'price' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('quantity')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Số lượng</span>
                                    <div className="flex flex-col">
                                        <ChevronUp className={`h-3 w-3 ${sortConfig.key === 'quantity' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <ChevronDown className={`h-3 w-3 ${sortConfig.key === 'quantity' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Trạng thái</span>
                                    <div className="flex flex-col">
                                        <ChevronUp className={`h-3 w-3 ${sortConfig.key === 'status' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <ChevronDown className={`h-3 w-3 ${sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead><tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.map((product) => (
                                <tr key={product.shopProductId} className="hover:bg-gray-50">                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">                                            {product.imageUrl ? (
                                        <ProductImage
                                            imageUrl={product.imageUrl}
                                            productName={product.name}
                                            className="h-10 w-10 mr-3"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mr-3">
                                            <Package className="h-4 w-4 text-gray-400" />
                                        </div>
                                    )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate" title={product.description}>
                                                {product.description}
                                            </div>
                                        </div>
                                    </div>
                                </td><td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{getShopName(product.shopId)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(product.price, product.currencyType)}
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{product.quantity}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 1
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                } transition-colors cursor-pointer`}
                                        >
                                            {product.status === 1 ? 'Hoạt động' : 'Tắt'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleView(product)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                    {currentProducts.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Không tìm thấy sản phẩm phù hợp.' : 'Hãy bắt đầu bằng cách tạo sản phẩm mới.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center">
                    {/* Page Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPrevPage}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Trước
                        </button>

                        <span className="text-sm text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={goToNextPage}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            disabled={currentPage === totalPages}
                        >
                            Tiếp
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* View Product Detail Modal */}
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
                                    <label className="block text-sm font-medium text-gray-700">ID Sản phẩm</label>
                                    <p className="mt-1 text-sm text-gray-900">#{selectedProduct.shopProductId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                                </div>                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cửa Hàng</label>
                                    <p className="mt-1 text-sm text-gray-900">{getShopName(selectedProduct.shopId)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.type}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Giá</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProduct.price, selectedProduct.currencyType)}</p>
                                </div>
                            </div>                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                                    <ProductImage
                                        imageUrl={selectedProduct.imageUrl}
                                        productName={selectedProduct.name}
                                        className="mt-1 h-32 w-32"
                                    />
                                </div>                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.quantity}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.status === 1 ? 'Hoạt động' : 'Tắt'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Admin tạo</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.adminName || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.description || 'Chưa có mô tả'}</p>
                        </div>

                        <div className="flex justify-end mt-6">
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

            {/* Create/Edit Modal */}
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
                                <div>                                    <label className="block text-sm font-medium text-gray-700">Cửa Hàng *</label>
                                    <select
                                        value={editForm.shopId}
                                        onChange={(e) => setEditForm({ ...editForm, shopId: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="">Chọn cửa hàng</option>
                                        {shops.map(shop => (
                                            <option key={shop.shopId} value={shop.shopId}>{shop.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                                </div>                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại *</label>
                                    <select
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    >
                                        <option value="">Chọn loại</option>
                                        <option value="Pet">Pet</option>
                                        <option value="Item">Item</option>
                                    </select>
                                </div>                                <div>
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
                                            <img
                                                src={convertGoogleDriveLink(editForm.imageUrl)}
                                                alt="Preview"
                                                className="w-20 h-20 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                                onLoad={(e) => {
                                                    e.target.style.display = 'block';
                                                    e.target.nextSibling.style.display = 'none';
                                                }}
                                            />
                                            <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center" style={{ display: 'none' }}>
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
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
                                        required                                    >
                                        <option value="COIN">COIN (🪙)</option>
                                        <option value="Diamond">Diamond (💎)</option>
                                        <option value="Gem">Gem (🔷)</option>
                                    </select>
                                </div>                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <input
                                        type="number" value={editForm.quantity}
                                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Nhập số lượng"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="1">Hoạt động</option>
                                        <option value="0">Tắt</option>
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
                                onClick={createModal ? handleCreateSubmit : handleEditSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                disabled={!editForm.name.trim() || !editForm.shopId || !editForm.type.trim() || !editForm.price}
                            >
                                {createModal ? 'Tạo Sản phẩm' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>)}

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
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProductManagement;
