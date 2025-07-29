/**
 * Player Management Component
 * 
 * This component provides functionality for viewing and managing player data.
 * Features include:
 * - View player statistics and information
 * - Search and filter players by various criteria
 * - View player's pet collection
 * - Responsive design with detailed modal views
 * - Real-time search with debouncing
 * - Pagination for large datasets
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Eye, Users, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Filter, Save, Shield, ShieldCheck } from 'lucide-react';
import { useSimplePlayers } from '../../hooks/useSimplePlayers';
import { useNotificationManager } from '../../hooks/useNotificationManager';
import apiService from '../../services/api';

/**
 * Reusable notification toast component
 * Displays success/error messages with auto-dismiss and progress bar
 * 
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error' to determine styling
 * @param {function} onClose - Callback function when toast is closed
 * @param {number} duration - Auto-dismiss duration in milliseconds
 */
const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    // Progress bar state for visual countdown
    const [progress, setProgress] = useState(100);
    // Visibility state for smooth animations
    const [isVisible, setIsVisible] = useState(false);

    // Auto-dismiss timer and progress bar animation
    useEffect(() => {
        // Show toast with fade-in animation
        setIsVisible(true);

        // Configure progress bar animation - update every 50ms for smooth animation
        const updateInterval = 50;
        const decrementAmount = 100 / (duration / updateInterval);

        // Update progress bar periodically
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, updateInterval);

        // Auto-dismiss toast after duration
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for slide-out animation
        }, duration);

        // Cleanup intervals on unmount
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    // Dynamic styling based on notification type
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
    const progressColor = type === 'success' ? 'bg-green-200' : 'bg-red-200';

    return (
        <div className={`fixed top-4 right-4 z-9999 max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`${bgColor} rounded-lg shadow-2xl border border-white/30 overflow-hidden backdrop-blur-sm`}>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {type === 'success' ? (
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">✓</span>
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">!</span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium text-white`}>
                                    {type === 'success' ? 'Success' : 'Error'}
                                </h3>
                                <p className={`text-sm ${textColor} mt-1`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="ml-4 text-white/80 hover:text-white transition-colors"
                            aria-label="Close notification"
                        >
                            <span className="h-4 w-4">×</span>
                        </button>
                    </div>
                </div>
                {/* Animated progress bar showing remaining time */}
                <div className="h-1 bg-white/20">
                    <div
                        className={`h-full ${progressColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Main Player Management Component
 * 
 * Handles player data display, searching, filtering, and detailed views
 * with pagination and real-time search capabilities
 */
const PlayersSimple = () => {
    // ============================================================================
    // HOOKS AND DATA MANAGEMENT
    // ============================================================================

    /**
     * Custom hook for player data management
     * Provides players data, loading states, and utility functions
     */
    const {
        players, // All players data
        loading, // Loading state for initial data fetch
        error, // Error state for data fetching
        stats,
        getPlayerPets,
        refreshData: refreshPlayers
    } = useSimplePlayers();

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    // Search state with debouncing for performance
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    /**
     * Debounce search term to prevent excessive filtering
     * Waits 300ms after user stops typing before applying search
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(localSearchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Modal and UI state
    const [selectedPlayer, setSelectedPlayer] = useState(null); // Player selected for detailed view
    const [selectedPlayerPets, setSelectedPlayerPets] = useState([]); // Pets owned by selected player
    const [loadingPets, setLoadingPets] = useState(false); // Loading state for pet data

    // Notification management
    const {
        notification,
        showNotification,
        clearNotification,
    } = useNotificationManager(refreshPlayers);

    // Sorting and filtering state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [levelFilter, setLevelFilter] = useState('all'); // Filter by level range
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle advanced filters

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handles search input with debouncing
     * @param {string} term - Search term to filter players by name or email
     */
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
    }, []);

    /**
     * Clears search input and resets debounced search
     */
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);

    // ============================================================================
    // DATA PROCESSING AND PAGINATION
    // ============================================================================

    // Client-side pagination state for filtered results
    const [currentFilterPage, setCurrentFilterPage] = useState(0);
    const itemsPerPage = 10;

    /**
     * Filters and sorts all players based on current filter and sort settings
     * This provides proper client-side filtering and sorting
     */
    const filteredPlayers = useMemo(() => {
        // Safety check: ensure players is an array before filtering
        if (!Array.isArray(players)) {
            return [];
        }

        // Start with all players from the hook
        let filtered = players.filter(player => {
            // Apply search filter using debounced search term
            if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const userName = (player.userName || '').toLowerCase();
                const email = (player.email || '').toLowerCase();
                if (!userName.includes(searchLower) && !email.includes(searchLower)) return false;
            }

            // Apply level filter
            if (levelFilter !== 'all') {
                const playerLevel = player.level || 1;
                switch (levelFilter) {
                    case 'low':
                        if (playerLevel >= 10) return false;
                        break;
                    case 'medium':
                        if (playerLevel < 10 || playerLevel >= 50) return false;
                        break;
                    case 'high':
                        if (playerLevel < 50) return false;
                        break;
                    default:
                        break;
                }
            }

            return true;
        });

        // Apply sorting if sort configuration is set
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparisons case-insensitively
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [players, debouncedSearchTerm, sortConfig, levelFilter]);

    // Calculate pagination values for filtered results
    const totalFilteredPages = Math.ceil(filteredPlayers.length / itemsPerPage);
    const startIndex = currentFilterPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayPlayers = filteredPlayers.slice(startIndex, endIndex);

    /**
     * Reset to first page when any filter changes
     */
    useEffect(() => {
        setCurrentFilterPage(0);
    }, [debouncedSearchTerm, levelFilter]);

    // ============================================================================
    // PAGINATION HANDLERS
    // ============================================================================

    /**
     * Navigate to previous page in filtered results
     */
    const handleFilterPreviousPage = () => {
        if (currentFilterPage > 0) {
            setCurrentFilterPage(currentFilterPage - 1);
        }
    };

    /**
     * Navigate to next page in filtered results
     */
    const handleFilterNextPage = () => {
        if (currentFilterPage < totalFilteredPages - 1) {
            setCurrentFilterPage(currentFilterPage + 1);
        }
    };

    // ============================================================================
    // MODAL AND CRUD HANDLERS
    // ============================================================================

    /**
     * Opens player detail modal and loads their pet data
     * @param {Object} player - Player object to display details for
     */
    const handleView = async (player) => {
        setSelectedPlayer(player);
        setLoadingPets(true);

        try {
            console.log('Loading pets for player:', player.userName);
            // Fetch pets associated with this player using the hook method
            const pets = await getPlayerPets(player.id);
            setSelectedPlayerPets(pets || []);
            console.log('Pets loaded:', pets);
        } catch (error) {
            console.error('Failed to load player pets:', error);
            setSelectedPlayerPets([]);
            showNotification('Failed to load player pets', 'error');
        } finally {
            setLoadingPets(false);
        }
    };

    // ============================================================================
    // COMPONENT RENDER
    // ============================================================================

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Notification Toast Component - displays temporary messages to user */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}

            {/* Dashboard Header - Main title and overview section */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    {/* Title Section with Icon */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Player Management</h1>

                        </div>
                    </div>

                    {/* Statistics Section - Desktop View */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-green-100 rounded-lg">
                                    <Users className="h-4 w-4 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Total Players</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{stats?.total || players.length}</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Statistics Section */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                <p className="text-xs font-medium text-gray-600">Total Players</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">{players?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">An error occurred</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Search & Filters</h3>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Search Section */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Search Players</span>
                        </div>

                        <div className="space-y-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors duration-200" />                                <input
                                    type="text"
                                    placeholder="Enter player name to search..."
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            {(localSearchTerm || debouncedSearchTerm) && (
                                <div className="bg-green-100 rounded-md p-3 border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-green-800 font-medium">
                                            🔍 Showing search results for: "<span className="font-semibold text-green-900">{debouncedSearchTerm || localSearchTerm}</span>"
                                            {localSearchTerm !== debouncedSearchTerm && localSearchTerm && (
                                                <span className="text-xs text-green-600 ml-2">(typing...)</span>
                                            )}
                                        </p>
                                        <button
                                            onClick={clearSearch}
                                            className="ml-auto text-green-600 hover:text-green-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                        >
                                            Clear Search
                                        </button>
                                    </div>
                                </div>)}
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
                                    Advanced Filters
                                </span>
                                {showAdvancedFilters ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                )}

                                {/* Filter Status Indicator */}

                                {(levelFilter !== 'all' || sortConfig.key) && (
                                    // The badge visually indicates how many filters/sorts are currently active
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                        {/*
                                            Count the number of active filters:
                                            - If levelFilter is not 'all', it's active (so include its value)
                                            - If sortConfig.key is set, sorting is active (so include its value)
                                            - The array filters out any falsey values (null, undefined, empty string)
                                            - Uses .filter(Boolean).length to count how many filters are active.
                                        */}
                                        {
                                            [
                                                levelFilter !== 'all' ? levelFilter : null,
                                                sortConfig.key
                                            ].filter(Boolean).length
                                        }
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Advanced Filters Content - Collapsible */}
                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Filter by Content</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Level Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Level Range
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={levelFilter}
                                                    onChange={(e) => setLevelFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all">All Levels</option>
                                                    <option value="low"> Low (1-9)</option>
                                                    <option value="medium"> Medium (10-49)</option>
                                                    <option value="high"> High (50+)</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter Status Display */}
                                    {levelFilter !== 'all' && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {levelFilter !== 'all' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    {levelFilter === 'low' ? ' Low Level' :
                                                        levelFilter === 'medium' ? ' Medium Level' :
                                                            ' High Level'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Sorting Section */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center">

                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Sort Data</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Sort Field */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sort By
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
                                                    <option value=""> No Sorting</option>
                                                    <option value="userName">Player Name</option>
                                                    <option value="level"> Level</option>
                                                    <option value="coin"> Coin</option>
                                                    <option value="diamond"> Diamond</option>
                                                    <option value="gem"> Gem</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Order By
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
                                                        Ascending
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
                                                        Descending
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
                                                        Currently sorting by:
                                                        <span className="font-bold">
                                                            {sortConfig.key === 'userName' && 'Player Name'}
                                                            {sortConfig.key === 'level' && 'Level'}
                                                            {sortConfig.key === 'coin' && ' Coin'}
                                                            {sortConfig.key === 'diamond' && ' Diamond'}
                                                            {sortConfig.key === 'gem' && ' Gem'}
                                                        </span>
                                                        ({sortConfig.direction === 'asc' ? 'Ascending Order' : 'Descending Order'})
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                                >
                                                    Clear Sorting
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section - Separated */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Actions</span>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                // Reset all filters and sorting
                                                setLevelFilter('all');
                                                setSortConfig({ key: null, direction: 'asc' });
                                                clearSearch();
                                            }}
                                            disabled={levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm}
                                            className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'No filters'
                                                : 'Clear all filters'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(levelFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Search', //search is only used for counting active filters
                                                    levelFilter !== 'all' && 'Level',
                                                    sortConfig.key && 'Sort'
                                                ].filter(Boolean).length} active filters
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gradient-to-l from-teal-600 to-green-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">PLAYER LIST</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[20%]" />
                                <col className="w-[15%]" />
                                <col className="w-[15%]" />
                                <col className="w-[15%]" />
                                <col className="w-[15%]" />
                                <col className="w-[20%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-teal-600 to-green-600 border-b-4 border-green-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Player Name
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Level
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Coin
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Diamond
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Gem
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {displayPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">No players found</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || levelFilter !== 'all'
                                                            ? 'No players found matching the filters.'
                                                            : 'No players found on this page.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>) : (displayPlayers.map((player) => (
                                        <tr key={player.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200">
                                            {/* Player Name */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-sm font-semibold text-gray-900 break-words text-center" title={player.userName || 'N/A'}>
                                                        {player.userName || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Level */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm">
                                                        {player.level || 1}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Coin */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-xs font-medium text-yellow-700 text-center">
                                                        {(player.coin || 0).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Diamond */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-xs font-medium text-blue-700 text-center">
                                                        {(player.diamond || 0).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Gem */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-xs font-medium text-green-700 text-center">
                                                        {(player.gem || 0).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleView(player)}
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalFilteredPages > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-t border-blue-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            {/* Previous Button: Go to previous page, disabled on first page */}
                            <button
                                onClick={handleFilterPreviousPage}
                                disabled={currentFilterPage === 0}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous Page</span>
                            </button>

                            {/* Page Numbers: Show first, last, current, and neighbors. Ellipsis for skipped pages. */}
                            <div className="flex items-center gap-1">
                                {/* This line is used to dynamically generate the page number buttons */}
                                {Array.from({ length: totalFilteredPages }, (_, i) => i).map((page) => {
                                    // Show first, last, and pages near the current page
                                    const shouldShow =
                                        page === 0 ||
                                        page === totalFilteredPages - 1 ||
                                        Math.abs(page - currentFilterPage) <= 1;

                                    // Hide most pages except for first, last, and neighbors
                                    if (!shouldShow && page !== 1 && page !== totalFilteredPages - 2) {
                                        return null;
                                    }

                                    // Show ellipsis if there is a gap between shown pages
                                    if (
                                        (page === 1 && currentFilterPage > 3) ||
                                        (page === totalFilteredPages - 2 && currentFilterPage < totalFilteredPages - 4)
                                    ) {
                                        return (
                                            <span key={page} className="px-2 text-blue-500">
                                                ...
                                            </span>
                                        );
                                    }
                                    // Render page number button
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentFilterPage(page)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === currentFilterPage
                                                ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md'
                                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800'
                                                }`}
                                        >
                                            {page + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button: Go to next page, disabled on last page */}
                            <button
                                onClick={handleFilterNextPage}
                                disabled={currentFilterPage >= totalFilteredPages - 1}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <span className="hidden sm:inline">Next Page</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Player Details Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                        {/* Header with Gradient */}
                        <div className="relative bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 p-6 border-b border-gray-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-green-600/90 to-emerald-600/90"></div>
                            <div className="relative flex justify-center items-center">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="text-4xl font-bold text-white">Player Details</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content - No scroll */}
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Join Date Banner */}
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between ">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-blue-600 font-bold text-sm">👤</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-800">Account Information</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                            {selectedPlayer.joinDate ?
                                                `Join Date: ${new Date(selectedPlayer.joinDate).toLocaleDateString('en-US')}` :
                                                'Join Date: N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Level Card */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Current Level</p>
                                            <p className="text-2xl font-bold text-amber-700">{selectedPlayer.level || 1}</p>
                                        </div>

                                    </div>
                                </div>

                                {/* Coins Card */}
                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Coins</p>
                                            <p className="text-2xl font-bold text-yellow-700">{(selectedPlayer.coin || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Diamonds Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Diamonds</p>
                                            <p className="text-2xl font-bold text-blue-700">{(selectedPlayer.diamond || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gems Card */}
                                <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Gems</p>
                                            <p className="text-2xl font-bold text-green-700">{(selectedPlayer.gem || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Personal Information Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <h4 className="text-2xl font-semibold text-gray-800">Personal Information</h4>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">Player ID</span>
                                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">#{selectedPlayer.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">Player Name</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedPlayer.userName || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Game Statistics Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <h4 className="text-2xl font-semibold text-gray-800">Game Statistics</h4>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">

                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">Total Pets</span>
                                            <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                                                <span>🐾</span>
                                                {selectedPlayer.totalPets || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-gray-600">Current Level</span>
                                            <div className="flex items-center gap-2">

                                                <span className="text-sm text-black-500">{selectedPlayer.level || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pets Section */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <span className="text-emerald-600 text-lg">🐾</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">Pet List</h4>
                                            </div>
                                        </div>
                                        {selectedPlayerPets.length > 0 && (
                                            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                                {selectedPlayerPets.length} pets
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5">
                                    {loadingPets ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                                            <span className="text-lg font-medium">Loading pet list...</span>
                                            <span className="text-sm text-gray-500 mt-1">Please wait a moment</span>
                                        </div>
                                    ) : selectedPlayerPets.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {selectedPlayerPets.map((pet, index) => (
                                                <div key={pet.playerPetId || index}
                                                    className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                                                    
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
                                                                <span className="text-sm">🐾</span>
                                                            </div>
                                                            <div className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                                                Lv.{pet.level || 1}
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h6 className="font-semibold text-gray-900 text-sm line-clamp-1" title={pet.petCustomName || pet.petDefaultName || 'Unnamed'}>
                                                            {pet.petCustomName || pet.petDefaultName || 'Unnamed'}
                                                        </h6>

                                                        {pet.petType && (
                                                            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full w-fit">
                                                                <span>🏷️</span>
                                                                <span>{pet.petType}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-lg font-semibold text-gray-700 mb-2">No pets found</p>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                                This player doesn't own any pets in the game.
                                                They can get their first pet from the shop.
                                            </p>
                                            <div className="mt-4 flex justify-center">
                                                <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm">
                                                    0 pets
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="flex p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white justify-end items-center">

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedPlayer(null);
                                        setSelectedPlayerPets([]);
                                    }}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
};

export default PlayersSimple;
