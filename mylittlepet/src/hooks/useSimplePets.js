// React Hook for Pet Management - Integrated with Backend API
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSimplePets = () => {
    // Basic state management
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Load pets from backend
    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllPets();
            console.log('✅ Pets loaded:', response);

            const allPets = Array.isArray(response) ? response : [];
            setPets(allPets);

        } catch (error) {
            console.error('Load pets error:', error);
            setError('Không thể tải danh sách thú cưng');
            setPets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Search pets
    const searchPets = useCallback(async (keyword) => {
        try {
            setLoading(true);
            setError(null);

            if (keyword.trim()) {
                const response = await apiService.searchPets(keyword);
                setPets(Array.isArray(response) ? response : []);
            } else {
                await loadPets();
            }

        } catch (error) {
            console.error('Search pets error:', error);
            setError('Không thể tìm kiếm thú cưng');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Filter pets by type
    const filterByType = useCallback(async (type) => {
        try {
            setLoading(true);
            setError(null);

            if (type) {
                const response = await apiService.getPetsByType(type);
                setPets(Array.isArray(response) ? response : []);
            } else {
                await loadPets();
            }

        } catch (error) {
            console.error('Filter pets by type error:', error);
            setError('Không thể lọc thú cưng theo loại');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Filter pets by status
    const filterByStatus = useCallback(async (status) => {
        try {
            setLoading(true);
            setError(null);

            if (status !== '') {
                const response = await apiService.getPetsByStatus(parseInt(status));
                setPets(Array.isArray(response) ? response : []);
            } else {
                await loadPets();
            }

        } catch (error) {
            console.error('Filter pets by status error:', error);
            setError('Không thể lọc thú cưng theo trạng thái');
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Create pet
    const createPet = useCallback(async (petData) => {
        try {
            setLoading(true);
            const newPet = await apiService.createPet(petData);
            console.log('✅ Pet created:', newPet);
            await loadPets(); // Refresh list
            return newPet;

        } catch (error) {
            console.error('Create pet error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Update pet
    const updatePet = useCallback(async (petId, petData) => {
        try {
            setLoading(true);
            const updatedPet = await apiService.updatePet(petId, petData);
            console.log('✅ Pet updated:', updatedPet);
            await loadPets(); // Refresh list
            return updatedPet;

        } catch (error) {
            console.error('Update pet error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Delete pet
    const deletePet = useCallback(async (petId) => {
        try {
            setLoading(true);
            await apiService.deletePet(petId);
            console.log('✅ Pet deleted:', petId);
            await loadPets(); // Refresh list
            return true;

        } catch (error) {
            console.error('Delete pet error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadPets]);

    // Get pet by ID
    const getPetById = useCallback(async (petId) => {
        try {
            const pet = await apiService.getPetById(petId);
            return pet;
        } catch (error) {
            console.error('Get pet by ID error:', error);
            throw error;
        }
    }, []);

    // Test connection
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

    // Auto-load on mount
    useEffect(() => {
        loadPets();
    }, [loadPets]);

    // Return all functions and state
    return {
        // Data
        pets,
        loading,
        error,
        searchTerm,
        typeFilter,
        statusFilter,

        // CRUD Actions
        loadPets,
        createPet,
        updatePet,
        deletePet,
        getPetById,

        // Filter & Search Actions
        searchPets,
        filterByType,
        filterByStatus,
        setSearchTerm,
        setTypeFilter,
        setStatusFilter,

        // Utils
        testConnection,
        clearError: () => setError(null),
        refreshData: loadPets
    };
};
