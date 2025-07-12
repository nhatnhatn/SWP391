/**
 * Custom Hook for Pet Management
 * 
 * Provides comprehensive pet data management functionality including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Filtering and searching capabilities
 * - Status management
 * - API integration with error handling
 * 
 * @returns {Object} Hook state and methods for pet management
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimplePets = () => {
    // ===== STATE MANAGEMENT =====
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // ===== DATA LOADING =====
    /**
     * Load all pets from the backend API
     * Handles loading state and error management
     */
    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllPets();
            console.log('✅ Pets loaded successfully:', response.length, 'pets');

            const allPets = Array.isArray(response) ? response : [];
            setPets(allPets);

        } catch (error) {
            console.error('❌ Load pets error:', error);
            setError('Không thể tải danh sách thú cưng');
            setPets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ===== SEARCH & FILTERING =====
    /**
     * Search pets by keyword
     * @param {string} keyword - Search term to filter pets
     */
    const searchPets = useCallback(async (keyword) => {
        try {
            setLoading(true);
            setError(null);

            if (keyword.trim()) {
                const response = await apiService.searchPets(keyword);
                setPets(Array.isArray(response) ? response : []);
                console.log(`🔍 Search completed: Found ${response?.length || 0} pets for "${keyword}"`);
            } else {
                await loadPets(); // Reset to all pets if search is empty
            }

        } catch (error) {
            console.error('❌ Search pets error:', error);
            setError('Không thể tìm kiếm thú cưng');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    /**
     * Filter pets by type (Dragon, Bird, Beast, etc.)
     * @param {string} type - Pet type to filter by
     */
    const filterByType = useCallback(async (type) => {
        try {
            setLoading(true);
            setError(null);

            if (type) {
                const response = await apiService.getPetsByType(type);
                setPets(Array.isArray(response) ? response : []);
                console.log(`🏷️ Filter by type completed: Found ${response?.length || 0} ${type} pets`);
            } else {
                await loadPets(); // Reset to all pets if no type selected
            }

        } catch (error) {
            console.error('❌ Filter pets by type error:', error);
            setError('Không thể lọc thú cưng theo loại');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    /**
     * Filter pets by status (Active/Inactive)
     * @param {string} status - Status to filter by ('1' for active, '0' for inactive)
     */
    const filterByStatus = useCallback(async (status) => {
        try {
            setLoading(true);
            setError(null);

            if (status !== '') {
                const response = await apiService.getPetsByStatus(parseInt(status));
                setPets(Array.isArray(response) ? response : []);
                console.log(`📊 Filter by status completed: Found ${response?.length || 0} pets with status ${status}`);
            } else {
                await loadPets(); // Reset to all pets if no status selected
            }

        } catch (error) {
            console.error('❌ Filter pets by status error:', error);
            setError('Không thể lọc thú cưng theo trạng thái');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // ===== CRUD OPERATIONS =====
    /**
     * Create a new pet
     * @param {Object} petData - Pet data for creation
     * @returns {Object} Created pet data
     */
    const createPet = useCallback(async (petData) => {
        try {
            setLoading(true);
            const newPet = await apiService.createPet(petData);
            console.log('✅ Pet created successfully:', newPet.petDefaultName);
            await loadPets(); // Refresh the pet list
            return newPet;

        } catch (error) {
            console.error('❌ Create pet error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    /**
     * Update an existing pet
     * @param {number} petId - ID of the pet to update
     * @param {Object} petData - Updated pet data
     * @returns {Object} Updated pet data
     */
    const updatePet = useCallback(async (petId, petData) => {
        try {
            setLoading(true);
            const updatedPet = await apiService.updatePet(petId, petData);
            console.log('✅ Pet updated successfully:', updatedPet.petDefaultName);
            await loadPets(); // Refresh the pet list
            return updatedPet;

        } catch (error) {
            console.error('❌ Update pet error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    /**
     * Delete a pet (with optimistic UI update)
     * @param {number} petId - ID of the pet to delete
     * @returns {boolean} Success status
     */
    const deletePet = useCallback(async (petId) => {
        try {
            setLoading(true);
            await apiService.deletePet(petId);
            console.log('✅ Pet deleted successfully:', petId);

            // Optimistic update - immediately remove from UI
            setPets(prev => prev.filter(pet => pet.petId !== petId));
            return true;

        } catch (error) {
            console.error('❌ Delete pet error:', error);
            // If deletion fails, reload data to ensure consistency
            await loadPets();
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // ===== UTILITY FUNCTIONS =====
    /**
     * Get a specific pet by ID
     * @param {number} petId - ID of the pet to retrieve
     * @returns {Object} Pet data
     */
    const getPetById = useCallback(async (petId) => {
        try {
            const pet = await apiService.getPetById(petId);
            console.log('✅ Pet retrieved:', pet.petDefaultName);
            return pet;
        } catch (error) {
            console.error('❌ Get pet by ID error:', error);
            throw error;
        }
    }, []);

    /**
     * Test API connection for debugging purposes
     * @returns {Object} Test result
     */
    const testConnection = useCallback(async () => {
        try {
            const result = await apiService.testPetApi();
            console.log('✅ Pet API connection test successful');
            return result;
        } catch (error) {
            console.error('❌ Pet API connection test failed:', error);
            throw error;
        }
    }, []);

    // ===== INITIALIZATION =====
    // Auto-load pets when the hook is first used
    useEffect(() => {
        loadPets();
    }, [loadPets]);

    // ===== RETURN HOOK INTERFACE =====
    return {
        // ===== DATA STATE =====
        pets,           // Current list of pets (filtered/searched)
        loading,        // Loading state for UI feedback
        error,          // Error state for error handling
        searchTerm,     // Current search term
        typeFilter,     // Current type filter
        statusFilter,   // Current status filter

        // ===== CRUD OPERATIONS =====
        createPet,      // Create new pet
        updatePet,      // Update existing pet
        deletePet,      // Delete pet
        getPetById,     // Get specific pet by ID
        loadPets,       // Reload all pets

        // ===== SEARCH & FILTER =====
        searchPets,     // Search pets by keyword
        filterByType,   // Filter by pet type
        filterByStatus, // Filter by status
        setSearchTerm,  // Update search term state
        setTypeFilter,  // Update type filter state
        setStatusFilter,// Update status filter state

        // ===== UTILITIES =====
        testConnection, // Test API connectivity
        clearError: () => setError(null),    // Clear error state
        refreshData: loadPets                // Alias for loadPets
    };
};
