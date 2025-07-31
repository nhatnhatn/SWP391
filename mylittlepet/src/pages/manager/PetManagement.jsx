import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Power, Eye, Filter, ChevronLeft, ChevronRight, PawPrint, RotateCcw, ChevronUp, ChevronDown, X, Save, Edit } from 'lucide-react';
import { useSimplePets } from '../../hooks/useSimplePets';
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts';
import { useAuth } from '../../contexts/AuthContextV2';
import { useNotificationManager } from '../../hooks/useNotificationManager';
import apiService from '../../services/api';

// Notification Toast Component with right alignment and timing bar
const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show animation
        setIsVisible(true);

        // Progress bar animation - update every 50ms for smooth animation
        const updateInterval = 50;
        const decrementAmount = 100 / (duration / updateInterval);

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, updateInterval);

        // Auto close
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for slide-out animation
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
    const progressColor = type === 'success' ? 'bg-green-200' : 'bg-red-200';

    return (
        <div className={`fixed top-4 right-4 z-9999 max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className={`${bgColor} rounded-lg shadow-lg border border-white/20 overflow-hidden`}>
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
                                        <X className="h-4 w-4 text-white" />
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
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {/* Progress Bar */}
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

// Simple Pet Management Component
const PetManagement = () => {
    // Use auth hook to get current user
    const { user } = useAuth();

    // Extract adminId from user object
    const adminId = user?.id;

    console.log('👤 PetManagement: Current Admin ID:', adminId);
    console.log('👤 PetManagement: Full User Object:', user);

    // Use hook for data management
    const {
        pets,
        loading,
        error,
        createPet,
        updatePet,
        deletePet,
        refreshData
    } = useSimplePets();

    // Use shop products hook to manage related products when pet status changes
    const {
        shopProducts,
        updateShopProduct,
        refreshData: refreshShopProducts
    } = useSimpleShopProducts();

    // Use notification manager hook
    const {
        notification,
        showNotification,
        clearNotification,
        handleOperationWithNotification,
        handleFormSubmission
    } = useNotificationManager(refreshData);

    // Local filter and search state (managed by component)
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // State to store all unique pet types (for dropdown options)
    const [allPetTypes, setAllPetTypes] = useState([]);
    const [persistentPetTypes, setPersistentPetTypes] = useState([]);

    // Local error and success message states (kept for compatibility)
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Field validation errors
    const [fieldErrors, setFieldErrors] = useState({
        petDefaultName: '',
        petType: '',
        description: ''
    });

    // Cache admin usernames to avoid repeated API calls
    const [adminUsernames, setAdminUsernames] = useState({}); // { adminId: username }
    const [allAdmins, setAllAdmins] = useState([]); // Cache all admin users
    const [adminsLoaded, setAdminsLoaded] = useState(false); // Track if admins are loaded

    // Load all admins when component mounts
    useEffect(() => {
        const loadAllAdmins = async () => {
            try {
                console.log('🔍 PetManagement: Loading all admin users...');
                const admins = await apiService.getAllAdmins();

                setAllAdmins(admins);

                // Pre-populate username cache
                const usernameCache = {};
                admins.forEach(admin => {
                    usernameCache[admin.id] = admin.userName || admin.username || `Admin #${admin.id}`;
                });

                setAdminUsernames(usernameCache);
                setAdminsLoaded(true);

                console.log('✅ PetManagement: Loaded admin users:', admins.length, 'admins');
                console.log('✅ PetManagement: Username cache:', usernameCache);
            } catch (error) {
                console.error('❌ PetManagement: Failed to load admin users:', error);
                setAdminsLoaded(true); // Still mark as loaded to avoid infinite retries
            }
        };

        loadAllAdmins();
    }, []);

    // Function to get admin username by ID
    const getAdminUsername = async (adminId) => {
        if (!adminId) return 'Unknown';

        // If this is the current admin, return their name from context
        if (adminId === user?.id && user?.name) {
            const currentAdminName = user.name;
            // Cache this result
            setAdminUsernames(prev => ({
                ...prev,
                [adminId]: currentAdminName
            }));
            return currentAdminName;
        }

        // Check cache first (from pre-loaded admins)
        if (adminUsernames[adminId]) {
            console.log(`✅ PetManagement: Username found in cache - Admin ${adminId}: ${adminUsernames[adminId]}`);
            return adminUsernames[adminId];
        }

        // If admins are not loaded yet, wait and check cache again
        if (!adminsLoaded) {
            console.log(`⏳ PetManagement: Waiting for admins to load for ID: ${adminId}`);
            return 'Loading...';
        }

        try {
            console.log(`🔍 PetManagement: Attempting to fetch username for admin ID: ${adminId}`);

            // Try individual user lookup as fallback
            try {
                const response = await apiService.getUserById(adminId);
                const username = response.userName || response.username || `Admin #${adminId}`;

                // Cache the result
                setAdminUsernames(prev => ({
                    ...prev,
                    [adminId]: username
                }));

                console.log(`✅ PetManagement: Username fetched via getUserById - Admin ${adminId}: ${username}`);
                return username;
            } catch (userApiError) {
                console.log(`ℹ️ PetManagement: getUserById failed for admin ${adminId}, using fallback display`);

                // Final fallback - check if this admin exists in our loaded list
                const foundAdmin = allAdmins.find(admin => admin.id === adminId);
                if (foundAdmin) {
                    const username = foundAdmin.userName || foundAdmin.username || `Admin #${adminId}`;

                    // Cache the result
                    setAdminUsernames(prev => ({
                        ...prev,
                        [adminId]: username
                    }));

                    return username;
                }

                // Absolute fallback
                const fallbackName = `Admin #${adminId}`;

                // Cache the fallback result
                setAdminUsernames(prev => ({
                    ...prev,
                    [adminId]: fallbackName
                }));

                return fallbackName;
            }
        } catch (error) {
            console.error(`❌ PetManagement: Failed to process admin ${adminId}:`, error);

            // Final fallback
            const fallbackName = `Admin #${adminId}`;

            // Cache the fallback result to avoid repeated attempts
            setAdminUsernames(prev => ({
                ...prev,
                [adminId]: fallbackName
            }));

            return fallbackName;
        }
    };

    // Validation helper functions
    const validatePetName = (name) => {
        if (!name || name.trim().length === 0) return 'Pet name is required.';
        if (name.trim().length < 2) return 'Pet name must be at least 2 characters.';
        if (name.length > 50) return 'Pet name cannot exceed 50 characters.';
        return '';
    };

    const validatePetType = (type, isEditing = false, currentPetId = null) => {
        if (!type || type.trim().length === 0) return 'Pet type is required.';
        if (type.trim().length < 2) return 'Pet type must be at least 2 characters.';
        if (type.length > 30) return 'Pet type cannot exceed 30 characters.';
        const trimmed = type.trim();
        if (trimmed[0] !== trimmed[0].toUpperCase()) return 'First letter of pet type must be capitalized.';

        // Check for uniqueness
        const existingPet = pets?.find(pet => {
            const normalizedExistingType = pet.petType?.trim().toLowerCase();
            const normalizedNewType = trimmed.toLowerCase();

            // If editing, exclude the current pet from the check
            if (isEditing && currentPetId && pet.petId === currentPetId) {
                return false;
            }

            return normalizedExistingType === normalizedNewType;
        });

        if (existingPet) {
            return `Pet type "${trimmed}" already exists. Please choose a different name.`;
        }

        return '';
    };

    const validateDescription = (description) => {
        if (!description || description.trim() === '') {
            return 'Description is required and cannot be left blank.';
        }
        if (description && description.length > 1000) return 'Description cannot exceed 1000 characters.';
        return '';
    };

    // Clear field error helper
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    };

    // Handle input changes with validation
    const handlePetNameChange = (value) => {
        setEditForm({ ...editForm, petDefaultName: value });
        clearFieldError('petDefaultName');

        const error = validatePetName(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, petDefaultName: error }));
        }
    };

    const handleDescriptionChange = (value) => {
        setEditForm({ ...editForm, description: value });
        clearFieldError('description');

        const error = validateDescription(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, description: error }));
        }
    };

    // Show general error as notification
    useEffect(() => {
        if (error) {
            showNotification('An error occurred: ' + error, 'error');
        }
    }, [error]);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // Fetch all unique pet types when pets data changes
    useEffect(() => {
        if (pets && pets.length > 0) {
            const uniqueTypes = [...new Set(pets.map(pet => pet.petType).filter(type => type))];
            setAllPetTypes(uniqueTypes);

            // Only update persistent types if it's empty (initial load) or if new types are found
            if (persistentPetTypes.length === 0) {
                setPersistentPetTypes(uniqueTypes);
            } else {
                // Add any new types that aren't already in the persistent list
                const newTypes = uniqueTypes.filter(type => !persistentPetTypes.includes(type));
                if (newTypes.length > 0) {
                    setPersistentPetTypes(prev => [...prev, ...newTypes]);
                }
            }
        }
    }, [pets, persistentPetTypes]);    // Local UI state
    const [selectedPet, setSelectedPet] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // State to store admin username for selected pet
    const [selectedPetAdminUsername, setSelectedPetAdminUsername] = useState('Loading...');

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });    // Edit state for detail modal
    const [editModal, setEditModal] = useState({ isOpen: false, pet: null });
    const [editForm, setEditForm] = useState({
        petType: '',
        petDefaultName: '',
        description: '',
        petStatus: 1
    });

    // Original form data to track changes
    const [originalFormData, setOriginalFormData] = useState({
        petType: '',
        petDefaultName: '',
        description: '',
        petStatus: 1
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Apply filtering to pets first
    const filteredPets = useMemo(() => {
        if (!Array.isArray(pets)) return [];

        return pets.filter(pet => {
            // Search filter
            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                const petName = (pet.petDefaultName || '').toLowerCase();
                const petType = (pet.petType || '').toLowerCase();
                const description = (pet.description || '').toLowerCase();

                if (!petName.includes(searchLower) &&
                    !petType.includes(searchLower) &&
                    !description.includes(searchLower)) {
                    return false;
                }
            }

            // Type filter
            if (typeFilter && pet.petType !== typeFilter) {
                return false;
            }

            // Status filter
            if (statusFilter !== '' && pet.petStatus !== parseInt(statusFilter)) {
                return false;
            }

            return true;
        });
    }, [pets, searchTerm, typeFilter, statusFilter]);

    // Apply sorting to filtered pets
    const sortedPets = useMemo(() => {
        if (!sortConfig.key) return filteredPets;

        return [...filteredPets].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredPets, sortConfig]);

    // Calculate pagination
    const totalItems = sortedPets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPets = sortedPets.slice(startIndex, endIndex);

    // Calculate statistics
    const totalPets = pets.length;
    const activePets = pets.filter(pet => pet.petStatus === 1).length;
    const inactivePets = pets.filter(pet => pet.petStatus === 0).length;

    // Reset to page 1 when pets data changes (search, filter)
    useEffect(() => {
        setCurrentPage(1);
    }, [pets.length, searchTerm, typeFilter, statusFilter]);

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    // Handle type filter
    const handleTypeFilter = (type) => {
        setTypeFilter(type);
    };

    // Handle status filter
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };    // View pet details
    const handleView = async (pet) => {
        setSelectedPet(pet);

        // Load admin username for the pet creator
        setSelectedPetAdminUsername('Loading...');

        if (pet.adminId) {
            try {
                const username = await getAdminUsername(pet.adminId);
                setSelectedPetAdminUsername(username);
            } catch (error) {
                console.error('❌ Failed to load admin username:', error);
                setSelectedPetAdminUsername('Unknown Admin');
            }
        } else {
            setSelectedPetAdminUsername('Unknown');
        }
    };

    // Close pet detail modal
    const handleClosePetDetail = () => {
        setSelectedPet(null);
        setSelectedPetAdminUsername('Loading...');
    };    // Handle Edit from detail modal
    const handleEdit = (pet) => {
        const formData = {
            petType: pet.petType || '',
            petDefaultName: pet.petDefaultName || '',
            description: pet.description || '',
            petStatus: pet.petStatus || 1
        };

        setEditForm(formData);
        setOriginalFormData(formData); // Store original data for comparison
        setEditModal({ isOpen: true, pet: pet });
    };

    // Check if form has changes
    const hasFormChanges = useMemo(() => {
        return (
            editForm.petType !== originalFormData.petType ||
            editForm.petDefaultName !== originalFormData.petDefaultName ||
            editForm.description !== originalFormData.description ||
            editForm.petStatus !== originalFormData.petStatus
        );
    }, [editForm, originalFormData]);

    // Check if create form has any content (for create modal)
    const hasCreateFormContent = useMemo(() => {
        return (
            (editForm.petType && editForm.petType.trim().length > 0) ||
            (editForm.petDefaultName && editForm.petDefaultName.trim().length > 0) ||
            (editForm.description && editForm.description.trim().length > 0) ||
            editForm.petStatus !== 1 // Default status is 1, so if it's different, user changed it
        );
    }, [editForm]);    // Submit edit from detail modal
    const handleEditSubmit = async () => {
        try {
            // Clear previous errors
            setFieldErrors({ petDefaultName: '', petType: '', description: '' });

            // Validate all fields
            const errors = {};
            let isValid = true;

            const nameError = validatePetName(editForm.petDefaultName);
            if (nameError) {
                errors.petDefaultName = nameError;
                isValid = false;
            }

            const typeError = validatePetType(editForm.petType, true, editModal.pet.petId);
            if (typeError) {
                errors.petType = typeError;
                isValid = false;
            }

            const descError = validateDescription(editForm.description);
            if (descError) {
                errors.description = descError;
                isValid = false;
            }

            if (!isValid) {
                setFieldErrors(errors);
                showNotification('Please check and fix the errors in the form.', 'error');
                return;
            }

            const updatedData = {
                ...editForm,
                petType: editForm.petType.trim(),
                petDefaultName: editForm.petDefaultName.trim(),
                petId: editModal.pet.petId,
                adminId: adminId // Include adminId for tracking updates
            };

            console.log('🐾 Updating pet with admin ID:', { adminId, petId: editModal.pet.petId, updatedData });
            await updatePet(editModal.pet.petId, updatedData);
            setEditModal({ isOpen: false, pet: null });
            handleClosePetDetail(); // Use the new function to properly reset state
            // Clear any previous errors and show success message
            setLocalError('');
            showNotification('Pet updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update pet:', error);
            showNotification('Update failed: ' + (error.message || 'Unknown error'), 'error');
        }
    };

    // Cancel edit
    const handleEditCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        const resetFormData = {
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        };
        setEditForm(resetFormData);
        setOriginalFormData(resetFormData);
    };

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Get sort icon
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-4 h-4 inline ml-1" /> :
            <ChevronDown className="w-4 h-4 inline ml-1" />;
    };

    // Open create modal
    const handleCreate = () => {
        const resetFormData = {
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        };
        setEditForm(resetFormData);
        setOriginalFormData(resetFormData); // Set original data for create mode
        setCreateModal(true);
    };

    // Submit create
    const handleCreateSubmit = async () => {
        try {
            // Clear previous errors
            setFieldErrors({ petDefaultName: '', petType: '', description: '' });

            // Validate all fields
            const errors = {};
            let isValid = true;

            const nameError = validatePetName(editForm.petDefaultName);
            if (nameError) {
                errors.petDefaultName = nameError;
                isValid = false;
            }

            const typeError = validatePetType(editForm.petType, false, null);
            if (typeError) {
                errors.petType = typeError;
                isValid = false;
            }

            const descError = validateDescription(editForm.description);
            if (descError) {
                errors.description = descError;
                isValid = false;
            }

            if (!isValid) {
                setFieldErrors(errors);
                showNotification('Please check and fix the errors in the form.', 'error');
                return;
            }

            const createData = {
                ...editForm,
                petType: editForm.petType.trim(),
                petDefaultName: editForm.petDefaultName.trim(),
                adminId: user?.id // Add adminId from current user
            };

            console.log('🐾 Creating pet with admin ID:', { adminId: user?.id, createData });
            await createPet(createData);
            setCreateModal(false);
            // Clear any previous errors and show success message
            setLocalError('');
            showNotification('Pet created successfully!', 'success');
        } catch (error) {
            console.error('Failed to create pet:', error);
            showNotification('Pet creation failed: ' + (error.message || 'Unknown error'), 'error');
        }
    };

    // Handle disable (instead of delete)
    const handleDelete = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 0) {
            showNotification('This pet is already disabled!', 'error');
            return;
        }

        // Find related shop products before disabling the pet
        const relatedProducts = shopProducts?.filter(product =>
            product.petID === petId && product.status === 1
        ) || [];

        const confirmMessage = relatedProducts.length > 0
            ? `Are you sure you want to disable this pet? \n\nNote: This will also automatically disable ${relatedProducts.length} related products in the shop.`
            : 'Are you sure you want to disable this pet?';

        setConfirmDialog({
            isOpen: true,
            title: 'Confirm disable',
            message: confirmMessage,
            onConfirm: async () => {
                try {
                    // Update pet status to 0 (disabled) first
                    await updatePet(petId, { ...pet, petStatus: 0 });

                    // Disable all related shop products
                    if (relatedProducts.length > 0) {
                        for (const product of relatedProducts) {
                            try {
                                await updateShopProduct(product.shopProductId, {
                                    ...product,
                                    status: 0
                                });
                            } catch (productError) {
                                console.error(`Failed to disable product ${product.shopProductId}:`, productError);
                            }
                        }

                        // Refresh shop products data
                        if (refreshShopProducts) {
                            await refreshShopProducts();
                        }

                        showNotification(
                            `Pet disabled successfully! Automatically disabled ${relatedProducts.length} related products.`,
                            'success'
                        );
                    } else {
                        showNotification('Pet disabled successfully!', 'success');
                    }

                    // Clear any previous errors
                    setLocalError('');
                } catch (error) {
                    console.error('Failed to disable pet:', error);
                    showNotification('Disable failed: ' + (error.message || 'Unknown error'), 'error');
                }
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    // Handle enable pet
    const handleEnable = async (petId) => {
        const pet = pets.find(p => p.petId === petId);
        if (!pet) return;

        if (pet.petStatus === 1) {
            showNotification('This pet is already activated!', 'error');
            return;
        }

        // Find related inactive shop products
        const relatedInactiveProducts = shopProducts?.filter(product =>
            product.petID === petId && product.status === 0
        ) || [];

        // Filter products that can be automatically reactivated (quantity > 0)
        const eligibleProducts = relatedInactiveProducts.filter(product =>
            product.quantity > 0
        );

        // Products that cannot be auto-reactivated (quantity = 0)
        const ineligibleProducts = relatedInactiveProducts.filter(product =>
            product.quantity === 0
        );

        try {
            // Update pet status to 1 (active)
            await updatePet(petId, { ...pet, petStatus: 1 });

            // Automatically reactivate eligible products
            let reactivatedCount = 0;
            if (eligibleProducts.length > 0) {
                for (const product of eligibleProducts) {
                    try {
                        await updateShopProduct(product.shopProductId, {
                            ...product,
                            status: 1
                        });
                        reactivatedCount++;
                    } catch (productError) {
                        console.error(`Failed to reactivate product ${product.shopProductId}:`, productError);
                    }
                }

                // Refresh shop products data
                if (refreshShopProducts) {
                    await refreshShopProducts();
                }
            }

            // Create appropriate success message based on results
            let message = 'Pet activated successfully!';

            if (reactivatedCount > 0 && ineligibleProducts.length > 0) {
                message += ` Automatically activated ${reactivatedCount} related products. ${ineligibleProducts.length} products cannot be activated due to quantity = 0.`;
            } else if (reactivatedCount > 0) {
                message += ` Automatically activated ${reactivatedCount} related products.`;
            } else if (ineligibleProducts.length > 0) {
                message += ` Note: ${ineligibleProducts.length} related products remain disabled due to quantity = 0.`;
            }

            showNotification(message, 'success');

            // Clear any previous errors
            setLocalError('');
        } catch (error) {
            console.error('Failed to enable pet:', error);
            showNotification('Activation failed: ' + (error.message || 'Unknown error'), 'error');
        }
    };
    // Cancel forms
    const handleCancel = () => {
        setEditModal({ isOpen: false, pet: null });
        setCreateModal(false);
        const resetFormData = {
            petType: '',
            petDefaultName: '',
            description: '',
            petStatus: 1
        };
        setEditForm(resetFormData);
        setOriginalFormData(resetFormData);
    };

    // Handle pet type change with validation
    const handlePetTypeChange = (value) => {
        // Auto-capitalize first letter and format the input
        const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        setEditForm({ ...editForm, petType: formattedValue });
        clearFieldError('petType');

        // Determine if we're in edit mode and get current pet ID
        const isEditing = editModal.isOpen;
        const currentPetId = isEditing ? editModal.pet?.petId : null;

        const error = validatePetType(formattedValue, isEditing, currentPetId);
        if (error) {
            setFieldErrors(prev => ({ ...prev, petType: error }));
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        return status === 1 ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Disabled
            </span>
        );
    };

    // Get pet type badge with dynamic styling
    const getPetTypeBadge = (petType) => {
        if (!petType) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm">
                    N/A
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm">
                {petType}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                            <PawPrint className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Pet Management</h1>

                        </div>
                    </div>

                    {/* Desktop Statistics */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <PawPrint className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Total Pets</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{totalPets}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{activePets}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold text-sm">✕</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{inactivePets}</p>
                        </div>

                    </div>
                </div>

                {/* Mobile Statistics */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className={`grid gap-4 ${adminId ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <PawPrint className="h-4 w-4 text-blue-600" />
                                <p className="text-xs font-medium text-gray-600">Total Pets</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">{totalPets}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Active</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">{activePets}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Inactive</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">{inactivePets}</p>
                        </div>

                        {adminId && (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="text-purple-600 font-bold text-sm">👤</span>
                                    <p className="text-xs font-medium text-gray-600">Admin ID</p>
                                </div>
                                <p className="text-lg font-bold text-purple-600">#{adminId}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}

            {/* Pet Details Modal */}
            {selectedPet && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <h3 className="text-4xl font-bold text-white">Pet Details</h3>
                            </div>

                        </div>

                        {/* Content with Enhanced Design */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 to-white">
                            {/* Pet Name & Type Header Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        {/* Right Side: The label */}
                                        <div>
                                            <h1 className="text-3xl font-bold text-cyan-600">
                                                Pet Name
                                            </h1>
                                        </div>
                                        {/* Left Side: The pet's name */}
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-800">
                                                {selectedPet.petDefaultName || 'No name provided'}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Information Cards Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Info Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-600">Pet ID</span>
                                                    <span className="text-sm font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        #{selectedPet.petId}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-2 mt-2">
                                                    <span className="text-sm font-medium text-gray-600">Pet Type</span>
                                                    <div>
                                                        {selectedPet.petType ? getPetTypeBadge(selectedPet.petType) : (
                                                            <span className="text-sm text-gray-500 italic">Not specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Admin Creator Info */}
                                            <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-600">Created by Admin</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                            {selectedPetAdminUsername === 'Loading...' ? (
                                                                <span className="text-sm text-gray-500 italic flex items-center gap-1">
                                                                    <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                                                                    Loading...
                                                                </span>
                                                            ) : selectedPetAdminUsername ? (
                                                                selectedPetAdminUsername
                                                            ) : (
                                                                <span className="text-sm text-gray-500 italic">Unknown</span>
                                                            )}
                                                        </span>
                                                        {selectedPet.adminId === adminId}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Description Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <h4 className="text-lg font-semibold text-gray-800">Pet Status and Description</h4>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <span className="text-sm font-medium text-gray-600 block mb-2">Activity Status</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedPet.petStatus === 1 ? (
                                                        <>
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-semibold text-green-700">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                            <span className="text-sm font-semibold text-red-700">Inactive</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                <span className="text-sm font-medium text-gray-600 block mb-3">Pet Description</span>
                                                {selectedPet.description ? (
                                                    <div className="space-y-2">
                                                        <div className={`text-sm text-gray-700 leading-relaxed break-words ${selectedPet.description.length > 150 && !selectedPet.expanded
                                                            ? 'line-clamp-3'
                                                            : ''
                                                            }`}>
                                                            {selectedPet.description}
                                                        </div>
                                                        {selectedPet.description.length > 150 && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPet(prev => ({
                                                                        ...prev,
                                                                        expanded: !prev.expanded
                                                                    }));
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors duration-200 flex items-center gap-1"
                                                            >
                                                                {selectedPet.expanded ? (
                                                                    <>
                                                                        <ChevronUp className="h-3 w-3" />
                                                                        Hide
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-3 w-3" />
                                                                        View more
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-gray-400 mb-2">
                                                            <Eye className="h-8 w-8 mx-auto opacity-50" />
                                                        </div>
                                                        <span className="text-sm text-gray-400 italic">
                                                            No description available for this pet
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleClosePetDetail()}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleEdit(selectedPet)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update Pet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 border-b border-blue-100">
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
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700"> Search & Create new pet</span>
                        </div>

                        <div className="space-y-4">
                            {/* Search Input Row */}
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        <input
                                            type="text"
                                            placeholder="Enter pet name to search..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                        />
                                    </div>
                                </div>


                                <button
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3.5 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg whitespace-nowrap transform hover:scale-105"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create new pet
                                </button>
                            </div>


                            {/* Search Results Info */}
                            {searchTerm && (<div className="bg-blue-100 rounded-md p-3 border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                                    <p className="text-sm text-blue-800 font-medium">
                                        Showing search results for: "<span className="font-semibold text-blue-900">{searchTerm}</span>"
                                    </p>
                                    <button
                                        onClick={() => handleSearch({ target: { value: '' } })}
                                        className="ml-auto text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                            )}
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
                                {/* Active Filters Count */}
                                {(typeFilter || statusFilter !== '' || sortConfig.key) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                        {[typeFilter, statusFilter !== '' ? statusFilter : null, sortConfig.key].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Collapsible Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Content Filters Group */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Filter by Content</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Type Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Pet type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={typeFilter}
                                                    onChange={(e) => handleTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="">Select Pet Type</option>
                                                    {/* Use persistent pet types that don't change when filters are applied */}
                                                    {persistentPetTypes.map(petType => (
                                                        <option key={petType} value={petType}>
                                                            {petType}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {typeFilter && (
                                                <div className="mt-2 p-2 bg-green-100 rounded-md">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-green-700 font-medium">
                                                            Currently filtering: {
                                                                typeFilter
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Status
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> All Status</option>
                                                    <option value="1"> Active</option>
                                                    <option value="0"> Inactive</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {statusFilter !== '' && (
                                                <div className="mt-2 p-2 bg-green-100 rounded-md">
                                                    <p className="text-xs text-green-700 font-medium">
                                                        Currently filtering: {statusFilter === '1' ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sort Controls Group */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Sort Data</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Sort Field Filter */}
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
                                                    <option value=""> No sorting</option>
                                                    <option value="petDefaultName"> Pet Name</option>
                                                    <option value="petType"> Pet type</option>
                                                    <option value="petStatus"> Status</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction Filter */}
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
                                                        Currently sorting by: <span className="font-bold">
                                                            {sortConfig.key === 'petDefaultName' && 'Pet Name'}
                                                            {sortConfig.key === 'petType' && 'Pet Type'}
                                                            {sortConfig.key === 'petStatus' && 'Status'}
                                                        </span> ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
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



                                {/* Reset Actions Group */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Actions</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                handleSearch({ target: { value: '' } });
                                                handleTypeFilter('');
                                                handleStatusFilter('');
                                                setSortConfig({ key: null, direction: 'asc' });
                                            }}
                                            disabled={!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key}
                                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {!searchTerm && !typeFilter && statusFilter === '' && !sortConfig.key
                                                ? 'No filters'
                                                : 'Clear all filters'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(searchTerm || typeFilter || statusFilter !== '' || sortConfig.key) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    searchTerm && 'Search',
                                                    typeFilter && 'Type',
                                                    statusFilter !== '' && 'Status',
                                                    sortConfig.key && 'Sort'
                                                ].filter(Boolean).length} filters applied
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pet Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-blue-600 to-cyan-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">PETS LIST</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[18%]" />
                                <col className="w-[18%]" />
                                <col className="w-[40%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-blue-600 to-cyan-600 border-b-4 border-blue-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Pet Name
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Pet Type
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Pet Description
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-blue-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Status
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        <span className="flex items-center justify-center gap-2">
                                            Action
                                        </span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {currentPets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">

                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">No pet data</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {searchTerm || typeFilter || statusFilter !== '' ?
                                                            'No pets found matching the filters.' :
                                                            'Start with create new pet.'
                                                        }
                                                    </p>
                                                    {!searchTerm && !typeFilter && statusFilter === '' && (
                                                        <button
                                                            onClick={handleCreate}
                                                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Create new pet
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentPets.map((pet) => (
                                        <tr key={pet.petId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200">
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    <div className="text-sm font-bold text-gray-900 break-words" title={pet.petDefaultName}>
                                                        {pet.petDefaultName || 'Unnamed'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    {getPetTypeBadge(pet.petType)}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-900 break-words max-w-xs mx-auto" title={pet.description}>
                                                        {pet.description || 'No description'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    {pet.petStatus === 1 ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-sm">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleView(pet)}
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="View pet details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {pet.petStatus === 1 ? (
                                                        <button
                                                            onClick={() => handleDelete(pet.petId)}
                                                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                            title="Disable pet"
                                                        >
                                                            <Power className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEnable(pet.petId)}
                                                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                            title="Activate"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-t border-blue-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous Page</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${currentPage === page
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md transform scale-105'
                                            : 'bg-white text-blue-700 border border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-800 shadow-sm'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <span className="hidden sm:inline">Next Page</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Pet Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <h3 className="text-4xl font-bold text-white">Update Pet</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-br from-gray-50 to-white">
                            {/* Header Summary */}
                            <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        {/* Right Side: The label */}
                                        <div>
                                            <h1 className="text-3xl font-bold text-cyan-600">
                                                Pet name
                                            </h1>
                                        </div>
                                        {/* Left Side: The pet's name */}
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-800">
                                                {selectedPet.petDefaultName || 'No name is set'}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Grid Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Pet Name Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Pet Name
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.petDefaultName}
                                            onChange={(e) => handlePetNameChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.petDefaultName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter pet name"
                                            minLength="2"
                                        />
                                        {fieldErrors.petDefaultName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.petDefaultName}
                                            </p>
                                        )}

                                    </div>

                                    {/* Pet Type Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-5">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Pet Type
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.petType || ''}
                                            onChange={(e) => handlePetTypeChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.petType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter pet type"
                                        />
                                        {fieldErrors.petType && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.petType}
                                            </p>
                                        )}
                                        {/* <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <p className="text-sm text-yellow-700 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                Pet type cannot be edited after creation.
                                            </p>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Status Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Pet Status
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.petStatus}
                                                onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                            >
                                                <option value={1}> Active</option>
                                                <option value={0}> Inactive</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Description Field */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">
                                                Pet Description
                                            </label>
                                        </div>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => handleDescriptionChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none ${fieldErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter detailed description about the pet..."
                                            rows="1"
                                        />
                                        {fieldErrors.description && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleEditCancel}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        disabled={
                                            !hasFormChanges ||
                                            !editForm.petType ||
                                            editForm.petType.length < 2 ||
                                            !editForm.petDefaultName ||
                                            editForm.petDefaultName.length < 2 ||
                                            Object.values(fieldErrors).some(error => error !== '')
                                        }
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update Pet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Pet Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-bold text-white">Create new pet</h3>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-br from-gray-50 to-white">
                            <div className="space-y-6">
                                {/* Pet Name */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Pet Name
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.petDefaultName}
                                        onChange={(e) => handlePetNameChange(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.petDefaultName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter pet name"
                                        minLength="2"
                                    />
                                    {fieldErrors.petDefaultName && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {fieldErrors.petDefaultName}
                                        </p>
                                    )}

                                </div>

                                {/* Pet Type */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Pet Type
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.petType || ''}
                                        onChange={(e) => handlePetTypeChange(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.petType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter pet type (e.g. Dog, Cat, Bird...)"
                                        required
                                        minLength="2"
                                    />
                                    {fieldErrors.petType && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {fieldErrors.petType}
                                        </p>
                                    )}

                                </div>

                                {/* Pet Description */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Pet Description
                                        </label>
                                    </div>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => handleDescriptionChange(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none ${fieldErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter detailed description about the pet..."
                                        rows="3"
                                    />
                                    {fieldErrors.description && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {fieldErrors.description}
                                        </p>
                                    )}
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 flex items-center justify-end gap-2">
                                            <span>{editForm.description?.length || 0} / 1000 characters</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Status */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">
                                            Pet Status
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={editForm.petStatus}
                                            onChange={(e) => setEditForm({ ...editForm, petStatus: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value={1}> Active</option>
                                            <option value={0}> Inactive</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateSubmit}
                                        disabled={
                                            !hasCreateFormContent ||
                                            !editForm.petType ||
                                            editForm.petType.length < 2 ||
                                            !editForm.petDefaultName ||
                                            editForm.petDefaultName.length < 2 ||
                                            !editForm.description ||
                                            Object.values(fieldErrors).some(error => error !== '')
                                        }
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create new pet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <X className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{confirmDialog.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetManagement;
