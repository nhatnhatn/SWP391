import React, { useState, useEffect } from 'react';
import { Search, Edit2, Ban, CheckCircle, X, User, Mail, Heart, Trophy, ChevronUp, ChevronDown, Package, Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDate, formatTimeAgo, getStatusColor, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';
import { usePlayers } from '../../hooks/useData';

// Helper functions for item type display
const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
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
    switch (type?.toLowerCase()) {
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
    // Use players hook to fetch data from backend
    const {
        players: backendPlayers,
        loading,
        error,
        pagination,
        fetchPlayers,
        searchPlayers,
        updatePlayer,
        deletePlayer
    } = usePlayers();

    // State
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
    const [searchTerm, setSearchTerm] = useState('');

    // Load data from backend when component mounts
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    // Handle search with backend
    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term.trim()) {
            searchPlayers(term);
        } else {
            fetchPlayers();
        }
    };

    // Filter players locally by status
    const filteredPlayers = backendPlayers?.filter(player => {
        return statusFilter === 'all' || player.status === statusFilter;
    }) || [];

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
            // Sort alphabetically for username (case-insensitive)
            aValue = aValue?.toLowerCase();
            bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Pagination data from backend
    const apiTotalPages = pagination?.totalPages || 1;
    const apiCurrentPage = pagination?.page !== undefined ? pagination.page + 1 : 1; // API returns 0-based index

    const handlePageChange = (page) => {
        fetchPlayers(page - 1); // Convert to 0-based for API
        setSelectedPlayerDetails(null);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />;
    };

    const handleStatusChange = async (playerId, newStatus) => {
        if (window.confirm(`Are you sure you want to change this player's status to ${newStatus}?`)) {
            try {
                await updatePlayer(playerId, { status: newStatus });
                // Backend data will be refreshed by fetchPlayers after update
            } catch (error) {
                console.error('Failed to update player status:', error);
            }
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
            try {
                await deletePlayer(playerId);
                // Backend data will be refreshed by fetchPlayers after delete
            } catch (error) {
                console.error('Failed to delete player:', error);
            }
        }
    };

    // View player details
    const viewPlayerDetails = (player) => {
        setSelectedPlayerDetails(player);
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

    if (loading && !backendPlayers?.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !backendPlayers?.length) {
        return (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
                <p>Error loading players: {error}</p>
                <button
                    onClick={() => fetchPlayers()}
                    className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{t('players.management')}</h1>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('players.searchPlayers')}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">{t('players.allStatuses')}</option>
                        <option value="Active">{t('players.active')}</option>
                        <option value="Inactive">{t('players.inactive')}</option>
                        <option value="Banned">{t('players.banned')}</option>
                    </select>
                </div>
            </div>

            {/* Players Table */}
            {selectedPlayerDetails ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    {/* Back button */}
                    <button
                        onClick={closePlayerDetails}
                        className="mb-4 flex items-center text-gray-600 hover:text-blue-600"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('common.back')}
                    </button>

                    {/* Player details */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left column - basic info */}
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 text-blue-800 p-3 rounded-full mr-4">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedPlayerDetails.username}</h2>
                                    <p className="text-gray-600">{selectedPlayerDetails.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.level')}</h3>
                                    <p className="text-lg font-medium">{selectedPlayerDetails.level}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.status')}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPlayerDetails.status)}`}>
                                        {selectedPlayerDetails.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.registered')}</h3>
                                    <p className="text-sm">{formatDate(selectedPlayerDetails.registeredAt)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.lastLogin')}</h3>
                                    <p className="text-sm">{formatDate(selectedPlayerDetails.lastLogin)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-md text-center">
                                    <Heart className="h-5 w-5 mx-auto mb-2 text-red-500" />
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.pets')}</h3>
                                    <p className="text-lg font-medium">{selectedPlayerDetails.totalPets || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-md text-center">
                                    <Package className="h-5 w-5 mx-auto mb-2 text-green-500" />
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.items')}</h3>
                                    <p className="text-lg font-medium">{selectedPlayerDetails.totalItems || 0}</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-md text-center">
                                    <Trophy className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                                    <h3 className="text-sm text-gray-500 mb-1">{t('players.achievements')}</h3>
                                    <p className="text-lg font-medium">{selectedPlayerDetails.totalAchievements || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right column - pets, inventory, achievements */}
                        <div className="flex-1">
                            {/* Pets accordion */}
                            <div className="border rounded-md mb-4">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
                                    onClick={() => toggleAccordion('pets')}
                                >
                                    <h3 className="font-medium">{t('players.petCollection')}</h3>
                                    {accordionState.pets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                                {accordionState.pets && (
                                    <div className="p-4">
                                        {selectedPlayerDetails.pets && selectedPlayerDetails.pets.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedPlayerDetails.pets.map(pet => (
                                                    <div key={pet.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                                                        <div className={`w-2 h-10 mr-3 rounded-l-md bg-${pet.rarity}-500`}></div>
                                                        <div>
                                                            <p className="font-medium">{pet.name}</p>
                                                            <p className="text-xs text-gray-500">{pet.type} • Level {pet.level}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">{t('players.noPets')}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Inventory accordion */}
                            <div className="border rounded-md mb-4">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
                                    onClick={() => toggleAccordion('inventory')}
                                >
                                    <h3 className="font-medium">{t('players.inventory')}</h3>
                                    {accordionState.inventory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                                {accordionState.inventory && (
                                    <div className="p-4">
                                        {selectedPlayerDetails.inventory && selectedPlayerDetails.inventory.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedPlayerDetails.inventory.map(item => (
                                                    <div key={item.id} className="flex items-center">
                                                        <div className={`${getTypeColor(item.type)} rounded-full p-2 mr-3`}>
                                                            {getTypeIcon(item.type)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="text-xs text-gray-500">{item.type} • x{item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">{t('players.noItems')}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Achievements accordion */}
                            <div className="border rounded-md">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
                                    onClick={() => toggleAccordion('achievements')}
                                >
                                    <h3 className="font-medium">{t('players.achievements')}</h3>
                                    {accordionState.achievements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                                {accordionState.achievements && (
                                    <div className="p-4">
                                        {selectedPlayerDetails.achievements && selectedPlayerDetails.achievements.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedPlayerDetails.achievements.map(achievement => (
                                                    <div key={achievement.id} className="flex items-center">
                                                        <div className="bg-yellow-100 text-yellow-800 rounded-full p-2 mr-3">
                                                            <Trophy className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{achievement.name}</p>
                                                            <p className="text-xs text-gray-500">{achievement.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">{t('players.noAchievements')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div
                                            className="flex items-center cursor-pointer"
                                            onClick={() => handleSort('username')}
                                        >
                                            {t('players.username')}
                                            {getSortIcon('username')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div
                                            className="flex items-center cursor-pointer"
                                            onClick={() => handleSort('level')}
                                        >
                                            {t('players.level')}
                                            {getSortIcon('level')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div
                                            className="flex items-center cursor-pointer"
                                            onClick={() => handleSort('registeredAt')}
                                        >
                                            {t('players.registered')}
                                            {getSortIcon('registeredAt')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div
                                            className="flex items-center cursor-pointer"
                                            onClick={() => handleSort('lastLogin')}
                                        >
                                            {t('players.lastLogin')}
                                            {getSortIcon('lastLogin')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('players.status')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedPlayers.length > 0 ? (
                                    sortedPlayers.map(player => (
                                        <tr key={player.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{player.username}</div>
                                                        <div className="text-sm text-gray-500">{player.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{player.level}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(player.registeredAt)}</div>
                                                <div className="text-xs text-gray-500">{formatTimeAgo(player.registeredAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(player.lastLogin)}</div>
                                                <div className="text-xs text-gray-500">{formatTimeAgo(player.lastLogin)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(player.status)}`}>
                                                    {player.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => viewPlayerDetails(player)}
                                                        className="text-blue-600 hover:text-blue-900 border border-blue-300 hover:bg-blue-50 p-1 rounded"
                                                        title={t('common.view')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {player.status !== 'Active' && (
                                                        <button
                                                            onClick={() => handleStatusChange(player.id, 'Active')}
                                                            className="text-green-600 hover:text-green-900 border border-green-300 hover:bg-green-50 p-1 rounded"
                                                            title={t('players.activateAccount')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {player.status !== 'Banned' && (
                                                        <button
                                                            onClick={() => handleStatusChange(player.id, 'Banned')}
                                                            className="text-red-600 hover:text-red-900 border border-red-300 hover:bg-red-50 p-1 rounded"
                                                            title={t('players.banAccount')}
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeletePlayer(player.id)}
                                                        className="text-red-600 hover:text-red-900 border border-red-300 hover:bg-red-50 p-1 rounded"
                                                        title={t('common.delete')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            {t('players.noPlayersFound')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(apiCurrentPage - 1)}
                                disabled={apiCurrentPage <= 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${apiCurrentPage <= 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                            >
                                {t('common.previous')}
                            </button>
                            <button
                                onClick={() => handlePageChange(apiCurrentPage + 1)}
                                disabled={apiCurrentPage >= apiTotalPages}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${apiCurrentPage >= apiTotalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                            >
                                {t('common.next')}
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    {t('common.showing')} <span className="font-medium">{(apiCurrentPage - 1) * pagination?.size + 1}</span> {t('common.to')} <span className="font-medium">{Math.min(apiCurrentPage * pagination?.size, pagination?.totalElements)}</span> {t('common.of')} <span className="font-medium">{pagination?.totalElements}</span> {t('common.results')}
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(apiCurrentPage - 1)}
                                        disabled={apiCurrentPage <= 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${apiCurrentPage <= 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">{t('common.previous')}</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {[...Array(apiTotalPages).keys()].map((page) => {
                                        const pageNumber = page + 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${apiCurrentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(apiCurrentPage + 1)}
                                        disabled={apiCurrentPage >= apiTotalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${apiCurrentPage >= apiTotalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">{t('common.next')}</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
