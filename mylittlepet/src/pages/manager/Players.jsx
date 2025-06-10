import React, { useState } from 'react';
import { Search, Edit2, Ban, CheckCircle, X, User, Mail, Heart, Trophy, ChevronUp, ChevronDown, Package, Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { mockPlayers } from '../../data/mockData';
import { formatDate, getStatusColor, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';

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
    const [players, setPlayers] = useState(mockPlayers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false); const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);
    const [accordionState, setAccordionState] = useState({
        pets: true,
        inventory: false,
        achievements: false
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); const [currentPage, setCurrentPage] = useState(1);
    const playersPerPage = 6; const filteredPlayers = players.filter(player => {
        const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);// Sort filtered players
    const sortedPlayers = [...filteredPlayers].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];        // Handle special cases
        if (sortConfig.key === 'registeredAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortConfig.key === 'username') {
            // Sort alphabetically for username (case-insensitive)
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        } return 0;
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);
    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const currentPlayers = sortedPlayers.slice(startIndex, endIndex); const goToPage = (page) => {
        setCurrentPage(page);
        setSelectedPlayerDetails(null);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />;
    }; const handleStatusChange = (playerId, newStatus) => {
        setPlayers(players.map(player =>
            player.id === playerId ? { ...player, status: newStatus } : player
        ));

        // Update selected player details if it's currently displayed
        if (selectedPlayerDetails && selectedPlayerDetails.id === playerId) {
            setSelectedPlayerDetails({ ...selectedPlayerDetails, status: newStatus });
        }
    };

    const openModal = (player = null) => {
        setSelectedPlayer(player);
        setShowModal(true);
    }; const closeModal = () => {
        setShowModal(false);
        setSelectedPlayer(null);
    }; const handlePlayerClick = (player) => {
        // Toggle functionality - if same player is clicked, close details
        if (selectedPlayerDetails && selectedPlayerDetails.id === player.id) {
            setSelectedPlayerDetails(null);
        } else {
            setSelectedPlayerDetails(player);
            // Reset accordion state when opening new player details
            setAccordionState({
                pets: true,
                inventory: false,
                achievements: false
            });
        }
    };

    const closePlayerDetails = () => {
        setSelectedPlayerDetails(null);
    };

    const toggleAccordion = (section) => {
        setAccordionState(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div>            <div className="mb-6">            <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('players.management')}</h1>
        </div>{/* Player Details Panel */}
            {selectedPlayerDetails && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        {t('players.playerDetails')}
                    </h3>
                        <button
                            onClick={closePlayerDetails}
                            className="text-gray-400 hover:text-gray-600"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('players.username')}</label>
                                <div className="flex items-center mt-1">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-lg font-semibold text-gray-900">{selectedPlayerDetails.username}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('auth.email')}</label>
                                <div className="flex items-center mt-1">
                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-900">{selectedPlayerDetails.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('common.level')}</label>
                                <div className="flex items-center mt-1">
                                    <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                                    <span className="text-2xl font-bold text-yellow-600">{selectedPlayerDetails.level}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('common.status')}</label>
                                <div className="mt-1">
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPlayerDetails.status)}`}>
                                        {t(`statuses.${selectedPlayerDetails.status.toLowerCase()}`)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('players.totalPets')}</label>
                                <div className="flex items-center mt-1">
                                    <Heart className="h-4 w-4 text-pink-500 mr-2" />
                                    <span className="text-xl font-bold text-pink-600">{formatNumber(selectedPlayerDetails.totalPets)}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('players.totalItems')}</label>
                                <div className="flex items-center mt-1">
                                    <Package className="h-4 w-4 text-purple-500 mr-2" />
                                    <span className="text-xl font-bold text-purple-600">{formatNumber(selectedPlayerDetails.totalItems)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('players.totalAchievements')}</label>
                                <div className="flex items-center mt-1">
                                    <Star className="h-4 w-4 text-orange-500 mr-2" />
                                    <span className="text-xl font-bold text-orange-600">{formatNumber(selectedPlayerDetails.totalAchievements)}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('players.registered')}</label>
                                <div className="mt-1">
                                    <span className="text-gray-900">{formatDate(selectedPlayerDetails.registeredAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>{/* Detailed Sections */}
                    <div className="space-y-4">                        {/* Pet List Accordion */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                            <button
                                onClick={() => toggleAccordion('pets')}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                            >
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <Heart className="h-4 w-4 text-pink-500 mr-2" />
                                    {t('nav.pets')} ({selectedPlayerDetails.pets?.length || 0})
                                </h4>
                                {accordionState.pets ?
                                    <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                }
                            </button>
                            {accordionState.pets && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedPlayerDetails.pets?.map((pet, index) => (<div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                            <div>
                                                <span className="font-medium text-gray-900">{pet.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">({t(`petTypes.${pet.type.toLowerCase()}`) || pet.type})</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">Lv.{pet.level}</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${pet.rarity === 'mythic' ? 'bg-pink-100 text-pink-800' :
                                                    pet.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                                                        pet.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                                            pet.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                                                pet.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {t(`rarities.${pet.rarity}`)}
                                                </span>
                                            </div>
                                        </div>
                                        )) || <p className="text-gray-500 text-sm p-3">{t('players.noPetsFound')}</p>}
                                    </div>
                                </div>
                            )}
                        </div>                        {/* Inventory Accordion */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                            <button
                                onClick={() => toggleAccordion('inventory')}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                            >
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <Package className="h-4 w-4 text-purple-500 mr-2" />
                                    {t('players.inventory')} ({selectedPlayerDetails.inventory?.length || 0})
                                </h4>
                                {accordionState.inventory ?
                                    <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                }
                            </button>
                            {accordionState.inventory && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-2 max-h-48 overflow-y-auto">                                        {selectedPlayerDetails.inventory?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                                                    <span className="mr-1">{getTypeIcon(item.type)}</span>
                                                    {t(`itemTypes.${item.type.toLowerCase()}`) || item.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">x{item.quantity}</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${item.rarity === 'mythic' ? 'bg-pink-100 text-pink-800' :
                                                    item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                                                        item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                                            item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                                                item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {t(`rarities.${item.rarity}`)}
                                                </span>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500 text-sm p-3">{t('players.noItemsFound')}</p>}
                                    </div>
                                </div>
                            )}
                        </div>                        {/* Achievements Accordion */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200">
                            <button
                                onClick={() => toggleAccordion('achievements')}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                            >
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <Star className="h-4 w-4 text-orange-500 mr-2" />
                                    {t('players.achievements')} ({selectedPlayerDetails.achievements?.length || 0})
                                </h4>
                                {accordionState.achievements ?
                                    <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                }
                            </button>
                            {accordionState.achievements && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedPlayerDetails.achievements?.map((achievement, index) => (
                                            <div key={index} className="bg-white p-3 rounded border">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{achievement.name}</span>
                                                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{formatDate(achievement.unlocked)}</span>
                                                </div>
                                            </div>
                                        )) || <p className="text-gray-500 text-sm p-3">{t('players.noAchievementsFound')}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('players.searchPlayers')}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >                    <option value="all">{t('players.allStatus')}</option>
                    <option value="Active">{t('statuses.active')}</option>

                    <option value="Banned">{t('statuses.banned')}</option>
                </select>
            </div>
        </div>

            {/* Players Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('username')}
                            >
                                <div className="flex items-center">
                                    {t('players.player')}
                                    {getSortIcon('username')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('level')}
                            >
                                <div className="flex items-center">
                                    {t('common.level')}
                                    {getSortIcon('level')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center">
                                    {t('common.status')}
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('totalPets')}
                            >
                                <div className="flex items-center">
                                    {t('nav.pets')}
                                    {getSortIcon('totalPets')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('totalItems')}
                            >
                                <div className="flex items-center">
                                    {t('nav.items')}
                                    {getSortIcon('totalItems')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('totalAchievements')}
                            >
                                <div className="flex items-center">
                                    {t('players.achievements')}
                                    {getSortIcon('totalAchievements')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('registeredAt')}
                            >
                                <div className="flex items-center">
                                    {t('players.registeredAt')}
                                    {getSortIcon('registeredAt')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead><tbody className="bg-white divide-y divide-gray-200">                            {currentPlayers.map((player) => (
                        <tr
                            key={player.id}
                            className="hover:bg-gray-50"
                        ><td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-blue-600">
                                        {player.username}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{player.level}</div>
                            </td>                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(player.status)}`}>
                                    {t(`statuses.${player.status.toLowerCase()}`)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(player.totalPets)}
                            </td>                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(player.totalItems)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(player.totalAchievements)}
                            </td>                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(player.registeredAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">                                <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePlayerClick(player)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title={t('common.viewDetails')}
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => openModal(player)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title={t('common.edit')}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>                                {player.status === 'Banned' ? (
                                    <button
                                        onClick={() => handleStatusChange(player.id, 'Active')}
                                        className="text-green-600 hover:text-green-900"
                                        title={t('players.unbanPlayer')}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                ) : (
                                    // For both Active and Inactive players, show red Ban button
                                    <button
                                        onClick={() => handleStatusChange(player.id, 'Banned')}
                                        className="text-red-600 hover:text-red-900"
                                        title={t('players.banPlayer')}
                                    >
                                        <Ban className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            </td>
                        </tr>
                    ))}
                        </tbody>
                    </table>                </div>
            </div>            {/* Pagination */}
            {filteredPlayers.length > playersPerPage && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show limited page buttons with ellipsis for many pages
                        if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={i}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        } else if (
                            (pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                            return <span key={i} className="px-1">...</span>;
                        } else {
                            return null;
                        }
                    })}

                    <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}            {currentPlayers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">{t('common.noPlayersFound')}</p>
                </div>
            )}{/* Modal for Edit Player */}
            {showModal && (
                <PlayerModal
                    player={selectedPlayer}
                    onClose={closeModal} onSave={(playerData) => {
                        // Edit existing player
                        setPlayers(players.map(p =>
                            p.id === selectedPlayer.id ? { ...p, ...playerData } : p
                        ));

                        // Update selected player details if it's currently displayed
                        if (selectedPlayerDetails && selectedPlayerDetails.id === selectedPlayer.id) {
                            setSelectedPlayerDetails({ ...selectedPlayerDetails, ...playerData });
                        }
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}

function PlayerModal({ player, onClose, onSave }) {
    const [formData, setFormData] = useState({
        username: player?.username || '',
        email: player?.email || '',
        level: player?.level || 1,
        status: player?.status || 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('players.editPlayer')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('players.username')}
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.email')}
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('common.level')}
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('common.status')}
                    </label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >                        <option value="Active">{t('statuses.active')}</option>

                        <option value="Banned">{t('statuses.banned')}</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        {t('common.update')}
                    </button>
                </div>
            </form>
        </div>
    </div>
    );
}