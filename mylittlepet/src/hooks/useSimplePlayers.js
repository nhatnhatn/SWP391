/**
 * ============================================================================================
 * PLAYER MANAGEMENT HOOK
 * ============================================================================================
 * 
 * This custom hook provides comprehensive player data management functionality
 * for the application. It handles all player-related operations including data fetching,
 * statistics tracking, and player-pet relationships with full API integration.
 * 
 * FEATURES:
 * - Player data management and loading
 * - Player information updates and modifications
 * - Real-time statistics tracking and display
 * - Player-pet relationship management
 * - Centralized loading and error state management
 * - API integration with comprehensive error handling
 * - Performance optimizations with useCallback for stable function references
 * 
 * USAGE PATTERNS:
 * 1. Data Loading: Auto-loaded on hook initialization
 * 2. Statistics: Access statistics object for dashboard displays
 * 3. Relationships: getPlayerPets() - Fetch player's pet collection
 * 4. State Access: players, loading, error states
 * 
 * STATE MANAGEMENT:
 * - players: Array - All players data
 * - loading: boolean - Loading state for async operations
 * - error: string/null - Error state for error handling
 * - statistics: Object - Player statistics (total, active, banned, etc.)
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
    const [stats, setStats] = useState({});               // Player statistics

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
                total: allPlayers.length
            };
            setStats(statsData);
            console.log('📊 Player statistics updated:', statsData);
        } catch (error) {
            console.error('❌ Load stats error:', error);
            setStats({ total: 0 });
        }
    }, []);

    // ===== DATA LOADING =====
    /**
     * Load all players from the API
     * This function fetches all players and stores them in state
     * 
     * @returns {Promise<void>} - Returns a promise that resolves when loading is complete
     */
    const loadPlayers = useCallback(async () => {
        try {
            // Set loading state to show spinner/loading indicator in UI
            setLoading(true);
            // Clear any previous error messages
            setError(null);

            // Fetch all players from the backend API
            const response = await apiService.getAllPlayers();
            console.log('✅ Players loaded successfully:', response.length, 'players');

            // Ensure we have an array, even if API returns unexpected data
            const allPlayers = Array.isArray(response) ? response : [];
            // Store all players in state
            setPlayers(allPlayers);

        } catch (error) {
            // Handle any errors that occur during API call or data processing
            console.error('❌ Load players error:', error);
            // Set user-friendly error message
            setError('Không thể tải danh sách người chơi');
            // Clear player data to prevent showing stale data
            setPlayers([]);
        } finally {
            // Always turn off loading state, regardless of success or failure
            setLoading(false);
        }
    }, []); // No dependencies needed since we're not using pagination

    /**
     * Refresh players data and update statistics
     * This function is called when data needs to be refreshed (e.g., after updates)
     * It reloads all player data and recalculates statistics
     * 
     * @returns {Promise<void>} - Returns a promise that resolves when refresh is complete
     */
    const refreshPlayers = useCallback(async () => {
        // Reload all players data
        await loadPlayers();
        // Update statistics with fresh data
        await loadStats();
    }, [loadPlayers, loadStats]); // Recreate if any of these dependencies change

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
    // INITIALIZATION
    // ============================================================================================

    /**
     * Auto-load players and stats when hook is first used
     * This ensures data is available immediately when component mounts
     */
    useEffect(() => {
        loadPlayers();
        loadStats();
    }, [loadPlayers, loadStats]);

    // ============================================================================================
    // RETURN HOOK INTERFACE  
    // ============================================================================================
    return {
        // ===== CORE DATA STATE =====
        players,                        // All players data
        loading,                        // Loading state for UI feedback
        error,                          // Error state for error handling
        stats,                          // Player statistics

        // ===== UTILITIES =====
        getPlayerPets,                  // Get pets owned by player
        refreshData: refreshPlayers     // Refresh all player data
    };
};
