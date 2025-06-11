import React, { useState, useEffect } from 'react';
import { Search, Edit2, Ban, CheckCircle, X, User, Mail, Heart, Trophy, ChevronUp, ChevronDown, Package, Star, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { usePlayers } from '../../hooks/useData';
import { formatDate, formatTimeAgo, getStatusColor, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';
import { RARITY_COLORS, RARITY_TRANSLATIONS, PET_TYPE_TRANSLATIONS } from '../../services/dataService';

// Helper functions for item type display
const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'food': return '🍞';
        case 'toy': return '🧸';
        case 'medicine': return '💊';
        case 'accessory': return '💍';
        case 'consumable': return '🧪';
        case 'material': return '⚗️';
        default: return '📦';
    }
};

const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
        case 'food': return 'bg-yellow-100 text-yellow-800';
        case 'toy': return 'bg-pink-100 text-pink-800';
        case 'medicine': return 'bg-green-100 text-green-800';
        case 'accessory': return 'bg-purple-100 text-purple-800';
        case 'consumable': return 'bg-blue-100 text-blue-800';
        case 'material': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function Players() {
    // Use the custom hook for players data
    const {
        players,
        loading,
        error,
        pagination,
        fetchPlayers,
        searchPlayers,
        updatePlayer,
        deletePlayer,
        refresh
    } = usePlayers(0, 6); // Start with page 0, 6 items per page

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);
    const [accordionState, setAccordionState] = useState({
        pets: true,
        inventory: false,
        achievements: false
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isSearching, setIsSearching] = useState(false);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                searchPlayers(searchTerm, 0, 6).finally(() => setIsSearching(false));
            } else {
                fetchPlayers(0, 6);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchPlayers, searchPlayers]);

    // Filter players by status (client-side after API call)
    const filteredPlayers = players.filter(player => {
        const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
        return matchesStatus;
    });

    // Sort filtered players
    const sortedPlayers = [...filteredPlayers].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases
        if (sortConfig.key === 'registeredAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortConfig.key === 'username') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <div className="w-4 h-4" />;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    const handleBanToggle = async (playerId) => {
        const player = players.find(p => p.id === playerId);
        if (!player) return;

        try {
            const newStatus = player.status === 'Banned' ? 'Active' : 'Banned';
            await updatePlayer(playerId, { ...player, status: newStatus });
        } catch (error) {
            console.error('Failed to update player status:', error);
            alert('Lỗi cập nhật trạng thái người chơi');
        }
    };

    const viewPlayerDetails = (player) => {
        setSelectedPlayerDetails(player);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPlayerDetails(null);
        setAccordionState({ pets: true, inventory: false, achievements: false });
    };

    const toggleAccordion = (section) => {
        setAccordionState(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const goToPage = (page) => {
        fetchPlayers(page - 1, 6); // Convert to 0-based index
    };

    const goToPreviousPage = () => {
        if (pagination.page > 0) {
            fetchPlayers(pagination.page - 1, 6);
        }
    };

    const goToNextPage = () => {
        if (pagination.page < pagination.totalPages - 1) {
            fetchPlayers(pagination.page + 1, 6);
        }
    };

    // Handle loading state
    if (loading && players.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                <span className="ml-4 text-lg text-gray-600">Đang tải dữ liệu...</span>
            </div>
        );
    }

    // Handle error state
    if (error && players.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">🎮 {t.players.title}</h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {pagination.totalElements} người chơi
                        {searchTerm && ` • Kết quả tìm kiếm cho "${searchTerm}"`}
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc email..."
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
                    <div className="md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Active">Đang hoạt động</option>
                            <option value="Inactive">Không hoạt động</option>
                            <option value="Banned">Đã cấm</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Players Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    onClick={() => handleSort('username')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Người chơi</span>
                                        {getSortIcon('username')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('level')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Cấp độ</span>
                                        {getSortIcon('level')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thống kê
                                </th>
                                <th
                                    onClick={() => handleSort('registeredAt')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Ngày tham gia</span>
                                        {getSortIcon('registeredAt')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPlayers.map((player) => (
                                <tr key={player.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {player.username}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {player.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                Cấp {player.level}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatNumber(player.experience || 0)} EXP
                                        </div>
                                        <div className="text-xs text-yellow-600">
                                            💰 {formatNumber(player.coins || 0)} xu
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center">
                                                <Heart className="h-3 w-3 mr-1 text-pink-500" />
                                                <span>{player.totalPets} thú cưng</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Package className="h-3 w-3 mr-1 text-blue-500" />
                                                <span>{player.totalItems} vật phẩm</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                                                <span>{player.totalAchievements} thành tích</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{formatDate(player.registeredAt)}</div>
                                        <div className="text-xs text-gray-400">
                                            {formatTimeAgo(player.lastLogin)} truy cập
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(player.status)}`}>
                                            {player.status === 'Active' ? 'Hoạt động' :
                                                player.status === 'Inactive' ? 'Không hoạt động' :
                                                    player.status === 'Banned' ? 'Đã cấm' : player.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => viewPlayerDetails(player)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleBanToggle(player.id)}
                                                className={`p-1 rounded transition-colors ${player.status === 'Banned'
                                                        ? 'text-green-600 hover:text-green-900 hover:bg-green-100'
                                                        : 'text-red-600 hover:text-red-900 hover:bg-red-100'
                                                    }`}
                                                title={player.status === 'Banned' ? 'Bỏ cấm' : 'Cấm người dùng'}
                                            >
                                                {player.status === 'Banned' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sortedPlayers.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy người chơi</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có người chơi nào trong hệ thống'}
                        </p>
                    </div>
                )}
            </div>

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

            {/* Player Details Modal */}
            {showModal && selectedPlayerDetails && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Chi tiết người chơi: {selectedPlayerDetails.username}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Player Basic Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedPlayerDetails.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
                                        <p className="mt-1 text-sm text-gray-900">Cấp {selectedPlayerDetails.level}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Xu</label>
                                        <p className="mt-1 text-sm text-gray-900">💰 {formatNumber(selectedPlayerDetails.coins || 0)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kinh nghiệm</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatNumber(selectedPlayerDetails.experience || 0)} EXP</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ngày tham gia</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPlayerDetails.registeredAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Lần truy cập cuối</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatTimeAgo(selectedPlayerDetails.lastLogin)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pets Section */}
                            <div>
                                <button
                                    onClick={() => toggleAccordion('pets')}
                                    className="w-full flex justify-between items-center p-3 bg-pink-50 text-pink-800 rounded-lg hover:bg-pink-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <Heart className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Thú cưng ({selectedPlayerDetails.pets?.length || 0})</span>
                                    </div>
                                    {accordionState.pets ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {accordionState.pets && (
                                    <div className="mt-2 space-y-2">
                                        {selectedPlayerDetails.pets?.length > 0 ? (
                                            selectedPlayerDetails.pets.map((pet) => (
                                                <div key={pet.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{pet.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {PET_TYPE_TRANSLATIONS[pet.type] || pet.type} • Cấp {pet.level}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                                            style={{ backgroundColor: RARITY_COLORS[pet.rarity] || '#gray' }}
                                                        >
                                                            {RARITY_TRANSLATIONS[pet.rarity] || pet.rarity}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Chưa có thú cưng nào</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Care History Section */}
                            <div>
                                <button
                                    onClick={() => toggleAccordion('inventory')}
                                    className="w-full flex justify-between items-center p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Lịch sử chăm sóc ({selectedPlayerDetails.careHistory?.length || 0})</span>
                                    </div>
                                    {accordionState.inventory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {accordionState.inventory && (
                                    <div className="mt-2 space-y-2">
                                        {selectedPlayerDetails.careHistory?.length > 0 ? (
                                            selectedPlayerDetails.careHistory.slice(0, 10).map((history, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{history.action}</h4>
                                                            <p className="text-sm text-gray-600">{history.petName}</p>
                                                            <p className="text-xs text-gray-500">{history.details}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(history.date)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Chưa có hoạt động chăm sóc</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Achievements Section */}
                            <div>
                                <button
                                    onClick={() => toggleAccordion('achievements')}
                                    className="w-full flex justify-between items-center p-3 bg-yellow-50 text-yellow-800 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <Trophy className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Thành tích ({selectedPlayerDetails.achievements?.length || 0})</span>
                                    </div>
                                    {accordionState.achievements ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {accordionState.achievements && (
                                    <div className="mt-2 space-y-2">
                                        {selectedPlayerDetails.achievements?.length > 0 ? (
                                            selectedPlayerDetails.achievements.map((achievement, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{achievement.title || 'Thành tích'}</h4>
                                                            <p className="text-sm text-gray-600">{achievement.description || 'Mô tả thành tích'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Chưa có thành tích nào</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
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
