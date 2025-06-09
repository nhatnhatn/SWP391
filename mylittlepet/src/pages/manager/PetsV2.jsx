import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw, Play, Utensils, Moon, Shield } from 'lucide-react';
import { usePets } from '../../hooks/useData';
import { RARITY_TYPES, PET_TYPES, RARITY_COLORS, RARITY_TRANSLATIONS, PET_TYPE_TRANSLATIONS } from '../../services/dataService';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';

export default function PetsV2() {
    // Use the custom hook for pets data
    const {
        pets,
        loading,
        error,
        pagination,
        fetchPets,
        searchPets,
        createPet,
        updatePet,
        deletePet,
        feedPet,
        playWithPet,
        restPet,
        healPet,
        refresh
    } = usePets(0, 6);

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [expandedPets, setExpandedPets] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                searchPets(searchTerm, typeFilter !== 'all' ? typeFilter : null, rarityFilter !== 'all' ? rarityFilter : null, 0, 6)
                    .finally(() => setIsSearching(false));
            } else {
                fetchPets(0, 6);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, typeFilter, rarityFilter]);

    // Filter pets by type and rarity (client-side after API call)
    const filteredPets = pets.filter(pet => {
        const matchesRarity = rarityFilter === 'all' || pet.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || pet.type === typeFilter;
        return matchesRarity && matchesType;
    });

    const handleDeletePet = async (petId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thú cưng này?')) {
            try {
                await deletePet(petId);
            } catch (error) {
                console.error('Failed to delete pet:', error);
                alert('Lỗi khi xóa thú cưng');
            }
        }
    };

    const openModal = (pet = null) => {
        setSelectedPet(pet);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPet(null);
    };

    const toggleExpanded = (petId) => {
        setExpandedPets(prev => ({
            ...prev,
            [petId]: !prev[petId]
        }));
    };

    // Pet care action handlers
    const handlePetAction = async (action, petId) => {
        setActionLoading(prev => ({ ...prev, [`${action}_${petId}`]: true }));

        try {
            let result;
            switch (action) {
                case 'feed':
                    result = await feedPet(petId);
                    break;
                case 'play':
                    result = await playWithPet(petId);
                    break;
                case 'rest':
                    result = await restPet(petId);
                    break;
                case 'heal':
                    result = await healPet(petId);
                    break;
                default:
                    throw new Error('Unknown action');
            }

            // Show success message
            alert(result.message || 'Hành động thành công!');
        } catch (error) {
            console.error(`Failed to ${action} pet:`, error);
            alert(error.message || `Lỗi khi ${action === 'feed' ? 'cho ăn' : action === 'play' ? 'chơi với' : action === 'rest' ? 'cho nghỉ' : 'chữa trị'} thú cưng`);
        } finally {
            setActionLoading(prev => ({ ...prev, [`${action}_${petId}`]: false }));
        }
    };

    const goToPage = (page) => {
        fetchPets(page - 1, 6);
        setExpandedPets({});
    };

    const goToPreviousPage = () => {
        if (pagination.page > 0) {
            fetchPets(pagination.page - 1, 6);
            setExpandedPets({});
        }
    };

    const goToNextPage = () => {
        if (pagination.page < pagination.totalPages - 1) {
            fetchPets(pagination.page + 1, 6);
            setExpandedPets({});
        }
    };

    // Get health status color
    const getHealthColor = (currentHp, maxHp) => {
        const ratio = currentHp / maxHp;
        if (ratio > 0.7) return 'text-green-600';
        if (ratio > 0.3) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Get happiness/hunger/energy color
    const getStatColor = (value) => {
        if (value > 70) return 'text-green-600';
        if (value > 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Handle loading state
    if (loading && pets.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                <span className="ml-4 text-lg text-gray-600">Đang tải dữ liệu thú cưng...</span>
            </div>
        );
    }

    // Handle error state
    if (error && pets.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">⚠️ {error}</div>
                <button
                    onClick={refresh}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🐾 Quản lý thú cưng</h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {pagination.totalElements} thú cưng
                        {searchTerm && ` • Kết quả tìm kiếm cho "${searchTerm}"`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm thú cưng
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc loại thú cưng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {(isSearching || loading) && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Tất cả loại</option>
                            {Object.keys(PET_TYPES).map(type => (
                                <option key={type} value={PET_TYPES[type]}>
                                    {PET_TYPE_TRANSLATIONS[PET_TYPES[type]] || PET_TYPES[type]}
                                </option>
                            ))}
                        </select>
                        <select
                            value={rarityFilter}
                            onChange={(e) => setRarityFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Tất cả độ hiếm</option>
                            {Object.keys(RARITY_TYPES).map(rarity => (
                                <option key={rarity} value={RARITY_TYPES[rarity]}>
                                    {RARITY_TRANSLATIONS[RARITY_TYPES[rarity]] || RARITY_TYPES[rarity]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Pet Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {PET_TYPE_TRANSLATIONS[pet.type] || pet.type} • Cấp {pet.level}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-xs text-gray-500">Chủ: {pet.ownerName || 'Không rõ'}</span>
                                    </div>
                                </div>
                                <span
                                    className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                    style={{ backgroundColor: RARITY_COLORS[pet.rarity] || '#gray' }}
                                >
                                    {RARITY_TRANSLATIONS[pet.rarity] || pet.rarity}
                                </span>
                            </div>
                        </div>

                        {/* Pet Stats */}
                        <div className="p-4">
                            {/* Health Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Máu</span>
                                    <span className={getHealthColor(pet.currentHp, pet.maxHp)}>
                                        {pet.currentHp}/{pet.maxHp}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(pet.currentHp / pet.maxHp) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Basic Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center">
                                    <div className="text-gray-500">ATK</div>
                                    <div className="font-medium">{pet.attack}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">DEF</div>
                                    <div className="font-medium">{pet.defense}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">SPD</div>
                                    <div className="font-medium">{pet.speed}</div>
                                </div>
                            </div>

                            {/* Care Stats */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Vui vẻ</span>
                                    <span className={getStatColor(pet.happiness)}>
                                        {pet.happiness || 50}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Đói</span>
                                    <span className={getStatColor(pet.hunger)}>
                                        {pet.hunger || 50}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Năng lượng</span>
                                    <span className={getStatColor(pet.energy)}>
                                        {pet.energy || 50}%
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                    onClick={() => handlePetAction('feed', pet.id)}
                                    disabled={actionLoading[`feed_${pet.id}`]}
                                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                                >
                                    <Utensils className="w-3 h-3" />
                                    {actionLoading[`feed_${pet.id}`] ? 'Đang...' : 'Cho ăn'}
                                </button>
                                <button
                                    onClick={() => handlePetAction('play', pet.id)}
                                    disabled={actionLoading[`play_${pet.id}`]}
                                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                                >
                                    <Play className="w-3 h-3" />
                                    {actionLoading[`play_${pet.id}`] ? 'Đang...' : 'Chơi'}
                                </button>
                                <button
                                    onClick={() => handlePetAction('rest', pet.id)}
                                    disabled={actionLoading[`rest_${pet.id}`]}
                                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                                >
                                    <Moon className="w-3 h-3" />
                                    {actionLoading[`rest_${pet.id}`] ? 'Đang...' : 'Nghỉ'}
                                </button>
                                <button
                                    onClick={() => handlePetAction('heal', pet.id)}
                                    disabled={actionLoading[`heal_${pet.id}`]}
                                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                >
                                    <Shield className="w-3 h-3" />
                                    {actionLoading[`heal_${pet.id}`] ? 'Đang...' : 'Chữa'}
                                </button>
                            </div>

                            {/* Expand/Collapse Button */}
                            <button
                                onClick={() => toggleExpanded(pet.id)}
                                className="w-full flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                {expandedPets[pet.id] ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Thu gọn
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Xem thêm
                                    </>
                                )}
                            </button>

                            {/* Expanded Content */}
                            {expandedPets[pet.id] && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                    {/* Description */}
                                    {pet.description && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">Mô tả</h4>
                                            <p className="text-xs text-gray-600">{pet.description}</p>
                                        </div>
                                    )}

                                    {/* Abilities */}
                                    {pet.abilities && pet.abilities.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">Kỹ năng</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {pet.abilities.map((ability, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                    >
                                                        {ability}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Kinh nghiệm</h4>
                                        <p className="text-xs text-gray-600">{formatNumber(pet.experience || 0)} EXP</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => openModal(pet)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeletePet(pet.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredPets.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy thú cưng</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có thú cưng nào trong hệ thống'}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm thú cưng đầu tiên
                        </button>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={goToPreviousPage}
                            disabled={pagination.page === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị{' '}
                                <span className="font-medium">{pagination.page * pagination.size + 1}</span> đến{' '}
                                <span className="font-medium">
                                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                                </span>{' '}
                                trong số <span className="font-medium">{pagination.totalElements}</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={pagination.page === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    const isActive = pagination.page === i;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={goToNextPage}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Add/Edit Pet - Basic structure */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedPet ? 'Sửa thú cưng' : 'Thêm thú cưng mới'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="text-center py-8">
                            <p className="text-gray-500">Form chỉnh sửa/thêm thú cưng sẽ được implement sau</p>
                            <button
                                onClick={closeModal}
                                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
