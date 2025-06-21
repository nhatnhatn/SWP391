import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Package, Store, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts';

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
    } = useSimpleShopProducts();

    // Local UI state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [editForm, setEditForm] = useState({
        shopId: '',
        name: '',
        type: '',
        description: '',
        imageUrl: '',
        price: '',
        currencyType: 'COIN',
        quality: 10,
        status: 1
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalItems = shopProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = shopProducts.slice(startIndex, endIndex);

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

    // View product details
    const handleView = (product) => {
        setSelectedProduct(product);
    };

    // Open edit modal
    const handleEdit = (product) => {
        setEditForm({
            shopId: product.shopId || '',
            name: product.name || '',
            type: product.type || '',
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            price: product.price || '',
            currencyType: product.currencyType || 'COIN',
            quality: product.quality || 100,
            status: product.status || 1
        });
        setEditModal({ isOpen: true, product: product });
    };

    // Open create modal
    const handleCreate = () => {
        setEditForm({
            shopId: '',
            name: '',
            type: '', description: '',
            imageUrl: '',
            price: '',
            currencyType: 'COIN',
            quality: 10,
            status: 1
        });
        setCreateModal(true);
    };

    // Open delete modal
    const handleDelete = (product) => {
        setDeleteModal({ isOpen: true, product: product });
    };

    // Submit create
    const handleCreateSubmit = async () => {
        try {
            const formData = {
                ...editForm,
                price: parseInt(editForm.price),
                quality: parseInt(editForm.quality),
                status: parseInt(editForm.status),
                shopId: parseInt(editForm.shopId),
                adminId: 1 // Default admin ID, you might want to get this from auth context
            };
            await createShopProduct(formData);
            setCreateModal(false);
            setEditForm({
                shopId: '', name: '', type: '', description: '', imageUrl: '', price: '', currencyType: 'COIN', quality: 10, status: 1
            });
            alert('Tạo sản phẩm cửa hàng thành công!');
        } catch (error) {
            alert('Lỗi khi tạo sản phẩm cửa hàng: ' + error.message);
        }
    };

    // Submit edit
    const handleEditSubmit = async () => {
        try {
            const formData = {
                ...editForm,
                price: parseInt(editForm.price),
                quality: parseInt(editForm.quality),
                status: parseInt(editForm.status),
                shopId: parseInt(editForm.shopId),
                adminId: 1 // Default admin ID
            };
            await updateShopProduct(editModal.product.shopProductId, formData);
            setEditModal({ isOpen: false, product: null });
            setEditForm({
                shopId: '', name: '', type: '', description: '', imageUrl: '', price: '', currencyType: 'COIN', quality: 10, status: 1
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
    };

    // Get unique values for filters
    const getUniqueCurrencies = () => {
        return [...new Set(shopProducts.map(product => product.currencyType).filter(Boolean))];
    };

    // Format currency
    const formatCurrency = (amount, type) => {
        const formatAmount = new Intl.NumberFormat('vi-VN').format(amount);
        const symbols = {
            'COIN': '🪙',
            'DIAMOND': '💎',
            'GEM': '💰'
        };
        return `${symbols[type] || '💰'} ${formatAmount}`;
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
                <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm Cửa Hàng</h1>
                        <p className="text-gray-600">Quản lý danh sách sản phẩm trong các cửa hàng</p>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.map((product) => (
                                <tr key={product.shopProductId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {product.imageUrl && (
                                                <img className="h-10 w-10 rounded-lg object-cover mr-3"
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    onError={(e) => e.target.style.display = 'none'} />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate" title={product.description}>
                                                    {product.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap">
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
                                        <span className="text-sm text-gray-900">{product.quality}</span>
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
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                                    {selectedProduct.imageUrl ? (
                                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name}
                                            className="mt-1 h-32 w-32 object-cover rounded-lg border border-gray-300" />
                                    ) : (
                                        <div className="mt-1 h-32 w-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedProduct.quality}</p>
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
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>
                                    <input
                                        type="text"
                                        value={editForm.imageUrl}
                                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
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
                                        <option value="COIN">COIN (🪙)</option>
                                        <option value="DIAMOND">DIAMOND (💎)</option>
                                        <option value="GEM">GEM (💰)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                    <input
                                        type="number" value={editForm.quality}
                                        onChange={(e) => setEditForm({ ...editForm, quality: e.target.value })}
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
