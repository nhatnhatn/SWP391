import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Eye, Filter, ChevronLeft, ChevronRight, PawPrint, RotateCcw, ChevronUp, ChevronDown, X, Save, Edit } from 'lucide-react';
import { useSimplePets } from '../../hooks/useSimplePets';
import { useAuth } from '../../contexts/AuthContextV2';

// Simple Pet Management Component
const PetManagement = () => {
    // Use auth hook to get current user
    const { user } = useAuth();

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
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });    // Edit state for detail modal
    const [editModal, setEditModal] = useState({ isOpen: false, pet: null });
    const [editForm, setEditForm] = useState({
        petType: '',
        petDefaultName: '',
        description: '',
        petStatus: 1,
        customPetType: ''
    });

    // State for custom pet type
    const [showCustomPetType, setShowCustomPetType] = useState(false);// Pagination state
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
    };    // Handle Edit from detail modal
    const handleEdit = (pet) => {
        const isOtherType = pet.petType && !['Cat', 'Dog', 'Bird', 'Fish', 'Chicken'].includes(pet.petType);
        setEditForm({
            petType: isOtherType ? 'Other' : (pet.petType || ''),
            petDefaultName: pet.petDefaultName || '',
            description: pet.description || '',
            petStatus: pet.petStatus || 1,
            customPetType: isOtherType ? pet.petType : ''
        });
        setShowCustomPetType(isOtherType);
        setEditModal({ isOpen: true, pet: pet });
    };    // Submit edit from detail modal
    const handleEditSubmit = async () => {
        try {
            const finalPetType = editForm.petType === 'Other' && editForm.customPetType
                ? editForm.customPetType
                : editForm.petType;

            const updatedData = {
                ...editForm,
                petType: finalPetType,
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
    };    // Cancel edit
    const handleEditCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1,
            customPetType: ''
        });
        setShowCustomPetType(false);
    };

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };    // Open create modal
    const handleCreate = () => {
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1,
            customPetType: ''
        });
        setShowCustomPetType(false);
        setCreateModal(true);
    };

    // Submit create
    const handleCreateSubmit = async () => {
        try {
            const finalPetType = editForm.petType === 'Other' && editForm.customPetType
                ? editForm.customPetType
                : editForm.petType;

            const createData = {
                ...editForm,
                petType: finalPetType,
                adminId: user?.id // Thêm adminId từ user hiện tại
            };

            console.log('🐾 Creating pet with admin ID:', { adminId: user?.id, createData });
            await createPet(createData);
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
    };    // Cancel forms
    const handleCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        setCreateModal(false);
        setEditForm({
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1,
            customPetType: ''
        }); setShowCustomPetType(false);
    };

    // Handle pet type change
    const handlePetTypeChange = (value) => {
        setEditForm({ ...editForm, petType: value, customPetType: '' });
        setShowCustomPetType(value === 'Other');
    };

    // Get status badge
    const getStatusBadge = (status) => {
        return status === 1 ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Hoạt động
            </span>
        ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">                Vô hiệu hóa
            </span>
        );
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                            <PawPrint className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý Thú Cưng</h1>
                            <p className="text-gray-600 mt-1">Quản lý danh sách thú cưng trong hệ thống một cách hiệu quả</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 text-gray-500">
                        <div className="text-center">
                            <p className="text-sm font-medium">Tổng thú cưng</p>
                            <p className="text-2xl font-bold text-blue-600">{totalPets}</p>
                        </div>
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
                    <div className="flex items-center">                        <div className="p-2 bg-blue-100 rounded-lg">
                        <PawPrint className="h-6 w-6 text-blue-600" />
                    </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng Thú cưng</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-green-600 font-bold text-lg">✓</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang Hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900">{activePets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-red-600 font-bold text-lg">✕</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Không Hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900">{inactivePets}</p>
                        </div>
                    </div>
                </div>
            </div>{/* Pet Details Modal */}
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
            )}            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
                                <p className="text-blue-100 text-sm">Tìm kiếm và lọc danh sách thú cưng một cách thông minh</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-white/80 text-sm">
                            <PawPrint className="h-4 w-4" />
                            <span>Quản lý hiệu quả</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Search Section */}                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700"> Tìm kiếm & Tạo mới</span>
                        </div>

                        <div className="space-y-4">
                            {/* Search Input Row */}
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Tìm kiếm thú cưng
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        <input
                                            type="text"
                                            placeholder="Nhập tên thú cưng để tìm kiếm..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => handleSearch({ target: { value: '' } })}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                                title="Xóa tìm kiếm"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Thao tác
                                    </label>
                                    <button
                                        onClick={handleCreate}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3.5 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg whitespace-nowrap transform hover:scale-105"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Thêm thú cưng
                                    </button>
                                </div>
                            </div>

                            {/* Search Results Info */}
                            {searchTerm && (<div className="bg-blue-100 rounded-md p-3 border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                                    <p className="text-sm text-blue-800 font-medium">
                                        Đang hiển thị kết quả tìm kiếm cho: "<span className="font-semibold text-blue-900">{searchTerm}</span>"
                                    </p>
                                    <button
                                        onClick={() => handleSearch({ target: { value: '' } })}
                                        className="ml-auto text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                    >
                                        Xóa tìm kiếm
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>

                    {/* Filters Section */}
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
                                {/* Active Filters Count */}
                                {(typeFilter || statusFilter !== '' || sortConfig.key) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                        {[typeFilter, statusFilter !== '' ? statusFilter : null, sortConfig.key].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Collapsible Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Sort Controls Group */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Sắp xếp dữ liệu</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Sort Field Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sắp xếp theo
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={sortConfig.key || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            setSortConfig({ key: e.target.value, direction: sortConfig.direction || 'asc' });
                                                        } else {
                                                            setSortConfig({ key: null, direction: 'asc' });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> Không sắp xếp</option>
                                                    <option value="petDefaultName"> Tên thú cưng</option>
                                                    <option value="petType"> Loại thú cưng</option>
                                                    <option value="petStatus"> Trạng thái</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Thứ tự
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={sortConfig.direction}
                                                    onChange={(e) => {
                                                        if (sortConfig.key) {
                                                            setSortConfig({ ...sortConfig, direction: e.target.value });
                                                        }
                                                    }}
                                                    disabled={!sortConfig.key}
                                                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none ${!sortConfig.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value="asc"> Tăng dần (A-Z, 1-9)</option>
                                                    <option value="desc"> Giảm dần (Z-A, 9-1)</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Sort Status */}
                                    {sortConfig.key && (
                                        <div className="mt-3 p-2 bg-blue-100 rounded-md">
                                            <p className="text-xs text-blue-700 font-medium">
                                                Đang sắp xếp theo {
                                                    sortConfig.key === 'petDefaultName' ? 'Tên thú cưng' :
                                                        sortConfig.key === 'petType' ? 'Loại thú cưng' :
                                                            sortConfig.key === 'petStatus' ? 'Trạng thái' : sortConfig.key
                                                } - {sortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Content Filters Group */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Lọc nội dung</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Type Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Loại thú cưng
                                            </label>
                                            <div className="relative">                                                <select
                                                value={typeFilter}
                                                onChange={(e) => handleTypeFilter(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                            >
                                                <option value=""> Tất cả loại</option>
                                                <option value="Cat"> Mèo</option>
                                                <option value="Dog"> Chó</option>
                                                <option value="Bird"> Chim</option>
                                                <option value="Fish"> Cá</option>
                                                <option value="Chicken"> Gà</option>
                                                <option value="Other"> Khác</option>
                                            </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {typeFilter && (
                                                <div className="mt-2 p-2 bg-green-100 rounded-md">                                                    <p className="text-xs text-green-700 font-medium">
                                                    Lọc theo: {
                                                        typeFilter === 'Cat' ? 'Mèo' :
                                                            typeFilter === 'Dog' ? 'Chó' :
                                                                typeFilter === 'Bird' ? 'Chim' :
                                                                    typeFilter === 'Fish' ? 'Cá' :
                                                                        typeFilter === 'Chicken' ? 'Gà' :
                                                                            'Khác'
                                                    }
                                                </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Filter */}                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Trạng thái
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> Tất cả trạng thái</option>
                                                    <option value="1"> Đang hoạt động</option>
                                                    <option value="0"> Không hoạt động</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {statusFilter !== '' && (
                                                <div className="mt-2 p-2 bg-green-100 rounded-md">
                                                    <p className="text-xs text-green-700 font-medium">
                                                        Lọc theo: {statusFilter === '1' ? 'Đang hoạt động' : 'Không hoạt động'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>                                {/* Reset Actions Group */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Thao tác</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                handleSearch({ target: { value: '' } });
                                                handleTypeFilter('');
                                                handleStatusFilter('');
                                                setSortConfig({ key: null, direction: 'asc' });
                                            }}
                                            disabled={!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key}
                                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key
                                                ? 'Không có bộ lọc nào'
                                                : 'Xóa tất cả bộ lọc'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(searchTerm || typeFilter || statusFilter !== '' || sortConfig.key) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    searchTerm && 'Tìm kiếm',
                                                    typeFilter && 'Loại',
                                                    statusFilter !== '' && 'Trạng thái',
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
            </div>            {/* Pet Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">                        <thead className="bg-gradient-to-r from-cyan-700 to-blue-600 border-b-4 border-blue-800 shadow-lg">
                        <tr>
                            <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-blue-500 border-opacity-30">
                                <span className="flex items-center justify-center gap-2">
                                    Tên thú cưng
                                </span>
                            </th>
                            <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-blue-500 border-opacity-30">
                                <span className="flex items-center justify-center gap-2">
                                    Loại thú cưng
                                </span>
                            </th>
                            <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-blue-500 border-opacity-30">
                                <span className="flex items-center justify-center gap-2">
                                    Mô tả
                                </span>
                            </th>
                            <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-blue-500 border-opacity-30">
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
                            {loading ? (<tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                        <div className="text-center">
                                            <p className="text-lg font-medium text-gray-900">Đang tải dữ liệu...</p>
                                            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            ) : currentPets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <PawPrint className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-medium text-gray-900">Không có thú cưng nào</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {searchTerm || typeFilter || statusFilter !== '' ?
                                                        'Không tìm thấy thú cưng phù hợp với bộ lọc.' :
                                                        'Hãy bắt đầu bằng cách thêm thú cưng mới.'
                                                    }
                                                </p>
                                                {!searchTerm && !typeFilter && statusFilter === '' && (<button
                                                    onClick={handleCreate}
                                                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Thêm thú cưng
                                                </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>) : (currentPets.map((pet) => (
                                    <tr key={pet.petId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200">
                                        {/* Name Column */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <p className="text-sm font-bold text-gray-900">
                                                {pet.petDefaultName || 'Chưa đặt tên'}
                                            </p>
                                        </td>{/* Pet Type Column */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center">
                                                {pet.petType === 'Cat' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200 shadow-sm">
                                                        Cat
                                                    </span>
                                                )}
                                                {pet.petType === 'Dog' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm">
                                                        Dog
                                                    </span>
                                                )}
                                                {pet.petType === 'Bird' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border border-sky-200 shadow-sm">
                                                        Bird
                                                    </span>
                                                )}
                                                {pet.petType === 'Fish' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200 shadow-sm">
                                                        Fish
                                                    </span>
                                                )}
                                                {pet.petType === 'Chicken' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200 shadow-sm">
                                                        Chicken
                                                    </span>
                                                )}
                                                {pet.petType && !['Cat', 'Dog', 'Bird', 'Fish', 'Chicken'].includes(pet.petType) && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        {pet.petType}
                                                    </span>
                                                )}
                                                {!pet.petType && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm">
                                                        N/A
                                                    </span>
                                                )}
                                            </div>
                                        </td>{/* Description Column */}
                                        <td className="px-6 py-6">
                                            <div className="max-w-xs">
                                                <p className="text-sm text-gray-900 line-clamp-2">
                                                    {pet.description || 'Không có mô tả'}
                                                </p>
                                            </div>
                                        </td>                                        {/* Status Column */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center">
                                                {pet.petStatus === 1 ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                                                        Không hoạt động
                                                    </span>
                                                )}
                                            </div>
                                        </td>{/* Actions Column */}
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                {/* Detail View Button */}
                                                <button
                                                    onClick={() => handleView(pet)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEdit(pet)}
                                                    className="text-amber-600 hover:text-amber-900 hover:bg-amber-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* Delete/Enable Toggle Button */}
                                                {pet.petStatus === 1 ? (
                                                    <button
                                                        onClick={() => handleDelete(pet.petId)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Vô hiệu hóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnable(pet.petId)}
                                                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
                </div>
            </div>        {/* Pagination - Separated from table */}
            {totalPages > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-t border-blue-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </button>

                            <div className="hidden md:flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${currentPage === pageNum
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform hover:scale-105'
                                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="md:hidden text-sm text-blue-700 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-300 font-medium">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={goToNextPage}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                                disabled={currentPage === totalPages}
                            >
                                Tiếp
                                <ChevronRight className="h-4 w-4" />
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
                            {/* Pet Type */}                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại thú cưng
                                </label>                                <select
                                    value={editForm.petType}
                                    onChange={(e) => handlePetTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn loại thú cưng</option>
                                    <option value="Cat">Mèo</option>
                                    <option value="Dog">Chó</option>
                                    <option value="Bird">Chim</option>
                                    <option value="Fish">Cá</option>
                                    <option value="Chicken">Gà</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            {/* Custom Pet Type Input - only show when "Other" is selected */}
                            {showCustomPetType && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên loài tùy chỉnh
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.customPetType}
                                        onChange={(e) => setEditForm({ ...editForm, customPetType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên loài thú cưng..."
                                    />
                                </div>
                            )}

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
                                </label>                                <select
                                    value={editForm.petType}
                                    onChange={(e) => handlePetTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >                                    <option value="">Chọn loại thú cưng</option>
                                    <option value="Cat">Mèo</option>
                                    <option value="Dog">Chó</option>
                                    <option value="Bird">Chim</option>
                                    <option value="Fish">Cá</option>
                                    <option value="Chicken">Gà</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            {/* Custom Pet Type Input - only show when "Other" is selected */}
                            {showCustomPetType && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên loài tùy chỉnh
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.customPetType}
                                        onChange={(e) => setEditForm({ ...editForm, customPetType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên loài thú cưng..."
                                    />
                                </div>
                            )}

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
                            </button>                            <button
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
