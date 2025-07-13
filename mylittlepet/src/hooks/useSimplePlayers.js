/**
 * Custom Hook for Player Management
 * 
 * Provides comprehensive player data management functionality including:
 * - CRUD operations with pagination support
 * - Player status management (ban/unban)
 * - Statistics tracking
 * - Player-pet relationship management
 * - API integration with error handling
 * 
 * @returns {Object} Hook state and methods for player management
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

    /**
     * Delete a player (soft delete)
     * @param {number} id - Player ID to delete
     */
    const deletePlayer = useCallback(async (id) => {
        try {
            setLoading(true);
            await apiService.deletePlayer(id);
            console.log('✅ Player deleted successfully:', id);
            await refreshCurrentPage();

        } catch (error) {
            console.error('❌ Delete player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [refreshCurrentPage]);

    // ===== PLAYER STATUS MANAGEMENT =====
    /**
     * Ban a player with optional end date
     * @param {number} id - Player ID to ban
     * @param {Date} banEndDate - Optional ban end date
     */
    const banPlayer = useCallback(async (id, banEndDate = null) => {
        try {
            await apiService.banPlayer(id, banEndDate);
            const banDuration = banEndDate ? `until ${banEndDate.toLocaleDateString('vi-VN')}` : 'permanently';
            console.log('✅ Player banned successfully:', id, banDuration);
            await refreshCurrentPage();
            await loadStats();
        } catch (error) {
            console.error('❌ Ban player error:', error);
            throw error;
        }
    }, [refreshCurrentPage, loadStats]);

    /**
     * Unban a player
     * @param {number} id - Player ID to unban
     */
    const unbanPlayer = useCallback(async (id) => {
        try {
            await apiService.unbanPlayer(id);
            console.log('✅ Player unbanned successfully:', id);
            await refreshCurrentPage();
            await loadStats();
        } catch (error) {
            console.error('❌ Unban player error:', error);
            throw error;
        }
    }, [refreshCurrentPage, loadStats]);

    // ===== UTILITY FUNCTIONS =====
    /**
     * Get a specific player by ID
     * @param {number} id - Player ID
     * @returns {Object} Player data
     */
    const getPlayerById = useCallback(async (id) => {
        try {
            const player = await apiService.getPlayerById(id);
            console.log('✅ Player retrieved:', player.userName);
            return player;
        } catch (error) {
            console.error('❌ Get player by ID error:', error);
            throw error;
        }
    }, []);

    /**
     * Get pets owned by a specific player
     * @param {number} playerId - Player ID
     * @returns {Array} List of player's pets
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

    /**
     * Test API connection for debugging
     * @returns {boolean} Connection status
     */
    const testConnection = useCallback(async () => {
        try {
            const result = await apiService.testPlayerApi();
            console.log('✅ Player API connection test successful:', result);
            return true;
        } catch (error) {
            console.error('❌ Player API connection test failed:', error);
            return false;
        }
    }, []);    // Pagination actions
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

    const setPageSize = useCallback(async (newSize) => {
        setPagination(prev => ({ ...prev, size: newSize, currentPage: 0 }));
        // Reload with new page size
        await loadPlayers(0);
    }, [loadPlayers]);

    // ===== INITIALIZATION =====
    // Auto-load players and stats when hook is first used
    useEffect(() => {
        loadPlayers(0);
        loadStats();
    }, [loadPlayers, loadStats]);

    // ===== RETURN HOOK INTERFACE =====
    return {
        // ===== DATA STATE =====
        players: paginatedPlayers,      // Current page players for display
        allPlayers: players,            // All players (unfiltered)
        loading,                        // Loading state for UI feedback
        error,                          // Error state for error handling
        stats,                          // Player statistics
        pagination,                     // Pagination information
        searchTerm,                     // Current search term

        // ===== CRUD OPERATIONS =====
        loadPlayers,                    // Load players with pagination
        updatePlayer,                   // Update player information
        deletePlayer,                   // Delete player (soft delete)

        // ===== STATUS MANAGEMENT =====
        banPlayer,                      // Ban player with optional duration
        unbanPlayer,                    // Unban player

        // ===== PAGINATION CONTROLS =====
        goToPage,                       // Navigate to specific page
        nextPage,                       // Go to next page
        previousPage,                   // Go to previous page
        setPageSize,                    // Change items per page

        // ===== UTILITIES =====
        loadStats,                      // Refresh statistics
        testConnection,                 // Test API connectivity
        setSearchTerm,                  // Update search term
        getPlayerPets,                  // Get pets owned by player
        getPlayerById,                  // Get specific player by ID

        // ===== HELPER FUNCTIONS =====
        refreshData: refreshCurrentPage, // Refresh current page data
        clearError: () => setError(null) // Clear error state
    };
};
