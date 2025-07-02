import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Power, Eye, Filter, ChevronLeft, ChevronRight, PawPrint, RotateCcw, ChevronUp, ChevronDown, X, Save, Edit } from 'lucide-react';
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
    } = useSimplePets();

    // State to store all unique pet types (for dropdown options)
    const [allPetTypes, setAllPetTypes] = useState([]);
    const [persistentPetTypes, setPersistentPetTypes] = useState([]);

    // Local error and success message states
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // Fetch all unique pet types when pets data changes
    useEffect(() => {
        if (pets && pets.length > 0) {
            const uniqueTypes = [...new Set(pets.map(pet => pet.petType).filter(type => type))];
            setAllPetTypes(uniqueTypes);

            // Only update persistent types if it's empty (initial load) or if new types are found
            if (persistentPetTypes.length === 0) {
                setPersistentPetTypes(uniqueTypes);
            } else {
                // Add any new types that aren't already in the persistent list
                const newTypes = uniqueTypes.filter(type => !persistentPetTypes.includes(type));
                if (newTypes.length > 0) {
                    setPersistentPetTypes(prev => [...prev, ...newTypes]);
                }
            }
        }
    }, [pets, persistentPetTypes]);    // Local UI state
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
        petStatus: 1
    });

    // Pagination state
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
        setEditForm({
            petType: pet.petType || '',
            petDefaultName: pet.petDefaultName || '',
            description: pet.description || '',
            petStatus: pet.petStatus || 1
        });
        setEditModal({ isOpen: true, pet: pet });
    };    // Submit edit from detail modal
    const handleEditSubmit = async () => {
        try {
            // Basic validation
            if (!editForm.petType || editForm.petType.trim().length < 2) {
                setLocalError('Vui lòng nhập loại thú cưng với ít nhất 2 ký tự');
                return;
            }

            // Check if first letter is capitalized
            const petType = editForm.petType.trim();
            if (petType[0] !== petType[0].toUpperCase()) {
                setLocalError('Chữ cái đầu của loại thú cưng phải viết hoa');
                return;
            }

            const updatedData = {
                ...editForm,
                petType: petType,
                petId: editModal.pet.petId
            };
            await updatePet(editModal.pet.petId, updatedData);
            setEditModal({ isOpen: false, pet: null });
            setSelectedPet(null); // Close detail modal too
            // Clear any previous errors and show success message
            setLocalError('');
            setSuccessMessage('Cập nhật thú cưng thành công!');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Failed to update pet:', error);
            setLocalError('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
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

    // Get sort icon
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-4 h-4 inline ml-1" /> :
            <ChevronDown className="w-4 h-4 inline ml-1" />;
    };    // Open create modal
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
            // Basic validation
            if (!editForm.petType || editForm.petType.trim().length < 2) {
                setLocalError('Vui lòng nhập loại thú cưng với ít nhất 2 ký tự');
                return;
            }

            // Check if first letter is capitalized
            const petType = editForm.petType.trim();
            if (petType[0] !== petType[0].toUpperCase()) {
                setLocalError('Chữ cái đầu của loại thú cưng phải viết hoa');
                return;
            }

            const createData = {
                ...editForm,
                petType: petType,
                adminId: user?.id // Thêm adminId từ user hiện tại
            };

            console.log('🐾 Creating pet with admin ID:', { adminId: user?.id, createData });
            await createPet(createData);
            setCreateModal(false);
            // Clear any previous errors and show success message
            setLocalError('');
            setSuccessMessage('Tạo thú cưng thành công!');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Failed to create pet:', error);
            setLocalError('Tạo thú cưng thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Handle disable (instead of delete)
    const handleDelete = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 0) {
            setLocalError('Thú cưng này đã bị vô hiệu hóa rồi!');
            setTimeout(() => setLocalError(''), 5000);
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận vô hiệu hóa',
            message: 'Bạn có chắc muốn vô hiệu hóa thú cưng này?',
            onConfirm: async () => {
                try {
                    // Update pet status to 0 (disabled) instead of deleting
                    await updatePet(petId, { ...pet, petStatus: 0 });
                    // Clear any previous errors and show success message
                    setLocalError('');
                    setSuccessMessage('Vô hiệu hóa thú cưng thành công!');
                    setTimeout(() => setSuccessMessage(''), 5000);
                } catch (error) {
                    console.error('Failed to disable pet:', error);
                    setLocalError('Vô hiệu hóa thất bại: ' + (error.message || 'Lỗi không xác định'));
                    setTimeout(() => setLocalError(''), 5000);
                }
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    // Handle enable pet
    const handleEnable = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 1) {
            setLocalError('Thú cưng này đã được kích hoạt rồi!');
            setTimeout(() => setLocalError(''), 5000);
            return;
        }

        try {
            // Update pet status to 1 (active)
            await updatePet(petId, { ...pet, petStatus: 1 });
            // Clear any previous errors and show success message
            setLocalError('');
            setSuccessMessage('Kích hoạt thú cưng thành công!');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Failed to enable pet:', error);
            setLocalError('Kích hoạt thất bại: ' + (error.message || 'Lỗi không xác định'));
            setTimeout(() => setLocalError(''), 5000);
        }
    };    // Cancel forms
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

    // Handle pet type change with validation
    const handlePetTypeChange = (value) => {
        // Auto-capitalize first letter and format the input
        const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        setEditForm({ ...editForm, petType: formattedValue });
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

    // Get pet type badge with dynamic styling
    const getPetTypeBadge = (petType) => {
        if (!petType) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm">
                    N/A
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm">
                {petType}
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
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý thú cưng</h1>
                        </div>
                    </div>

                    {/* Desktop Statistics */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <PawPrint className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Tổng thú cưng</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{totalPets}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{activePets}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold text-sm">✕</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{inactivePets}</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Statistics */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <PawPrint className="h-4 w-4 text-blue-600" />
                                <p className="text-xs font-medium text-gray-600">Tổng thú cưng</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">{totalPets}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">{activePets}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">{inactivePets}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Thành công</h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>{successMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
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

            {/* Pet Details Modal */}
            {selectedPet && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <h3 className="text-4xl font-bold text-white">Chi tiết thú cưng</h3>
                            </div>

                        </div>

                        {/* Content with Enhanced Design */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 to-white">
                            {/* Pet Name & Type Header Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        {/* Right Side: The label */}
                                        <div>
                                            <h1 className="text-3xl font-bold text-cyan-600">
                                                Tên thú cưng
                                            </h1>
                                        </div>
                                        {/* Left Side: The pet's name */}
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-800">
                                                {selectedPet.petDefaultName || 'Chưa đặt tên'}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Information Cards Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Info Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <h4 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h4>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">ID thú cưng</span>
                                                    <span className="text-sm font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        #{selectedPet.petId}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Loại thú cưng</span>
                                                    <div>
                                                        {selectedPet.petType ? getPetTypeBadge(selectedPet.petType) : (
                                                            <span className="text-sm text-gray-500 italic">Chưa xác định</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {   /**     <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                           <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">ID quản trị viên</span>
                                                    <span className="text-sm font-mono font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                        {selectedPet.adminId ? `#${selectedPet.adminId}` : (
                                                            <span className="text-sm text-gray-500 italic">Chưa xác định</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>*/ } 
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Description Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <h4 className="text-lg font-semibold text-gray-800">Trạng thái và mô tả thú cưng</h4>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <span className="text-sm font-medium text-gray-600 block mb-2">Trạng thái hoạt động</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedPet.petStatus === 1 ? (
                                                        <>
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-semibold text-green-700">Đang hoạt động</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                            <span className="text-sm font-semibold text-red-700">Không hoạt động</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <span className="text-sm font-medium text-gray-600 block mb-3">Mô tả thú cưng</span>
                                                {selectedPet.description ? (
                                                    <div className="space-y-2">
                                                        <div className={`text-sm text-gray-700 leading-relaxed break-words ${selectedPet.description.length > 150 && !selectedPet.expanded
                                                            ? 'line-clamp-3'
                                                            : ''
                                                            }`}>
                                                            {selectedPet.description}
                                                        </div>
                                                        {selectedPet.description.length > 150 && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPet(prev => ({
                                                                        ...prev,
                                                                        expanded: !prev.expanded
                                                                    }));
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors duration-200 flex items-center gap-1"
                                                            >
                                                                {selectedPet.expanded ? (
                                                                    <>
                                                                        <ChevronUp className="h-3 w-3" />
                                                                        Ẩn bớt
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-3 w-3" />
                                                                        Xem thêm
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-gray-400 mb-2">
                                                            <Eye className="h-8 w-8 mx-auto opacity-50" />
                                                        </div>
                                                        <span className="text-sm text-gray-400 italic">
                                                            Chưa có mô tả cho thú cưng này
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedPet(null)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Đóng
                                    </button>
                                    <button
                                        onClick={() => handleEdit(selectedPet)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Search Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
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


                                <button
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3.5 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg whitespace-nowrap transform hover:scale-105"
                                >
                                    <Plus className="h-5 w-5" />
                                    Thêm thú cưng
                                </button>
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
                                {/* Content Filters Group */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
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
                                            <div className="relative">
                                                <select
                                                    value={typeFilter}
                                                    onChange={(e) => handleTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="">Chọn loại thú cưng</option>
                                                    {/* Use persistent pet types that don't change when filters are applied */}
                                                    {persistentPetTypes.map(petType => (
                                                        <option key={petType} value={petType}>
                                                            {petType}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {typeFilter && (
                                                <div className="mt-2 p-2 bg-green-100 rounded-md">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-green-700 font-medium">
                                                            Đang lọc: {
                                                                typeFilter
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-2">
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
                                </div>

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
                                                            {sortConfig.key === 'petDefaultName' && 'Tên thú cưng'}
                                                            {sortConfig.key === 'petType' && 'Loại thú cưng'}
                                                            {sortConfig.key === 'petStatus' && 'Trạng thái'}
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



                                {/* Reset Actions Group */}
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
            </div>

            {/* Pet Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-blue-600 to-cyan-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">DANH SÁCH THÚ CƯNG TRONG GAME</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[18%]" />
                                <col className="w-[18%]" />
                                <col className="w-[40%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-blue-600 to-cyan-600 border-b-4 border-blue-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Tên thú cưng
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Loại thú cưng
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Mô tả thú cưng
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Trạng thái
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        <span className="flex items-center justify-center gap-2">
                                            Thao tác
                                        </span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {currentPets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">

                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">Không có thú cưng nào</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {searchTerm || typeFilter || statusFilter !== '' ?
                                                            'Không tìm thấy thú cưng phù hợp với bộ lọc.' :
                                                            'Hãy bắt đầu bằng cách thêm thú cưng mới.'
                                                        }
                                                    </p>
                                                    {!searchTerm && !typeFilter && statusFilter === '' && (
                                                        <button
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
                                    </tr>
                                ) : (
                                    currentPets.map((pet) => (
                                        <tr key={pet.petId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200">
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    <div className="text-sm font-bold text-gray-900 break-words" title={pet.petDefaultName}>
                                                        {pet.petDefaultName || 'Chưa đặt tên'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    {getPetTypeBadge(pet.petType)}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-900 break-words max-w-xs mx-auto" title={pet.description}>
                                                        {pet.description || 'Không có mô tả'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    {pet.petStatus === 1 ? (
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

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleView(pet)}
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {pet.petStatus === 1 ? (
                                                        <button
                                                            onClick={() => handleDelete(pet.petId)}
                                                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                            title="Vô hiệu hóa"
                                                        >
                                                            <Power className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEnable(pet.petId)}
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
            </div>            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-t border-blue-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
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
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md transform scale-105'
                                            : 'bg-white text-blue-700 border border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-800 shadow-sm'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <span className="hidden sm:inline">Tiếp</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Pet Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <h3 className="text-4xl font-bold text-white">Chỉnh sửa thú cưng</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-br from-gray-50 to-white">
                            {/* Header Summary */}
                            <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        {/* Right Side: The label */}
                                        <div>
                                            <h1 className="text-3xl font-bold text-cyan-600">
                                                Tên thú cưng
                                            </h1>
                                        </div>
                                        {/* Left Side: The pet's name */}
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-800">
                                                {selectedPet.petDefaultName || 'Chưa đặt tên'}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Grid Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Pet Name Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Chỉnh sửa tên thú cưng
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.petDefaultName}
                                            onChange={(e) => setEditForm({ ...editForm, petDefaultName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                                            placeholder="Nhập tên thú cưng"
                                            minLength="2"
                                        />
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Chữ cái đầu sẽ tự động viết hoa. Tối thiểu 2 ký tự.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pet Type Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Chỉnh sửa loại thú cưng 
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.petType || ''}
                                            onChange={(e) => handlePetTypeChange(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                                            placeholder="Nhập loại thú cưng"
                                            required
                                            minLength="2"
                                        />
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Chữ cái đầu sẽ tự động viết hoa. Tối thiểu 2 ký tự.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Description Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Chỉnh sửa mô tả thú cưng
                                            </label>
                                        </div>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none"
                                            placeholder="Nhập mô tả chi tiết về thú cưng..."
                                            rows="3"
                                        />
                                    </div>

                                    {/* Status Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Chỉnh sửa trạng thái thú cưng
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.petStatus}
                                                onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                            >
                                                <option value={1}> Active</option>
                                                <option value={0}> Inactive</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        </div>
                                        <div className={`mt-2 p-3 rounded-lg border ${editForm.petStatus === 1
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                            }`}>
                                            <p className={`text-sm flex items-center gap-2 ${editForm.petStatus === 1
                                                ? 'text-green-700'
                                                : 'text-red-700'
                                                }`}>
                                                {editForm.petStatus === 1 ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        Thú cưng sẽ hiển thị và có thể sử dụng trong game
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                        Thú cưng sẽ bị ẩn và không thể sử dụng trong game
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleEditCancel}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Cập nhật
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Pet Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-bold text-white">Tạo thú cưng mới</h3>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-br from-gray-50 to-white">
                            <div className="space-y-6">
                                {/* Pet Name */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Tên thú cưng
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.petDefaultName}
                                        onChange={(e) => setEditForm({ ...editForm, petDefaultName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                                        placeholder="Nhập tên thú cưng..."
                                        minLength="2"
                                    />
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Chữ cái đầu sẽ tự động viết hoa. Tối thiểu 2 ký tự.
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Type */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Loại thú cưng 
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.petType || ''}
                                        onChange={(e) => handlePetTypeChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                                        placeholder="Nhập loại thú cưng (VD: Dog, Cat, Bird...)"
                                        required
                                        minLength="2"
                                    />
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Trường bắt buộc. Chữ cái đầu sẽ tự động viết hoa. Tối thiểu 2 ký tự.
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Description */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Mô tả thú cưng
                                        </label>
                                    </div>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none"
                                        placeholder="Nhập mô tả chi tiết về thú cưng..."
                                        rows="3"
                                    />
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 flex items-center justify-end gap-2">
                                            <span>{editForm.description?.length || 0} ký tự</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Status */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Trạng thái thú cưng
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={editForm.petStatus}
                                            onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value={1}> Active</option>
                                            <option value={0}> Inactive</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    <div className={`mt-2 p-3 rounded-lg border ${editForm.petStatus === 1
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        <p className={`text-sm flex items-center gap-2 ${editForm.petStatus === 1
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                            }`}>
                                            {editForm.petStatus === 1 ? (
                                                <>
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    Thú cưng sẽ hiển thị và có thể sử dụng trong game
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Thú cưng sẽ bị ẩn và không thể sử dụng trong game
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleCreateSubmit}
                                        disabled={!editForm.petType || editForm.petType.length < 2}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tạo thú cưng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <X className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{confirmDialog.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetManagement;
