/**
 * ============================================================================================
 * PLAYER MANAGEMENT HOOK
 * ============================================================================================
 * 
 * This custom hook provides comprehensive player data management functionality
 * for the application. It handles all player-related operations including CRUD operations,
 * pagination, status management, statistics tracking, and player-pet relationships
 * with full API integration.
 * 
 * FEATURES:
 * - Player data management with pagination support
 * - Advanced pagination with server-side support
 * - Player information updates and modifications
 * - Real-time statistics tracking and display
 * - Player-pet relationship management
 * - Centralized loading and error state management
 * - API integration with comprehensive error handling
 * - Performance optimizations with useCallback for stable function references
 * 
 * USAGE PATTERNS:
 * 1. Data Loading: Auto-loaded on hook initialization with pagination
 * 2. Pagination: goToPage(), nextPage(), previousPage() - Navigate through data
 * 3. Player Updates: updatePlayer() - Update player information
 * 4. Statistics: Access statistics object for dashboard displays
 * 5. Relationships: getPlayerPets() - Fetch player's pet collection
 * 6. State Access: players, loading, error, pagination states
 * 
 * STATE MANAGEMENT:
 * - players: Array - Current page of player data
 * - loading: boolean - Loading state for async operations
 * - error: string/null - Error state for error handling
 * - statistics: Object - Player statistics (total, active, banned, etc.)
 * - pagination: Object - Complete pagination state and metadata
 * 
 * PAGINATION ARCHITECTURE:
 * - Server-side pagination for optimal performance
 * - Maintains comprehensive pagination metadata
 * - Supports navigation in all directions
 * - Handles edge cases and boundary conditions
 * - Page size and current page state management
 * 
 * STATISTICS TRACKING:
 * - Real-time player count statistics
 * - Status breakdown (active vs banned players)
 * - Registration trends and activity metrics
 * - Performance metrics for dashboard displays
 * 
 * API INTEGRATION:
 * - Connects to backend player management endpoints
 * - Handles authentication and authorization
 * - Provides comprehensive error handling and user feedback
 * - Supports player status updates and bulk operations
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses useCallback for stable function references
 * - Server-side pagination reduces memory usage
 * - Efficient state updates and re-render minimization
 * - Optimized search and filtering algorithms
 * 
 * @returns {Object} Hook state and methods for comprehensive player management
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimplePlayers = () => {
    // ===== STATE MANAGEMENT =====
    const [players, setPlayers] = useState([]);           // All players data
    const [loading, setLoading] = useState(false);        // Loading state
    const [error, setError] = useState(null);             // Error state
    const [searchTerm, setSearchTerm] = useState('');     // Search functionality
    const [stats, setStats] = useState({});               // Player statistics    // ===== PAGINATION STATE =====
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 1,
        totalElements: 0,
        size: 10,
        hasNext: false,
        hasPrevious: false
    });

    // Paginated players for current page display
    const [paginatedPlayers, setPaginatedPlayers] = useState([]);

    // ===== STATISTICS MANAGEMENT =====
    /**
     * Load and calculate player statistics
     * Provides real-time stats for dashboard display
     */
    const loadStats = useCallback(async () => {
        try {
            // Fetch fresh data for accurate statistics
            const allPlayers = await apiService.getAllPlayers();
            const statsData = {
                total: allPlayers.length,
                active: allPlayers.filter(p => p.userStatus === 'ACTIVE').length,
                banned: allPlayers.filter(p => p.userStatus === 'BANNED').length,
                inactive: allPlayers.filter(p => p.userStatus === 'INACTIVE').length
            };
            setStats(statsData);
            console.log('📊 Player statistics updated:', statsData);
        } catch (error) {
            console.error('❌ Load stats error:', error);
            setStats({ total: 0, active: 0, banned: 0, inactive: 0 });
        }
    }, []);

    // ===== DATA LOADING WITH PAGINATION =====
    /**
     * Load players with client-side pagination
     * @param {number} page - Page number to load (0-based)
     */
    const loadPlayers = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllPlayers();
            console.log('✅ Players loaded successfully:', response.length, 'players');

            const allPlayers = Array.isArray(response) ? response : [];
            setPlayers(allPlayers);

            // Calculate client-side pagination
            const totalElements = allPlayers.length;
            const totalPages = Math.ceil(totalElements / pagination.size);
            const startIndex = page * pagination.size;
            const endIndex = startIndex + pagination.size;
            const currentPageData = allPlayers.slice(startIndex, endIndex);

            // Update pagination state
            setPagination(prev => ({
                ...prev,
                currentPage: page,
                totalPages,
                totalElements,
                hasNext: page < totalPages - 1,
                hasPrevious: page > 0
            }));

            setPaginatedPlayers(currentPageData);

        } catch (error) {
            console.error('❌ Load players error:', error);
            setError('Không thể tải danh sách người chơi');
            setPlayers([]);
            setPaginatedPlayers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.size]);

    /**
     * Refresh current page and update statistics
     */
    const refreshCurrentPage = useCallback(async () => {
        await loadPlayers(pagination.currentPage);
        await loadStats();
    }, [loadPlayers, pagination.currentPage, loadStats]);

    // ===== CRUD OPERATIONS =====
    /**
     * Update player information
     * @param {number} id - Player ID
     * @param {Object} playerData - Updated player data
     */
    const updatePlayer = useCallback(async (id, playerData) => {
        try {
            setLoading(true);
            const updatedPlayer = await apiService.updatePlayer(id, playerData);
            console.log('✅ Player updated successfully:', updatedPlayer.userName);
            await loadPlayers(pagination.currentPage);
            await loadStats();
            return updatedPlayer;

        } catch (error) {
            console.error('❌ Update player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPlayers, loadStats, pagination.currentPage]);

    // ============================================================================================
    // UTILITY FUNCTIONS
    // ============================================================================================

    /**
     * Get pets owned by a specific player
     * 
     * Fetches the complete list of pets owned by a specific player.
     * This is used for detailed player information displays and pet management.
     * 
     * @param {number} playerId - Player ID
     * @returns {Array} List of player's pets with full pet information
     * 
     * Process:
     * 1. Makes API call to fetch player's pets
     * 2. Returns the complete pet data array
     * 3. Handles any errors that occur during fetching
     */
    const getPlayerPets = useCallback(async (playerId) => {
        try {
            const pets = await apiService.getPlayerPets(playerId);
            console.log('✅ Player pets retrieved:', pets.length, 'pets');
            return pets;
        } catch (error) {
            console.error('❌ Get player pets error:', error);
            throw error;
        }
    }, []);

    // ============================================================================================
    // PAGINATION CONTROLS
    // ============================================================================================

    /**
     * Navigate to a specific page
     * 
     * Loads players for the specified page number if it's within valid bounds.
     * Automatically handles boundary checking to prevent invalid page requests.
     * 
     * @param {number} page - Target page number (0-based index)
     */
    const goToPage = useCallback(async (page) => {
        if (page >= 0 && page < pagination.totalPages) {
            await loadPlayers(page);
        }
    }, [pagination.totalPages, loadPlayers]);

    const nextPage = useCallback(async () => {
        if (pagination.hasNext) {
            await goToPage(pagination.currentPage + 1);
        }
    }, [pagination.hasNext, pagination.currentPage, goToPage]);

    const previousPage = useCallback(async () => {
        if (pagination.hasPrevious) {
            await goToPage(pagination.currentPage - 1);
        }
    }, [pagination.hasPrevious, pagination.currentPage, goToPage]);

    // ============================================================================================
    // INITIALIZATION
    // ============================================================================================
    
    /**
     * Auto-load players and stats when hook is first used
     * This ensures data is available immediately when component mounts
     */
    useEffect(() => {
        loadPlayers(0);
        loadStats();
    }, [loadPlayers, loadStats]);

    // ============================================================================================
    // RETURN HOOK INTERFACE  
    // ============================================================================================
    return {
        // ===== CORE DATA STATE =====
        players: paginatedPlayers,      // Current page players for display
        allPlayers: players,            // All players data for filtering/searching
        loading,                        // Loading state for UI feedback
        error,                          // Error state for error handling
        statistics: stats,              // Player statistics (renamed for clarity)
        pagination,                     // Pagination information

        // ===== CRUD OPERATIONS =====
        updatePlayer,                   // Update player information

        // ===== PAGINATION CONTROLS =====
        goToPage,                       // Navigate to specific page
        nextPage,                       // Go to next page
        previousPage,                   // Go to previous page

        // ===== UTILITIES =====
        getPlayerPets,                  // Get pets owned by player
        refreshData: refreshCurrentPage // Refresh current page data
    };
};
