// Simple React Hook for Player Management - Updated for API Integration
// Sinh viên style - basic functionality, happy case first

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimplePlayers = () => {
    // Basic state management
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({}); const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 1,
        totalElements: 0,
        size: 10,
        hasNext: false,
        hasPrevious: false
    });

    // Paginated players state for display
    const [paginatedPlayers, setPaginatedPlayers] = useState([]);    // Load players - simple version with pagination support
    const loadPlayers = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            // Use main API service
            const response = await apiService.getAllPlayers();
            console.log('✅ Players loaded:', response);

            // Handle response - always expect array from our API
            const allPlayers = Array.isArray(response) ? response : [];
            setPlayers(allPlayers);

            // Calculate pagination for client-side pagination
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

            // Set paginated data
            setPaginatedPlayers(currentPageData);

        } catch (error) {
            console.error('Load players error:', error);
            setError('Không thể tải danh sách người chơi');
            setPlayers([]); // Empty array on error
            setPaginatedPlayers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.size]);

    // Simple refresh function for pagination
    const refreshCurrentPage = useCallback(async () => {
        await loadPlayers(pagination.currentPage);
    }, [loadPlayers, pagination.currentPage]);

    // Load stats - simple version
    const loadStats = useCallback(async () => {
        try {
            // Calculate basic stats from players data
            const allPlayers = await apiService.getAllPlayers();
            const statsData = {
                total: allPlayers.length,
                active: allPlayers.filter(p => p.userStatus === 'ACTIVE').length,
                banned: allPlayers.filter(p => p.userStatus === 'BANNED').length,
                inactive: allPlayers.filter(p => p.userStatus === 'INACTIVE').length
            };
            setStats(statsData);
        } catch (error) {
            console.error('Load stats error:', error);
            setStats({ total: 0, active: 0, banned: 0, inactive: 0 });
        }
    }, []);    // Create player - simple version
    const createPlayer = useCallback(async (playerData) => {
        try {
            setLoading(true);

            const newPlayer = await apiService.createPlayer(playerData);
            console.log('✅ Player created:', newPlayer);
            await loadPlayers(); // Refresh list
            return newPlayer;

        } catch (error) {
            console.error('Create player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPlayers]);

    // Update player - simple version
    const updatePlayer = useCallback(async (id, playerData) => {
        try {
            setLoading(true);

            const updatedPlayer = await apiService.updatePlayer(id, playerData);
            console.log('✅ Player updated:', updatedPlayer);
            await loadPlayers(); // Refresh list
            return updatedPlayer;

        } catch (error) {
            console.error('Update player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPlayers]);    // Delete player - simple version
    const deletePlayer = useCallback(async (id) => {
        try {
            setLoading(true);

            await apiService.deletePlayer(id);
            console.log('✅ Player deleted:', id);
            await refreshCurrentPage(); // Refresh current page

        } catch (error) {
            console.error('Delete player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [refreshCurrentPage]);    // Ban player - simple version with pagination refresh and duration support
    const banPlayer = useCallback(async (id, banEndDate = null) => {
        try {
            await apiService.banPlayer(id, banEndDate);
            console.log('✅ Player banned:', id, banEndDate ? `until ${banEndDate.toLocaleDateString('vi-VN')}` : '');
            await refreshCurrentPage();
        } catch (error) {
            console.error('Ban player error:', error);
            throw error;
        }
    }, [refreshCurrentPage]);

    // Unban player - simple version with pagination refresh
    const unbanPlayer = useCallback(async (id) => {
        try {
            await apiService.unbanPlayer(id);
            console.log('✅ Player unbanned:', id);
            await refreshCurrentPage();
        } catch (error) {
            console.error('Unban player error:', error);
            throw error;
        }
    }, [refreshCurrentPage]);

    // Get player by ID - new function
    const getPlayerById = useCallback(async (id) => {
        try {
            const player = await apiService.getPlayerById(id);
            return player;
        } catch (error) {
            console.error('Get player by ID error:', error);
            throw error;
        }
    }, []);

    // Get player by email - new function
    const getPlayerByEmail = useCallback(async (email) => {
        try {
            const player = await apiService.getPlayerByEmail(email);
            return player;
        } catch (error) {
            console.error('Get player by email error:', error);
            throw error;
        }
    }, []);

    // Get players by status - new function
    const getPlayersByStatus = useCallback(async (status) => {
        try {
            const players = await apiService.getPlayersByStatus(status);
            return players;
        } catch (error) {
            console.error('Get players by status error:', error);
            throw error;
        }
    }, []);

    // Test API connection - new function
    const testConnection = useCallback(async () => {
        try {
            const result = await apiService.testPlayerApi();
            console.log('✅ API connection test successful:', result);
            return true;
        } catch (error) {
            console.error('❌ API connection test failed:', error);
            return false;
        }
    }, []);    // Reset password - new function
    const resetPassword = useCallback(async (id) => {
        try {
            // TODO: Implement reset password API call when backend is ready
            console.log('🔄 Reset password for player:', id);
            // For now, just simulate success
            return { success: true, message: 'Password reset successfully' };
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
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

    // Get player pets
    const getPlayerPets = useCallback(async (playerId) => {
        try {
            const pets = await apiService.getPlayerPets(playerId);
            return pets;
        } catch (error) {
            console.error('Get player pets error:', error);
            throw error;
        }
    }, []);

    // Auto-load on mount
    useEffect(() => {
        loadPlayers(0);
        loadStats();
    }, []);

    // Return all functions and state - simplified version
    return {
        // Data
        players: paginatedPlayers, // Show paginated data
        allPlayers: players, // All unfiltered players
        loading,
        error,
        stats,
        pagination,
        searchTerm,

        // CRUD Actions
        loadPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,

        // Status Actions
        banPlayer,
        unbanPlayer,
        resetPassword,

        // Pagination Actions
        goToPage,
        nextPage,
        previousPage,
        setPageSize,        // Stats & Utils
        loadStats,
        testConnection,
        setSearchTerm,
        getPlayerPets,

        // Utils
        refreshData: refreshCurrentPage,
        clearError: () => setError(null)
    };
};
