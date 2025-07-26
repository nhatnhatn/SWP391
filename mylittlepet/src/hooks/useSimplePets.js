/**
 * ============================================================================================
 * PET MANAGEMENT HOOK
 * ============================================================================================
 * 
 * This custom hook provides comprehensive pet data management functionality for the
 * application. It handles all pet-related operations including CRUD operations
 * and data loading with full API integration.
 * 
 * FEATURES:
 * - Full CRUD operations (Create, Read, Update, Delete) for pets
 * - Centralized loading and error state management
 * - API integration with proper error handling
 * - Optimized performance with useCallback for stable function references
 * 
 * USAGE PATTERNS:
 * 1. Data Loading: loadPets() - Fetches all pets from backend
 * 2. CRUD Operations: createPet(), updatePet(), deletePet()
 * 3. State Access: pets, loading, error states
 * 
 * STATE MANAGEMENT:
 * - pets: Array - Main pets data collection
 * - loading: boolean - Loading state for async operations
 * - error: string/null - Error state for error handling
 * 
 * API INTEGRATION:
 * - Connects to backend pet management endpoints
 * - Handles authentication and authorization
 * - Provides comprehensive error handling and user feedback
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses useCallback for stable function references
 * - Minimizes unnecessary re-renders through proper state management
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

    // ============================================================================================
    // CRUD OPERATIONS
    // ============================================================================================
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
        pets,           // All pets data
        loading,        // Loading state for UI feedback
        error,          // Error state for error handling

        // ===== CRUD OPERATIONS =====
        createPet,      // Create new pet
        updatePet,      // Update existing pet
        deletePet,      // Delete pet

        // ===== DATA REFRESH =====
        refreshData: loadPets // Refresh all pet data
    };
};
