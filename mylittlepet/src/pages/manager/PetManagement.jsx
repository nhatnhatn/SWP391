import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Eye, Filter, ChevronLeft, ChevronRight, PawPrint, RotateCcw, ChevronUp, ChevronDown, X, Save } from 'lucide-react';
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
    } = useSimplePets();    // Local UI state
    const [selectedPet, setSelectedPet] = useState(null);
    const [createModal, setCreateModal] = useState(false);

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Edit state for detail modal
    const [editModal, setEditModal] = useState({ isOpen: false, pet: null });
    const [editForm, setEditForm] = useState({
        petType: '',
        petDefaultName: '',
        description: '',
        petStatus: 1
    });    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Apply sorting to pets (must be before pagination)
    const sortedPets = useMemo(() => {
        if (!sortConfig.key) return pets;

        return [...pets].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [pets, sortConfig]);

    // Calculate pagination
    const totalItems = sortedPets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPets = sortedPets.slice(startIndex, endIndex);

    // Calculate statistics
    const totalPets = pets.length;
    const activePets = pets.filter(pet => pet.petStatus === 1).length;
    const inactivePets = pets.filter(pet => pet.petStatus === 0).length;

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
    };    // View pet details
    const handleView = (pet) => {
        setSelectedPet(pet);
    };

    // Handle Edit from detail modal
    const handleEdit = (pet) => {
        setEditForm({
            petType: pet.petType || '',
            petDefaultName: pet.petDefaultName || '',
            description: pet.description || '',
            petStatus: pet.petStatus || 1
        });
        setEditModal({ isOpen: true, pet: pet });
    };

    // Submit edit from detail modal
    const handleEditSubmit = async () => {
        try {
            const updatedData = {
                ...editForm,
                petId: editModal.pet.petId
            };
            await updatePet(editModal.pet.petId, updatedData);
            setEditModal({ isOpen: false, pet: null });
            setSelectedPet(null); // Close detail modal too
            alert('Cập nhật thú cưng thành công!');
        } catch (error) {
            console.error('Failed to update pet:', error);
            alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Cancel edit
    const handleEditCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        });
    };

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
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

    // Handle disable (instead of delete)
    const handleDelete = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 0) {
            alert('Thú cưng này đã bị vô hiệu hóa rồi!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn vô hiệu hóa thú cưng này?')) {
            try {
                // Update pet status to 0 (disabled) instead of deleting
                await updatePet(petId, { ...pet, petStatus: 0 });
                alert('Vô hiệu hóa thú cưng thành công!');
            } catch (error) {
                console.error('Failed to disable pet:', error);
                alert('Vô hiệu hóa thất bại: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    // Handle enable pet
    const handleEnable = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 1) {
            alert('Thú cưng này đã được kích hoạt rồi!');
            return;
        }

        if (window.confirm('Bạn có chắc muốn kích hoạt lại thú cưng này?')) {
            try {
                // Update pet status to 1 (active)
                await updatePet(petId, { ...pet, petStatus: 1 });
                alert('Kích hoạt thú cưng thành công!');
            } catch (error) {
                console.error('Failed to enable pet:', error);
                alert('Kích hoạt thất bại: ' + (error.message || 'Lỗi không xác định'));
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
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🐾</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thú Cưng</h1>
                        <p className="text-gray-600">Quản lý các loài thú cưng trong hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <PawPrint className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng số thú cưng</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold">✓</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">{activePets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 font-bold">✕</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                            <p className="text-2xl font-bold text-red-600">{inactivePets}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}            {/* Pet Details Modal */}
            {selectedPet && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Chi tiết Thú cưng</h3>
                            <button
                                onClick={() => setSelectedPet(null)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Column 1: Basic Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">ID</label>
                                        <p className="text-sm text-gray-900 font-mono">#{selectedPet.petId}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Tên thú cưng</label>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedPet.petDefaultName || 'N/A'}</p>
                                    </div>                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Loại thú cưng</label>
                                        <p className="text-sm text-gray-900">{selectedPet.petType || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Column 2: Status & Description */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Trạng thái & Mô tả</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Trạng thái</label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedPet.petStatus)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Mô tả</label>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                            {selectedPet.description || 'Không có mô tả'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => handleEdit(selectedPet)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Cập nhật
                            </button>
                            <button
                                onClick={() => setSelectedPet(null)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Controls */}
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm thú cưng
                        </button>
                    </div>

                    {/* Bottom row: Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={typeFilter}
                                onChange={(e) => handleTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tất cả loại</option>
                                <option value="Cat">Mèo</option>
                                <option value="Dog">Chó</option>
                                <option value="Bird">Chim</option>
                                <option value="Fish">Cá</option>
                                <option value="Other">Khác</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="1">Hoạt động</option>
                                <option value="0">Vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pet Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                            onClick={() => handleSort('petDefaultName')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Tên</span>
                                {sortConfig.key === 'petDefaultName' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                            onClick={() => handleSort('petType')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Loại</span>
                                {sortConfig.key === 'petType' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Mô tả
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                            onClick={() => handleSort('petStatus')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Trạng thái</span>
                                {sortConfig.key === 'petStatus' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
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
                    <tr>                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        <p>Không có thú cưng nào</p>
                    </td>
                    </tr>
                ) : (
                    currentPets.map((pet) => (
                        <tr key={pet.petId} className="hover:bg-gray-50">                                <td className="px-6 py-4">
                            <div className="flex items-center">
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
                            </td>                                <td className="px-6 py-4 text-right text-sm">                                    <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleView(pet)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Xem chi tiết"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                {pet.petStatus === 1 ? (
                                    <button
                                        onClick={() => handleDelete(pet.petId)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Vô hiệu hóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEnable(pet.petId)}
                                        className="text-green-600 hover:text-green-800 p-1"
                                        title="Kích hoạt"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
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

            {/* Edit Pet Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Chỉnh sửa thú cưng: {editModal.pet?.petDefaultName}
                        </h3>

                        <div className="space-y-4 mb-6">
                            {/* Pet Type */}
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

                            {/* Pet Name */}
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

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mô tả"
                                    rows="3"
                                />
                            </div>

                            {/* Status */}
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
                                onClick={handleEditCancel}
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
        </div>
    );
};

export default PetManagement;
