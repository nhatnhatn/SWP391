import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Store } from 'lucide-react';
import { useSimpleShops } from '../../hooks/useSimpleShops';

// Simple Shop Management Component
const ShopManagement = () => {
    // Use hook for data management
    const {
        shops,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        createShop,
        updateShop,
        deleteShop,
        searchShops,
        filterByType,
        refreshData
    } = useSimpleShops();

    // Local UI state
    const [selectedShop, setSelectedShop] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, shop: null });
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, shop: null });
    const [editForm, setEditForm] = useState({
        name: '',
        type: '',
        description: ''
    });

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            searchShops(value);
        } else {
            refreshData();
        }
    };

    // Handle type filter
    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        if (type) {
            filterByType(type);
        } else {
            refreshData();
        }
    };

    // View shop details
    const handleView = (shop) => {
        setSelectedShop(shop);
    };

    // Open edit modal
    const handleEdit = (shop) => {
        setEditForm({
            name: shop.name || '',
            type: shop.type || '',
            description: shop.description || ''
        });
        setEditModal({ isOpen: true, shop: shop });
    };

    // Open create modal
    const handleCreate = () => {
        setEditForm({
            name: '',
            type: '',
            description: ''
        });
        setCreateModal(true);
    };

    // Open delete modal
    const handleDelete = (shop) => {
        setDeleteModal({ isOpen: true, shop: shop });
    };

    // Submit create
    const handleCreateSubmit = async () => {
        try {
            await createShop(editForm);
            setCreateModal(false);
            setEditForm({ name: '', type: '', description: '' });
            alert('Tạo shop thành công!');
        } catch (error) {
            alert('Lỗi khi tạo shop: ' + error.message);
        }
    };

    // Submit edit
    const handleEditSubmit = async () => {
        try {
            await updateShop(editModal.shop.shopId, editForm);
            setEditModal({ isOpen: false, shop: null });
            setEditForm({ name: '', type: '', description: '' });
            alert('Cập nhật shop thành công!');
        } catch (error) {
            alert('Lỗi khi cập nhật shop: ' + error.message);
        }
    };

    // Submit delete
    const handleDeleteSubmit = async () => {
        try {
            await deleteShop(deleteModal.shop.shopId);
            setDeleteModal({ isOpen: false, shop: null });
            alert('Xóa shop thành công!');
        } catch (error) {
            alert('Lỗi khi xóa shop: ' + error.message);
        }
    };

    // Get unique shop types for filter
    const getShopTypes = () => {
        const types = [...new Set(shops.map(shop => shop.type).filter(Boolean))];
        return types;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Store className="h-8 w-8 text-blue-600" />
                        <div>                            <h1 className="text-2xl font-bold text-gray-800">Quản lý Cửa Hàng</h1>
                            <p className="text-gray-600">Quản lý danh sách các cửa hàng trong hệ thống</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >                        <Plus className="h-4 w-4" />
                        Thêm Cửa Hàng
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cửa hàng theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả loại</option>
                            {getShopTypes().map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Store className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">                            <p className="text-sm font-medium text-gray-600">Tổng Cửa Hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{shops.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Filter className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Loại Cửa Hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{getShopTypes().length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Search className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang tìm kiếm</p>
                            <p className="text-2xl font-bold text-gray-900">{searchTerm ? 'Có' : 'Không'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Danh sách Shop ({shops.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Shop</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shops.map((shop) => (
                                <tr key={shop.shopId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{shop.shopId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {shop.type || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={shop.description}>
                                            {shop.description || 'Chưa có mô tả'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleView(shop)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(shop)}
                                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(shop)}
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
                    </table>

                    {shops.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Store className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có shop nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Không tìm thấy shop phù hợp.' : 'Hãy bắt đầu bằng cách tạo shop mới.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Shop Detail Modal */}
            {selectedShop && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết Shop</h3>
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID Shop</label>
                                <p className="mt-1 text-sm text-gray-900">#{selectedShop.shopId}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên Shop</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedShop.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loại</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedShop.type || 'Chưa xác định'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedShop.description || 'Chưa có mô tả'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Shop Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Thêm Cửa Hàng Mới</h3>
                            <button
                                onClick={() => setCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên Shop *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên shop"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loại</label>
                                <input
                                    type="text"
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập loại shop"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập mô tả shop"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setCreateModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={!editForm.name.trim()}
                            >
                                Tạo Shop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Shop Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa Shop</h3>
                            <button
                                onClick={() => setEditModal({ isOpen: false, shop: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên Shop *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên shop"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loại</label>
                                <input
                                    type="text"
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập loại shop"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập mô tả shop"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditModal({ isOpen: false, shop: null })}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={!editForm.name.trim()}
                            >
                                Cập nhật
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
                                onClick={() => setDeleteModal({ isOpen: false, shop: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa shop <strong>{deleteModal.shop?.name}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, shop: null })}
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

export default ShopManagement;
