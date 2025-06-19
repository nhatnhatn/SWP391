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
    const [stats, setStats] = useState({});
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 1,
        totalElements: 0,
        size: 10
    });    // Load players - simple version
    const loadPlayers = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            // Use main API service
            const response = await apiService.getAllPlayers();
            console.log('✅ Players loaded:', response);

            // Handle response - always expect array from our API
            setPlayers(Array.isArray(response) ? response : []);

        } catch (error) {
            console.error('Load players error:', error);
            setError('Không thể tải danh sách người chơi');
            setPlayers([]); // Empty array on error
        } finally {
            setLoading(false);
        }
    }, []);

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
    }, [loadPlayers]);

    // Delete player - simple version
    const deletePlayer = useCallback(async (id) => {
        try {
            setLoading(true);

            await apiService.deletePlayer(id);
            console.log('✅ Player deleted:', id);
            await loadPlayers(); // Refresh list

        } catch (error) {
            console.error('Delete player error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPlayers]);    // Search players - enhanced version with multiple search options
    const searchPlayers = useCallback(async (term, searchBy = 'all') => {
        try {
            setLoading(true);
            setSearchTerm(term);

            if (!term.trim()) {
                await loadPlayers();
                return;
            }

            let results = [];

            // Search by different criteria
            switch (searchBy) {
                case 'email':
                    try {
                        const player = await apiService.getPlayerByEmail(term);
                        results = [player];
                    } catch (error) {
                        results = []; // Player not found
                    }
                    break;
                case 'username':
                    try {
                        const player = await apiService.getPlayerByUserName(term);
                        results = [player];
                    } catch (error) {
                        results = []; // Player not found
                    }
                    break;
                case 'status':
                    results = await apiService.getPlayersByStatus(term);
                    break;
                default:
                    // Search all players and filter locally
                    const allPlayers = await apiService.getAllPlayers();
                    results = allPlayers.filter(player =>
                        player.userName.toLowerCase().includes(term.toLowerCase()) ||
                        player.userEmail.toLowerCase().includes(term.toLowerCase()) ||
                        player.userStatus.toLowerCase().includes(term.toLowerCase())
                    );
            }

            setPlayers(Array.isArray(results) ? results : []);

        } catch (error) {
            console.error('Search players error:', error);
            setError('Lỗi khi tìm kiếm');
        } finally {
            setLoading(false);
        }
    }, [loadPlayers]);

    // Ban player - simple version
    const banPlayer = useCallback(async (id) => {
        try {
            await apiService.banPlayer(id);
            console.log('✅ Player banned:', id);
            await loadPlayers();
        } catch (error) {
            console.error('Ban player error:', error);
            throw error;
        }
    }, [loadPlayers]);

    // Unban player - simple version
    const unbanPlayer = useCallback(async (id) => {
        try {
            await apiService.unbanPlayer(id);
            console.log('✅ Player unbanned:', id);
            await loadPlayers();
        } catch (error) {
            console.error('Unban player error:', error);
            throw error;
        }
    }, [loadPlayers]);

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
    }, []);    // Filter players locally - simple version
    const filteredPlayers = players.filter(player => {
        if (!searchTerm) return true;
        return player.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.userStatus.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Auto-load on mount
    useEffect(() => {
        loadPlayers();
        loadStats();
    }, []);

    // Return all functions and state - enhanced version
    return {
        // Data
        players: filteredPlayers,
        allPlayers: players, // Unfiltered
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

        // Search & Filter Actions
        searchPlayers,
        getPlayerById,
        getPlayerByEmail,
        getPlayersByStatus,

        // Status Actions
        banPlayer,
        unbanPlayer,

        // Stats & Utils
        loadStats,
        testConnection,
        setSearchTerm,

        // Utils
        refreshData: () => {
            loadPlayers();
            loadStats();
        },
        clearError: () => setError(null)
    };
};
