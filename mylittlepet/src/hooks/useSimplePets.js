/**
 * ============================================================================================
 * PET MANAGEMENT HOOK
 * ============================================================================================
 * 
 * This custom hook provides comprehensive pet data management functionality for the
 * application. It handles all pet-related operations including CRUD operations,
 * filtering, searching, and status management with full API integration.
 * 
 * FEATURES:
 * - Full CRUD operations (Create, Read, Update, Delete) for pets
 * - Advanced filtering by pet type and status
 * - Real-time search functionality across pet names
 * - Centralized loading and error state management
 * - API integration with proper error handling
 * - Optimized performance with useCallback for stable function references
 * 
 * USAGE PATTERNS:
 * 1. Data Loading: loadPets() - Fetches all pets from backend
 * 2. CRUD Operations: createPet(), updatePet(), deletePet()
 * 3. Filtering: filterByType(), filterByStatus() 
 * 4. Searching: searchPets() - Real-time search functionality
 * 5. State Access: pets, loading, error states
 * 
 * STATE MANAGEMENT:
 * - pets: Array - Main pets data collection
 * - loading: boolean - Loading state for async operations
 * - error: string/null - Error state for error handling
 * - searchTerm: string - Current search query
 * - typeFilter: string - Current type filter selection
 * - statusFilter: string - Current status filter selection
 * 
 * API INTEGRATION:
 * - Connects to backend pet management endpoints
 * - Handles authentication and authorization
 * - Provides comprehensive error handling and user feedback
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses useCallback for stable function references
 * - Minimizes unnecessary re-renders through proper state management
 * - Efficient filtering and searching algorithms
 * 
 * @returns {Object} Hook state and methods for comprehensive pet management
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimplePets = () => {
    // ============================================================================================
    // STATE MANAGEMENT
    // ============================================================================================
    
    /**
     * Core Pet Data State
     * - pets: Array of pet objects fetched from the backend
     * - loading: Boolean indicating if any async operation is in progress
     * - error: String containing error message or null if no error
     */
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Filter and Search States
     * These states control the filtering and searching functionality:
     * - searchTerm: String for filtering pets by name (real-time search)
     * - typeFilter: String for filtering pets by type (dog, cat, etc.)
     * - statusFilter: String for filtering pets by status (available, adopted, etc.)
     */
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // ============================================================================================
    // DATA LOADING OPERATIONS
    // ============================================================================================

    /**
     * Load all pets from the backend API
     * 
     * This function fetches the complete list of pets from the backend and
     * updates the local state. It handles loading states and error management
     * automatically.
     * 
     * Process:
     * 1. Sets loading state to true
     * 2. Makes API call to fetch pets
     * 3. Updates pets state with fetched data
     * 4. Handles any errors that occur
     * 5. Resets loading state
     * 
     * Error Handling:
     * - Logs errors to console for debugging
     * - Sets error state for UI feedback
     * - Maintains application stability
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

    // ============================================================================================
    // INITIALIZATION
    // ============================================================================================
    
    /**
     * Auto-load pets when the hook is first used
     * This ensures data is available immediately when component mounts
     */
    useEffect(() => {
        loadPets();
    }, [loadPets]);

    // ============================================================================================
    // RETURN HOOK INTERFACE
    // ============================================================================================
    return {
        // ===== CORE DATA STATE =====
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

        // ===== SEARCH & FILTER FUNCTIONS =====
        searchPets,     // Search pets by keyword
        filterByType,   // Filter by pet type
        filterByStatus, // Filter by status

        // ===== DATA REFRESH =====
        refreshData: loadPets // Refresh all pet data
    };
};
