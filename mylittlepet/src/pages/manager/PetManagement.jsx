import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSimplePets } from '../../hooks/useSimplePets';

// Simple Pet Management Component
const PetManagement = () => {
    // Use hook for data management
    const {
        pets,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        createPet,
        updatePet,
        deletePet,
        searchPets,
        filterByType,
        filterByStatus,
        refreshData
    } = useSimplePets();

    // Local UI state
    const [selectedPet, setSelectedPet] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, pet: null });
    const [createModal, setCreateModal] = useState(false);
    const [editForm, setEditForm] = useState({
        petType: '',
        petDefaultName: '',
        description: '',
        petStatus: 1
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalItems = pets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPets = pets.slice(startIndex, endIndex);

    // Reset to page 1 when pets data changes (search, filter)
    useEffect(() => {
        setCurrentPage(1);
    }, [pets.length, searchTerm, typeFilter, statusFilter]);

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
            searchPets(value);
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

    // Handle status filter
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        if (status !== '') {
            filterByStatus(status);
        } else {
            refreshData();
        }
    };

    // View pet details
    const handleView = (pet) => {
        setSelectedPet(pet);
    };

    // Open edit modal
    const handleEdit = (pet) => {
        setEditForm({
            petType: pet.petType || '',
            petDefaultName: pet.petDefaultName || '',
            description: pet.description || '',
            petStatus: pet.petStatus || 1
        });
        setEditModal({ isOpen: true, pet: pet });
    };

    // Open create modal
    const handleCreate = () => {
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        });
        setCreateModal(true);
    };

    // Submit create
    const handleCreateSubmit = async () => {
        try {
            await createPet(editForm);
            setCreateModal(false);
            alert('Tạo thú cưng thành công!');
        } catch (error) {
            console.error('Failed to create pet:', error);
            alert('Tạo thú cưng thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Submit edit
    const handleEditSubmit = async () => {
        try {
            await updatePet(editModal.pet.petId, editForm);
            setEditModal({ isOpen: false, pet: null });
            alert('Cập nhật thú cưng thành công!');
        } catch (error) {
            console.error('Failed to update pet:', error);
            alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Handle delete
    const handleDelete = async (petId) => {
        if (window.confirm('Bạn có chắc muốn xóa thú cưng này?')) {
            try {
                await deletePet(petId);
                alert('Xóa thú cưng thành công!');
            } catch (error) {
                console.error('Failed to delete pet:', error);
                alert('Xóa thất bại: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    // Cancel forms
    const handleCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        setCreateModal(false);
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        return status === 1 ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Hoạt động
            </span>
        ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Vô hiệu hóa
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    🐾 Quản lý Thú Cưng
                </h1>
                <p className="text-gray-600">
                    Quản lý các loài thú cưng trong hệ thống
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Pet Details Display */}
            {selectedPet && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">
                                Chi tiết thú cưng: {selectedPet.petDefaultName || 'N/A'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <h5 className="font-medium text-blue-700">Thông tin cơ bản</h5>
                                    <p><strong>🏷️ ID:</strong> {selectedPet.petId}</p>
                                    <p><strong>🐾 Loại:</strong> {selectedPet.petType || 'N/A'}</p>
                                    <p><strong>📝 Tên mặc định:</strong> {selectedPet.petDefaultName || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-medium text-blue-700">Trạng thái</h5>
                                    <p><strong>📊 Trạng thái:</strong> {getStatusBadge(selectedPet.petStatus)}</p>
                                    <p><strong>👤 Admin ID:</strong> {selectedPet.adminId || 'N/A'}</p>
                                </div>
                                {selectedPet.description && (
                                    <div className="col-span-2">
                                        <h5 className="font-medium text-blue-700">Mô tả</h5>
                                        <p className="text-gray-700">{selectedPet.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPet(null)}
                            className="ml-4 text-blue-600 hover:text-blue-800 p-1"
                            title="Đóng"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thú cưng..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <select
                        value={typeFilter}
                        onChange={(e) => handleTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="Cat">Mèo</option>
                        <option value="Dog">Chó</option>
                        <option value="Bird">Chim</option>
                        <option value="Fish">Cá</option>
                        <option value="Other">Khác</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Hoạt động</option>
                        <option value="0">Vô hiệu hóa</option>
                    </select>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm thú cưng</span>
                </button>
            </div>

            {/* Pet Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Mô tả
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-200">                        {loading ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </div>
                            </td>
                        </tr>
                    ) : currentPets.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                <div className="text-4xl mb-2">🐾</div>
                                <p>Không có thú cưng nào</p>
                            </td>
                        </tr>
                    ) : (
                        currentPets.map((pet) => (
                            <tr key={pet.petId} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="text-2xl mr-3">🐾</div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {pet.petDefaultName || 'Chưa đặt tên'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {pet.petType || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="max-w-xs truncate">
                                        {pet.description || 'Không có mô tả'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(pet.petStatus)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleView(pet)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(pet)}
                                            className="text-green-600 hover:text-green-800 p-1"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pet.petId)}
                                            className="text-red-600 hover:text-red-800 p-1"
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
            </div>            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    {/* Page Info and Items per page */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Hiển thị từ {startIndex + 1} đến {Math.min(endIndex, totalItems)} của {totalItems} thú cưng
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Hiển thị:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-600">thú cưng/trang</span>
                        </div>
                    </div>

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

            {/* Create Pet Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Tạo thú cưng mới
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thú cưng
                                </label>
                                <input
                                    type="text"
                                    value={editForm.petDefaultName}
                                    onChange={(e) => setEditForm({ ...editForm, petDefaultName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên thú cưng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại thú cưng
                                </label>
                                <select
                                    value={editForm.petType}
                                    onChange={(e) => setEditForm({ ...editForm, petType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn loại thú cưng</option>
                                    <option value="Cat">Mèo</option>
                                    <option value="Dog">Chó</option>
                                    <option value="Bird">Chim</option>
                                    <option value="Fish">Cá</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Nhập mô tả thú cưng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={editForm.petStatus}
                                    onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Vô hiệu hóa</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Pet Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Chỉnh sửa thú cưng: {editModal.pet?.petDefaultName}
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thú cưng
                                </label>
                                <input
                                    type="text"
                                    value={editForm.petDefaultName}
                                    onChange={(e) => setEditForm({ ...editForm, petDefaultName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên thú cưng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại thú cưng
                                </label>
                                <select
                                    value={editForm.petType}
                                    onChange={(e) => setEditForm({ ...editForm, petType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn loại thú cưng</option>
                                    <option value="Cat">Mèo</option>
                                    <option value="Dog">Chó</option>
                                    <option value="Bird">Chim</option>
                                    <option value="Fish">Cá</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Nhập mô tả thú cưng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={editForm.petStatus}
                                    onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Vô hiệu hóa</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetManagement;
