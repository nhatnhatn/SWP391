// ================================================================================================
// SHOP PRODUCT MANAGEMENT COMPONENT
// ================================================================================================
// This is the main component for managing shop products in the pet store application.
// It provides a complete interface for:
// - Viewing all products in a paginated table
// - Creating new products with validation
// - Editing existing products
// - Managing product status (active/inactive)
// - Real-time search and filtering
// - Image handling with Google Drive integration
// ================================================================================================

// React core imports for component functionality
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Lucide React icons for UI elements (search, buttons, navigation, etc.)
import {
    Search, Plus, Edit, Power, Eye, Filter, Package, Store, DollarSign,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Save, RotateCcw, PawPrint
} from 'lucide-react';

// Custom hooks for data management
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts'; // Handles product CRUD operations
import { useSimplePets } from '../../hooks/useSimplePets';                 // Manages pet data for product relationships
import { useAuth } from '../../contexts/AuthContextV2';                    // Provides user authentication context
import { useNotificationManager } from '../../hooks/useNotificationManager'; // Handles success/error notifications

// Utility functions
import { convertGoogleDriveLink } from '../../utils/helpers'; // Converts Google Drive sharing links to direct image URLs

// ================================================================================================
// PRODUCT IMAGE COMPONENT
// ================================================================================================
// This component handles product image display with intelligent fallback mechanisms.
// Google Drive images often have CORS (Cross-Origin Resource Sharing) issues, so this
// component tries multiple URL formats until one works successfully.
//
// Props:
// - imageUrl: Original Google Drive sharing URL
// - productName: Used for alt text accessibility
// - className: CSS classes for styling the container
// ================================================================================================

const ProductImage = ({ imageUrl, productName, className }) => {
    // Track which fallback URL we're currently trying (starts at index 0)
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

    // Track if all image URLs have failed to load
    const [imageError, setImageError] = useState(false);

    // Generate multiple fallback URLs from the original Google Drive link
    // useMemo ensures this only recalculates when imageUrl changes
    const fallbackUrls = useMemo(() => {
        // If no image URL provided, return empty array
        if (!imageUrl) return [];

        // Convert sharing URL to direct access URL
        const convertedUrl = convertGoogleDriveLink(imageUrl);

        // Extract file ID from the converted URL
        const fileId = convertedUrl.split('id=')[1];

        // If we can't extract file ID, just use the converted URL
        if (!fileId) return [convertedUrl];

        return [
            // Primary: Google User Content with specific dimensions - best CORS compatibility
            `https://lh3.googleusercontent.com/d/${fileId}=w400-h400-c`,

            // Secondary: Google Drive thumbnail service
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,

            // Tertiary: Basic Google User Content without dimensions
            `https://lh3.googleusercontent.com/d/${fileId}`,

            // Quaternary: Google Drive direct view URL
            `https://drive.google.com/uc?export=view&id=${fileId}`,

            // Quinary: Another Google Drive format
            `https://drive.google.com/uc?id=${fileId}`,

            // Last resort: Use the originally converted URL
            convertedUrl
        ];
    }, [imageUrl]); // Only recalculate when imageUrl prop changes

    // Reset to first URL and clear error state when imageUrl changes
    useEffect(() => {
        setCurrentUrlIndex(0);
        setImageError(false);
    }, [imageUrl]);

    /**
     * Handle image loading errors by trying the next fallback URL
     * This function is called by the img element's onError event
     */
    const handleImageError = () => {
        console.log(`❌ Image failed to load (attempt ${currentUrlIndex + 1}):`, fallbackUrls[currentUrlIndex]);

        // If we have more URLs to try, move to the next one
        if (currentUrlIndex < fallbackUrls.length - 1) {
            setCurrentUrlIndex(prev => prev + 1);
            setImageError(false); // Reset error state to try again
            console.log(`🔄 Trying fallback URL ${currentUrlIndex + 2}:`, fallbackUrls[currentUrlIndex + 1]);
        } else {
            // All URLs failed - show error state
            setImageError(true);
            console.log('💥 All image URLs failed to load');
        }
    };

    /**
     * Handle successful image loading
     * This function is called by the img element's onLoad event
     */
    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully:', fallbackUrls[currentUrlIndex]);
        setImageError(false);
    };

    // ============================================================================================
    // RENDER LOGIC FOR DIFFERENT IMAGE STATES
    // ============================================================================================

    // Case 1: No image URL provided - show placeholder with package icon
    if (!imageUrl) {
        return (
            <div className={`bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center ${className}`}>
                <Package className="h-8 w-8 text-gray-400" />
            </div>
        );
    }

    // Case 2: All image URLs failed - show error state with retry option
    if (imageError) {
        return (
            <div className={`bg-red-50 rounded-lg border border-red-300 flex flex-col items-center justify-center p-2 ${className}`}>
                <Package className="h-6 w-6 text-red-400 mb-1" />
                <span className="text-xs text-red-600 text-center">CORS Error</span>
                {/* Direct link to view image in new tab */}
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 text-center"
                >
                    View Image
                </a>
                {/* Retry button to start fallback process again */}
                <button
                    onClick={() => {
                        setCurrentUrlIndex(0);
                        setImageError(false);
                    }}
                    className="text-xs text-gray-600 hover:underline mt-1"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Case 3: Display the image using current fallback URL
    return (
        <div className={`relative ${className}`}>
            <img
                src={fallbackUrls[currentUrlIndex]}  // Use current fallback URL
                alt={productName}                     // Accessibility alt text
                onError={handleImageError}           // Trigger fallback on error
                onLoad={handleImageLoad}             // Log success and clear error state
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                style={{ display: 'block' }}        // Ensure image displays as block element
            />
        </div>
    );
};

// ================================================================================================
// NOTIFICATION TOAST COMPONENT
// ================================================================================================
// This component displays success/error messages as animated toast notifications.
// Features:
// - Slides in from the right side of the screen
// - Auto-dismisses after a specified duration (default 3 seconds)
// - Shows a progress bar indicating remaining time
// - Can be manually dismissed by clicking the X button
// - Different colors for success (green) and error (red) messages
//
// Props:
// - message: The text to display in the notification
// - type: Either 'success' or 'error' to determine styling
// - onClose: Callback function called when notification is dismissed
// - duration: How long to show the notification in milliseconds (default 3000)
// ================================================================================================

const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    // Track the progress bar percentage (starts at 100%, decreases to 0%)
    const [progress, setProgress] = useState(100);

    // Track visibility for slide-in/slide-out animations
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Start with slide-in animation
        setIsVisible(true);

        // Set up progress bar animation - updates every 50ms for smooth movement
        const updateInterval = 50; // Update frequency in milliseconds
        const decrementAmount = 100 / (duration / updateInterval); // How much to decrease each update

        // Interval to update progress bar
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress; // Don't go below 0%
            });
        }, updateInterval);

        // Timer to auto-dismiss the notification
        const timer = setTimeout(() => {
            setIsVisible(false); // Start slide-out animation
            setTimeout(onClose, 300); // Wait for animation to complete before calling onClose
        }, duration);

        // Cleanup function - clear timers when component unmounts or dependencies change
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, onClose]); // Re-run effect if duration or onClose changes

    // Dynamic styling based on notification type (success = green, error = red)
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
    const progressColor = type === 'success' ? 'bg-green-200' : 'bg-red-200';

    // Main toast container - positioned fixed at top-right with slide animations
    return (
        <div className={`fixed top-4 right-4 z-9999 max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            {/* Toast content container with dynamic background color */}
            <div className={`${bgColor} rounded-lg shadow-2xl border border-white/30 overflow-hidden backdrop-blur-sm`}>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {/* Icon based on notification type */}
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
                            {/* Message content */}
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-white">
                                    {type === 'success' ? 'Success' : 'Error'}
                                </h3>
                                <p className={`text-sm ${textColor} mt-1`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                        {/* Manual close button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300); // Wait for slide-out animation
                            }}
                            className="ml-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {/* Progress Bar showing remaining time */}
                <div className="h-1 bg-white/20">
                    <div
                        className={`h-full ${progressColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }} // Dynamically shrinking width
                    />
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN SHOP PRODUCT MANAGEMENT COMPONENT
// ================================================================================================
// This is the main component that handles all product management functionality.
// It provides a complete interface for managing shop products including:
// - Viewing products in a paginated, sortable table
// - Creating new products with validation
// - Editing existing products
// - Managing product status (enable/disable)
// - Real-time search and filtering
// - Integration with pet management system
// ================================================================================================

const ShopProductManagement = () => {
    // ============================================================================================
    // AUTHENTICATION AND USER CONTEXT
    // ============================================================================================

    // Get current authenticated user information
    const { user } = useAuth();

    // ============================================================================================
    // DATA MANAGEMENT HOOKS
    // ============================================================================================

    // Main hook for shop product operations - provides CRUD functions and data
    const {
        shopProducts,           // All shop products
        loading,                // Loading state for API operations
        error,                  // Error state from failed API calls
        createShopProduct,      // Function to create a new product
        updateShopProduct,      // Function to update an existing product
        refreshData,            // Function to refetch data from API
    } = useSimpleShopProducts();

    // Hook for pet data - needed because products can be linked to specific pets
    const {
        pets,                   // List of all pets in the system
        loading: petsLoading    // Loading state for pet data
    } = useSimplePets();

    // ============================================================================================
    // COMPUTED VALUES AND DERIVED STATE
    // ============================================================================================

    /**
     * Extract unique pet types from active pets for dynamic product categorization
     * This creates a list of available pet types that can be used for products.
     * Only includes pets with petStatus === 1 (active) to avoid issues with disabled pets.
     */
    const dynamicPetTypes = useMemo(() => {
        // Return empty array if no pets data available
        if (!pets || pets.length === 0) return [];

        // Process pets to extract unique active pet types
        const types = pets
            .filter(pet => pet.petStatus === 1)      // Only include active pets
            .map(pet => pet.petType || pet.type)     // Handle both property naming conventions
            .filter(type => type && type.trim())     // Remove empty/null values
            .map(type => type.trim());               // Clean whitespace

        // Return unique types, sorted alphabetically for consistent UI
        const uniqueTypes = [...new Set(types)].sort();

        // Debug log for development - helps track what pet types are available
        console.log('🐾 Dynamic Pet Types (Active Only) extracted:', uniqueTypes);

        return uniqueTypes;
    }, [pets]); // Only recalculate when pets data changes

    // ============================================================================================
    // HELPER FUNCTIONS FOR PRODUCT CLASSIFICATION
    // ============================================================================================

    /**
     * Determine if a product is related to a pet
     * A product is considered a pet product if:
     * 1. It has a petID (direct association with a specific pet)
     * 2. Its type matches one of the dynamic pet types
     */
    const isPetProduct = (product) => {
        // Direct pet association via petID
        if (product.petID) return true;

        // Type-based classification - check if product type is a pet type
        return dynamicPetTypes.includes(product.type);
    };

    /**
     * Check if a product's related pet is inactive
     * This is important for determining why a product might be disabled.
     * If a pet is disabled, its related products should also be disabled.
     */
    const isRelatedPetInactive = (product) => {
        // Only check if product has a petID and we have pets data
        if (!product.petID || !pets) return false;

        // Find the related pet and check its status
        const relatedPet = pets.find(pet => pet.petId === product.petID);
        return relatedPet && relatedPet.petStatus === 0; // Pet is inactive
    };

    /**
     * Generate enhanced status badge with contextual information
     * This provides visual feedback about product status and explains why it might be disabled
     */
    const getStatusBadge = (product) => {
        if (product.status === 1) {
            return (
                <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm cursor-default"
                    title="Active product"
                >
                    Active
                </span>
            );
        } else {
            // Product is inactive - check if it's due to pet being inactive
            const isPetRelated = isPetProduct(product);
            const isPetInactive = isRelatedPetInactive(product);

            if (isPetRelated && isPetInactive) {
                // Inactive due to pet being disabled - more noticeable styling
                return (
                    <span
                        className="inline-flex flex-col items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-300 shadow-sm cursor-help animate-pulse"
                        title="Product disabled because related pet has been disabled. Please activate the pet first to enable this product."
                    >
                        <div className="text-center leading-tight">
                            <div>Inactive</div>
                            <div className="text-xs">(Pet Disabled)</div>
                        </div>
                    </span>
                );
            } else {
                // Regular inactive status
                return (
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-sm cursor-default"
                        title="Product has been disabled"
                    >
                        Inactive
                    </span>
                );
            }
        }
    };

    // ============================================================================================
    // STATE MANAGEMENT - FILTERING AND SEARCH
    // ============================================================================================

    // Local search state - separated for debouncing to improve performance
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Filter states for different product categorization
    const [statusFilter, setStatusFilter] = useState('all');      // Active/Inactive products
    const [currencyFilter, setCurrencyFilter] = useState('all');  // COIN/DIAMOND/GEM currency types
    const [shopTypeFilter, setShopTypeFilter] = useState('all');  // Pet/Food/Other product types

    /**
     * Debounce search term to prevent excessive filtering
     * Waits 300ms after user stops typing before applying search
     * This improves performance and reduces unnecessary API calls
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(localSearchTerm);
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    /**
     * Handle search input with local state for immediate UI feedback
     * Uses debouncing to prevent performance issues with large datasets
     */
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
    }, []);

    /**
     * Clear search and reset debounced state
     * Ensures both immediate and delayed search states are cleared
     */
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);

    /**
     * Reset all filters to default state
     * Provides a quick way to clear all applied filters and sorting
     */
    const clearAllFilters = useCallback(() => {
        clearSearch();
        setStatusFilter('all');
        setCurrencyFilter('all');
        setShopTypeFilter('all');
        setSortConfig({ key: null, direction: 'asc' });
    }, []);

    // ============================================================================================
    // STATE MANAGEMENT - MODAL AND UI STATES
    // ============================================================================================

    // Product selection and detail viewing
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Modal states for different CRUD operations
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });
    const [createModal, setCreateModal] = useState(false);

    // UI helper states
    const [linkConverted, setLinkConverted] = useState(false);           // Google Drive link conversion status
    const [showGoogleDriveHelp, setShowGoogleDriveHelp] = useState(false); // Help dialog visibility
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Advanced filter panel visibility

    // ============================================================================================
    // NOTIFICATION SYSTEM INTEGRATION
    // ============================================================================================

    /**
     * Use notification manager hook for consistent user feedback
     * Provides unified notification system with automatic refresh functionality
     */
    const {
        notification,                    // Current notification state
        showNotification,               // Function to display notifications
        clearNotification,              // Function to clear notifications
        handleOperationWithNotification, // Wrapper for operations with notifications
        handleFormSubmission            // Wrapper for form submissions with notifications
    } = useNotificationManager(refreshData);

    // Field validation errors
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        type: '',
        petType: '',
        description: '',
        imageUrl: '',
        price: '',
        quantity: ''
    });

    // ============================================================================================
    // VALIDATION FUNCTIONS - INPUT VALIDATION AND BUSINESS RULES
    // ============================================================================================

    /**
     * Validate product name with uniqueness check
     * Ensures product names are unique, appropriate length, and properly formatted
     * 
     * @param {string} name - The product name to validate
     * @param {boolean} isEditing - Whether this is an edit operation (affects uniqueness check)
     * @param {number} currentProductId - ID of product being edited (excluded from uniqueness check)
     * @returns {string} Error message or empty string if valid
     */
    const validateName = (name, isEditing = false, currentProductId = null) => {
        // Basic validation
        if (!name || name.trim().length === 0) return 'Product name is required.';
        if (name.trim().length < 2) return 'Product name must be at least 2 characters.';
        if (name.length > 100) return 'Product name cannot exceed 100 characters.';

        // Uniqueness validation - check against existing products
        const trimmedName = name.trim();
        const existingProduct = shopProducts?.find(product => {
            const normalizedExistingName = product.name?.trim().toLowerCase();
            const normalizedNewName = trimmedName.toLowerCase();

            // If editing, exclude the current product from uniqueness check
            if (isEditing && currentProductId && product.shopProductId === currentProductId) {
                return false;
            }

            return normalizedExistingName === normalizedNewName;
        });

        if (existingProduct) {
            return `Product name "${trimmedName}" already exists. Please choose a different name.`;
        }

        return ''; // Valid
    };

    /**
     * Validate product type selection
     * Ensures a valid product category is selected
     */
    const validateType = (type) => {
        if (!type || type.trim().length === 0) return 'Product type is required.';
        return '';
    };

    /**
     * Validate pet type selection for pet-related products
     * Required when product type indicates it's pet-specific
     */
    const validatePetType = (petType) => {
        if (!petType || petType.trim().length === 0) return 'Pet type is required.';
        return '';
    };

    /**
     * Validate product description
     * Ensures description is provided and within character limits
     */
    const validateDescription = (description) => {
        if (!description || description.trim().length === 0) return 'Description is required.';
        if (description.length > 1000) return 'Description cannot exceed 1000 characters.';
        return '';
    };

    /**
     * Validate image URL with Google Drive requirement
     * Ensures image is hosted on Google Drive for consistency and reliability
     */
    const validateImageUrl = (url) => {
        if (!url || url.trim().length === 0) return 'Image URL is required.';
        if (!url.includes('drive.google.com')) return 'Please use Google Drive link.';
        return '';
    };

    /**
     * Validate product price with business rules
     * Ensures price is numeric, positive, and within reasonable bounds
     */
    const validatePrice = (price) => {
        if (!price || price === '') return 'Product price is required.';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) return 'Product price must be greater than 0.';
        if (numPrice > 1000000) return 'Product price cannot exceed 1,000,000.';
        return '';
    };

    /**
     * Validate product quantity with business constraints
     * Ensures quantity is non-negative integer within reasonable bounds
     */
    const validateQuantity = (quantity) => {
        if (quantity === '' || quantity === null || quantity === undefined) return 'Quantity is required.';
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) return 'Quantity must be a non-negative number (≥0).';
        if (numQuantity > 10000) return 'Quantity cannot exceed 10,000.';
        return '';
    };

    // ============================================================================================
    // FORM FIELD ERROR MANAGEMENT
    // ============================================================================================

    /**
     * Clear specific field validation error
     * Used when user starts correcting an input field
     */
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    };

    // ============================================================================================
    // INPUT CHANGE HANDLERS WITH REAL-TIME VALIDATION
    // ============================================================================================

    /**
     * Handle product name changes with immediate validation
     * Provides real-time feedback on name uniqueness and format requirements
     */
    const handleProductNameChange = (value) => {
        setEditForm({ ...editForm, name: value });
        clearFieldError('name');

        // Determine context for uniqueness validation
        const isEditing = editModal.isOpen;
        const currentProductId = isEditing ? editModal.product?.shopProductId : null;

        const error = validateName(value, isEditing, currentProductId);
        if (error) {
            setFieldErrors(prev => ({ ...prev, name: error }));
        }
    };

    /**
     * Handle description changes with character limit validation
     * Provides immediate feedback on description length requirements
     */
    const handleDescriptionChange = (value) => {
        setEditForm({ ...editForm, description: value });
        clearFieldError('description');

        const error = validateDescription(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, description: error }));
        }
    };

    /**
     * Handle image URL changes with Google Drive validation
     * Ensures consistency by requiring Google Drive hosting
     */
    const handleImageUrlChange = (value) => {
        setEditForm({ ...editForm, imageUrl: value });
        clearFieldError('imageUrl');

        const error = validateImageUrl(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, imageUrl: error }));
        }
    };

    /**
     * Handle price changes with numeric validation
     * Ensures price is positive number within business constraints
     */
    const handlePriceChange = (value) => {
        setEditForm({ ...editForm, price: value });
        clearFieldError('price');

        const error = validatePrice(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, price: error }));
        }
    };

    /**
     * Handle quantity changes with automatic status management
     * When quantity reaches 0, automatically sets product status to inactive
     * This implements business rule: out-of-stock products should be inactive
     */
    const handleQuantityChange = (value) => {
        const numValue = parseInt(value) || 0;
        const newForm = { ...editForm, quantity: value };

        // Business rule: If quantity is 0, automatically set status to inactive
        if (numValue === 0) {
            newForm.status = 0;
        }

        setEditForm(newForm);
        clearFieldError('quantity');

        const error = validateQuantity(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, quantity: error }));
        }
    };

    // ============================================================================================
    // ERROR HANDLING AND USER FEEDBACK
    // ============================================================================================

    /**
     * Show general errors as notifications
     * Converts hook-level errors into user-visible notifications
     */
    useEffect(() => {
        if (error) {
            showNotification('An error occurred: ' + error, 'error');
        }
    }, [error]);

    // ============================================================================================
    // CONFIRMATION DIALOG MANAGEMENT
    // ============================================================================================

    /**
     * Confirmation dialog state for destructive operations
     * Used for delete confirmations and other critical actions
     */
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // ============================================================================================
    // FORM STATE MANAGEMENT
    // ============================================================================================

    /**
     * Main form data state for both create and edit operations
     * Contains all product fields with sensible defaults
     */
    const [editForm, setEditForm] = useState({
        petID: null,                  // Link to specific pet (optional)
        name: '',                     // Product name (required)
        type: '',                     // Product category (required)
        petType: '',                  // Pet type for pet-specific products
        description: '',              // Product description (required)
        imageUrl: '',                 // Google Drive image URL (required)
        price: '',                    // Product price (required)
        currencyType: 'Coin',         // Default currency type
        quantity: 10,                 // Default quantity
        status: 1                     // Default active status
    });

    /**
     * Original form data for change detection in edit mode
     * Used to determine if user has made any modifications
     */
    const [originalFormData, setOriginalFormData] = useState({
        petID: null,
        name: '',
        type: '',
        petType: '',
        description: '',
        imageUrl: '',
        price: 10,
        currencyType: 'Coin',
        quantity: 10,
        status: 1
    });

    // ============================================================================================
    // SORTING AND PAGINATION STATE
    // ============================================================================================

    /**
     * Sorting configuration for table columns
     * Supports ascending/descending sort on any column
     */
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    /**
     * Pagination state for large product lists
     * Allows users to navigate through products efficiently
     */
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ============================================================================================
    // CHANGE DETECTION FOR FORM VALIDATION
    // ============================================================================================

    /**
     * Detect if form has changes in edit mode
     * Used to warn users about unsaved changes and enable/disable save button
     */
    const hasFormChanges = useMemo(() => {
        return (
            editForm.petID !== originalFormData.petID ||
            editForm.name !== originalFormData.name ||
            editForm.type !== originalFormData.type ||
            editForm.petType !== originalFormData.petType ||
            editForm.description !== originalFormData.description ||
            editForm.imageUrl !== originalFormData.imageUrl ||
            editForm.price !== originalFormData.price ||
            editForm.currencyType !== originalFormData.currencyType ||
            editForm.quantity !== originalFormData.quantity ||
            editForm.status !== originalFormData.status
        );
    }, [editForm, originalFormData]);

    /**
     * Detect if create form has any content
     * Used to warn users about losing unsaved data when closing create modal
     */
    const hasCreateFormContent = useMemo(() => {
        return (
            (editForm.name && editForm.name.trim().length > 0) ||
            (editForm.type && editForm.type.trim().length > 0) ||
            (editForm.petType && editForm.petType.trim().length > 0) ||
            (editForm.description && editForm.description.trim().length > 0) ||
            (editForm.imageUrl && editForm.imageUrl.trim().length > 0) ||
            (editForm.price && editForm.price.toString().trim().length > 0) ||
            editForm.currencyType !== 'Coin' || // Default currency is 'Coin'
            editForm.quantity !== 10 || // Default quantity is 10
            editForm.status !== 1 || // Default status is 1
            editForm.petID !== null // Default petID is null
        );
    }, [editForm]);

    // ============================================================================================
    // DATA PROCESSING - FILTERING, SORTING, AND PAGINATION
    // ============================================================================================

    /**
     * Main data processing pipeline that applies all filters, sorting, and returns final dataset
     * This is the core logic for displaying products with user-applied filters
     * 
     * Processing order:
     * 1. Apply search filter (product name)
     * 2. Apply status filter (active/inactive/out of stock)
     * 3. Apply currency filter (coin/diamond/gem)
     * 4. Apply shop type filter (pet/food/other)
     * 5. Apply sorting (any column, asc/desc)
     * 6. Return filtered and sorted results for pagination
     */
    const filteredAndSortedProducts = useMemo(() => {
        // Start with complete product dataset
        const allProducts = shopProducts;

        // Apply all filters sequentially
        let filtered = allProducts.filter(product => {
            // 1. Search filter - use debounced search term for performance
            if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const productName = (product.name || '').toLowerCase();
                if (!productName.includes(searchLower)) {
                    return false;
                }
            }

            // 2. Status filter - categorize by product availability
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && product.status !== 1) return false;
                if (statusFilter === 'outOfStock' && (product.status !== 0 && product.quantity > 0)) return false;
            }

            // 3. Currency filter - filter by payment method
            if (currencyFilter !== 'all') {
                if (product.currencyType !== currencyFilter) return false;
            }

            // 4. Shop type filter - categorize by product relationship
            if (shopTypeFilter !== 'all') {
                if (shopTypeFilter === 'Pet') {
                    // Pet products: either have dynamic pet types or direct pet association
                    if (!dynamicPetTypes.includes(product.type) && !product.petID) return false;
                } else if (shopTypeFilter === 'Food') {
                    if (product.type !== 'Food') return false;
                }
            }

            return true; // Product passes all filters
        });

        // Apply sorting if configured
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle numeric fields (price, quantity) with proper number conversion
                if (sortConfig.key === 'price' || sortConfig.key === 'quantity') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Handle status field as numeric for proper ordering
                if (sortConfig.key === 'status') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                // Handle string comparisons (case-insensitive)
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values by converting to empty string
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';

                // Perform comparison based on sort direction
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0; // Values are equal
            });
        }

        return filtered;
    }, [shopProducts, debouncedSearchTerm, statusFilter, currencyFilter, shopTypeFilter, sortConfig]);

    // Calculate pagination (use filteredAndSortedProducts)
    const totalItems = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage); //round up to nearest upward number
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter, currencyFilter, shopTypeFilter]);

    // Clear field errors when modal type changes (create/edit)
    useEffect(() => {
        setFieldErrors({
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            quantity: ''
        });
    }, [createModal, editModal.isOpen]);

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

    // Handle filters
    // Updated filter handlers - no API calls, just state updates
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };

    const handleCurrencyFilter = (currency) => {
        setCurrencyFilter(currency);
    };

    const handleShopTypeFilter = (shopType) => {
        setShopTypeFilter(shopType);
    };

    // View product details
    const handleView = (product) => {
        setSelectedProduct(product);
    };

    // Open edit modal
    const handleEdit = (product) => {
        // Clear any existing field errors when switching to edit mode
        setFieldErrors({
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            quantity: ''
        });

        const predefinedTypes = ['Food'];

        let formType = '';
        let formPetType = '';

        // Check if product is a pet type - prioritize petID presence over type field
        if (product.petID) {
            // If product has petID, it's definitely a pet product
            formType = 'Pet';

            // Try to get pet type from the pets array using petID
            const relatedPet = pets?.find(pet => pet.petId === product.petID);
            if (relatedPet) {
                formPetType = relatedPet.petType;
            } else if (product.type && dynamicPetTypes.includes(product.type)) {
                // Fallback to product.type if pet not found in pets array
                formPetType = product.type;
            } else {
                // If no pet type found, use empty string but still mark as Pet
                formPetType = '';
            }
        } else if (dynamicPetTypes.includes(product.type)) {
            // Legacy check for products that have type but no petID
            formType = 'Pet';
            formPetType = product.type;
        } else if (predefinedTypes.includes(product.type)) {
            // Regular product types (Food, etc.)
            formType = product.type;
        }

        const formData = {
            petID: product.petID || null,
            name: product.name || '',
            type: formType,
            petType: formPetType,
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            price: product.price || '',
            currencyType: product.currencyType || 'COIN',
            quantity: product.quantity || 10,
            status: product.status !== undefined ? product.status : 1
        };

        console.log('🔍 Edit form data prepared:', {
            original: product,
            formData: formData,
            relatedPet: pets?.find(pet => pet.petId === product.petID)
        });

        setEditForm(formData);
        setOriginalFormData(formData); // Store original data for comparison
        setEditModal({ isOpen: true, product });
    };

    // Open create modal
    const handleCreate = () => {
        // Clear any existing field errors when switching to create mode
        setFieldErrors({
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            quantity: ''
        });

        const resetFormData = {
            petID: null,
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: 10,
            currencyType: 'Coin',
            quantity: 10,
            status: 1
        };

        setEditForm(resetFormData);
        setOriginalFormData(resetFormData); // Set original data for create mode
        setCreateModal(true);
    };

    // Handle cancel - close modals and reset form
    const handleCancel = () => {
        // Clear field errors when canceling
        setFieldErrors({
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            quantity: ''
        });

        // If we were editing a product, navigate back to detail view instead of closing everything
        const wasEditing = editModal.isOpen && editModal.product;

        setCreateModal(false);
        setEditModal({ isOpen: false, product: null });

        // If we exit editing, show the detail view of the product
        if (wasEditing) {
            setSelectedProduct(editModal.product);
        }

        const resetFormData = {
            petID: null,
            name: '',
            type: '',
            petType: '',
            description: '',
            imageUrl: '',
            price: '',
            currencyType: 'Coin',
            quantity: 10,
            status: 1
        };
        setEditForm(resetFormData);
        setOriginalFormData(resetFormData);
    };

    // Handle delete (disable product)
    const handleDelete = async (productId) => {
        const product = shopProducts.find(p => p.shopProductId === productId);
        if (!product) return;

        if (product.status === 0) {
            showNotification('This product is already disabled!', 'error');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Confirm disable',
            message: 'Are you sure you want to disable this product?',
            onConfirm: async () => {
                await handleOperationWithNotification(
                    () => updateShopProduct(productId, { ...product, status: 0 }),
                    'Product disabled successfully!',
                    'Failed to disable product'
                );
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    // Handle enable product
    const handleEnable = async (productId) => {
        const product = shopProducts.find(p => p.shopProductId === productId);
        if (!product) return;

        if (product.status === 1) {
            showNotification('This product is already activated!', 'error');
            return;
        }

        await handleOperationWithNotification(
            () => updateShopProduct(productId, { ...product, status: 1 }),
            'Product activated successfully!',
            'Activation Failed'
        );
    };

    // Handle form submission for create/edit
    const handleSubmit = async (isEdit = false) => {
        // Validate all fields
        const errors = {};

        // Determine current product ID for edit mode
        const currentProductId = isEdit && editModal.product ? editModal.product.shopProductId : null;

        const nameError = validateName(editForm.name, isEdit, currentProductId);
        if (nameError) errors.name = nameError;

        // Only validate type when creating new product
        if (!isEdit && createModal) {
            const typeError = validateType(editForm.type);
            if (typeError) errors.type = typeError;
        }

        const priceError = validatePrice(editForm.price);
        if (priceError) errors.price = priceError;

        const quantityError = validateQuantity(editForm.quantity);
        if (quantityError) errors.quantity = quantityError;

        const descError = validateDescription(editForm.description);
        if (descError) errors.description = descError;

        const imageError = validateImageUrl(editForm.imageUrl);
        if (imageError) errors.imageUrl = imageError;

        // Only validate pet type and pet`ID when creating new and product type is Pet
        if (!isEdit && editForm.type === 'Pet') {
            const petTypeError = validatePetType(editForm.petType);
            if (petTypeError) errors.petType = petTypeError;
            if (!editForm.petID) {
                errors.petType = 'Please select a specific pet.';
            }
        }

        // Set field errors
        setFieldErrors(errors);

        // Check if there are any validation errors and show an alert
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors);
            showNotification(`Please fix the following errors: ${errorMessages.join('; ')}`, 'error');
            return;
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Shop Product Management</h1>
                        </div>
                    </div>

                    {/* Statistics in Header */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <Package className="h-4 w-4 text-purple-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold text-sm">✕</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {shopProducts.filter(p => p.status === 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Statistics */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Package className="h-4 w-4 text-purple-600" />
                                <p className="text-xs font-medium text-gray-600">Total</p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Available</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Out of Stock</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">
                                {shopProducts.filter(p => p.status === 0).length}
                            </p>
                        </div>
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

            {/* Search and Filters Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 border-b border-purple-100">
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

                <div className="p-6 space-y-6">
                    {/* Basic Search */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Search & Create new product</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors duration-200" />                                    <input
                                        type="text"
                                        placeholder="Enter product name to search..."
                                        value={localSearchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <button
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create new product
                                </button>
                            </div>

                            {(localSearchTerm || debouncedSearchTerm) && (
                                <div className="bg-purple-100 rounded-md p-3 border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-purple-800 font-medium">
                                            🔍 Showing search results for: "<span className="font-semibold text-purple-900">{debouncedSearchTerm || localSearchTerm}</span>"
                                            {localSearchTerm !== debouncedSearchTerm && localSearchTerm && (
                                                <span className="text-xs text-purple-600 ml-2">(typing...)</span>
                                            )}
                                        </p>
                                        <button
                                            onClick={clearSearch}
                                            className="ml-auto text-purple-600 hover:text-purple-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                        >
                                            Clear Search
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Filters */}
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
                            </button>
                        </div>

                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Content Filters */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Filter by Content</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {/* 1. Shop Type Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Product Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={shopTypeFilter}
                                                    onChange={(e) => handleShopTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> All Type</option>
                                                    <option value="Pet"> Pet</option>
                                                    <option value="Food"> Food</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 2. Currency Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Currency type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={currencyFilter}
                                                    onChange={(e) => handleCurrencyFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> All Currency Type</option>
                                                    <option value="Coin">Coin</option>
                                                    <option value="Diamond">Diamond</option>
                                                    <option value="Gem">Gem</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 3. Status Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Status
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> All Status</option>
                                                    <option value="active"> Active</option>
                                                    <option value="outOfStock">Inactive</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sort Section */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Sort Data</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Sort Field */}
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
                                                    <option value=""> No sort</option>
                                                    <option value="name">Product Name</option>
                                                    <option value="price">Price</option>
                                                    <option value="quantity">Quantity</option>
                                                    <option value="status">Status</option>
                                                    <option value="type">Product Type</option>
                                                    <option value="currencyType">Currency Type</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction */}
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
                                                        Sorting by: <span className="font-bold">
                                                            {sortConfig.key === 'name' && 'Product name'}
                                                            {sortConfig.key === 'price' && 'Price'}
                                                            {sortConfig.key === 'quantity' && 'Quantity'}
                                                            {sortConfig.key === 'status' && 'Status'}
                                                            {sortConfig.key === 'type' && 'Product type'}
                                                            {sortConfig.key === 'currencyType' && 'Currency Type'}
                                                        </span> ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Clear Filters */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Actions</span>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={clearAllFilters}
                                            disabled={statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm}
                                            className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {statusFilter === 'all' && currencyFilter === 'all' && shopTypeFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'No filters applied'
                                                : 'Clear all filters'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(statusFilter !== 'all' || currencyFilter !== 'all' || shopTypeFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Search',
                                                    statusFilter !== 'all' && 'Status',
                                                    currencyFilter !== 'all' && 'Currency',
                                                    shopTypeFilter !== 'all' && 'Shop Type',
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


            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-purple-600 to-pink-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">SHOP PRODUCTS LIST</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[7%]" />
                                <col className="w-[15%]" />
                                <col className="w-[12%]" />
                                <col className="w-[20%]" />
                                <col className="w-[10%]" />
                                <col className="w-[8%]" />
                                <col className="w-[8%]" />
                                <col className="w-[10%]" />
                                <col className="w-[9%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-purple-600 to-pink-600 border-b-4 border-purple-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Image
                                    </th>
                                    <th className="px-3 py-6 text-left text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Product Name
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Item Type
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Product Description
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Price
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Currency
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Quantity
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">There are no shop product</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || shopTypeFilter !== 'all' || statusFilter !== 'all' || currencyFilter !== 'all' ?
                                                            'No products found matching the filters.' :
                                                            'Start by adding a new product.'
                                                        }
                                                    </p>
                                                    {!(localSearchTerm || debouncedSearchTerm) && shopTypeFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && (
                                                        <button
                                                            onClick={handleCreate}
                                                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Create new product
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (currentProducts.map((product) => (
                                    <tr key={product.shopProductId} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                                        {/* Product Image */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {product.imageUrl ? (
                                                    <ProductImage
                                                        imageUrl={product.imageUrl}
                                                        productName={product.name}
                                                        className="h-16 w-16 rounded-lg flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Product Name */}
                                        <td className="px-3 py-4">
                                            <div className="text-sm font-bold text-gray-900 break-words whitespace-normal leading-tight text-left" title={product.name}>
                                                {product.name}
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {product.type === 'Food' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                        Food
                                                    </span>
                                                )}
                                                {isPetProduct(product) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        Pet
                                                    </span>
                                                )}
                                                {!isPetProduct(product) && !['Food'].includes(product.type) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                        {product.type || 'Uncategorized'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-3 py-4">
                                            <div className="text-xs text-center text-gray-700 break-words whitespace-normal text-wrap max-w-full leading-relaxed"
                                                title={product.description || 'No description'}>
                                                {product.description || 'No description'}
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-3 py-4">
                                            <div className="flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-gray-900">
                                                        {product.price?.toLocaleString('vi-VN') || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Currency Type */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {product.currencyType === 'Coin' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm">
                                                        Coin
                                                    </span>
                                                )}
                                                {product.currencyType === 'Diamond' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 shadow-sm">
                                                        Diamond
                                                    </span>
                                                )}
                                                {product.currencyType === 'Gem' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        Gem
                                                    </span>
                                                )}
                                                {!['Coin', 'Diamond', 'Gem'].includes(product.currencyType) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                        {product.currencyType || 'N/A'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                    {product.quantity}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center">
                                                {getStatusBadge(product)}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center space-x-1">
                                                <button
                                                    onClick={() => handleView(product)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="View product details"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {product.status === 1 ? (
                                                    <button
                                                        onClick={() => handleDelete(product.shopProductId)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Disable product"
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    (() => {
                                                        const petInactive = isRelatedPetInactive(product);
                                                        return (
                                                            <button
                                                                onClick={() => petInactive ? null : handleEnable(product.shopProductId)}
                                                                className={`p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${petInactive
                                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                                                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                                                    }`}
                                                                disabled={petInactive}
                                                                title={
                                                                    petInactive
                                                                        ? "Cannot activate product: related pet is inactive"
                                                                        : "Active"
                                                                }
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                            </button>
                                                        );
                                                    })()
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
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
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                                            : 'bg-white text-purple-700 border border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:text-purple-800 shadow-sm'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                            >
                                <span className="hidden sm:inline">Next Page</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(createModal || editModal.isOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <h3 className="text-4xl font-bold text-white">
                                    {createModal ? 'Create new product' : 'Update product'}
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-br from-gray-50 to-white">
                            {/* Form Fields */}
                            <div className="space-y-8">
                                {/* Row 1 - Product Name and Image */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Product Name */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">Product Name</label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => handleProductNameChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter product name"
                                            required
                                            minLength="2"
                                        />
                                        {fieldErrors.name && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image URL */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        {/* Header with Google Drive Integration */}
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-lg font-semibold text-gray-800">Image URL</label>
                                            <div className="flex gap-2">
                                                <a
                                                    href="https://drive.google.com/drive/u/0/folders/14-F6VcATkQVW8qwHrA4flc0fX8ffC5Ha"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    📁 Google Drive
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGoogleDriveHelp(true)}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                >
                                                    ❓ Guide
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Preview and Input Layout */}
                                        <div className="flex gap-4 items-center">
                                            {/* Image Preview */}
                                            <div className="flex-shrink-0">
                                                {editForm.imageUrl ? (
                                                    <ProductImage
                                                        imageUrl={editForm.imageUrl}
                                                        productName="Preview"
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                        <div className="text-gray-400 text-sm">🖼️</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Field */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={editForm.imageUrl}
                                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                                    onBlur={(e) => {
                                                        const originalUrl = e.target.value;
                                                        const convertedUrl = convertGoogleDriveLink(originalUrl);

                                                        // Debug logging to check conversion
                                                        if (originalUrl !== convertedUrl) {
                                                            console.log('🔄 Google Drive Link Conversion:');
                                                            console.log('Original:', originalUrl);
                                                            console.log('Converted:', convertedUrl);
                                                            setEditForm({ ...editForm, imageUrl: convertedUrl });

                                                            // Show success notification
                                                            setLinkConverted(true);
                                                            setTimeout(() => setLinkConverted(false), 3000);
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.imageUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Paste Google Drive image URL here..."
                                                />
                                                {fieldErrors.imageUrl && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <span className="mr-1">⚠️</span>
                                                        {fieldErrors.imageUrl}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2 - Price and Currency */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Price */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">Product Price</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => handlePriceChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter product price (>0)"
                                            min="1"
                                            required
                                        />
                                        {fieldErrors.price && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.price}
                                            </p>
                                        )}
                                    </div>

                                    {/* Currency Type */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">Currency Type</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.currencyType}
                                                onChange={(e) => setEditForm({ ...editForm, currencyType: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                                required
                                                title="Choose currency type"
                                            >
                                                <option value="Coin">Coin</option>
                                                <option value="Diamond">Diamond</option>
                                                <option value="Gem">Gem</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3 - Product Type and Pet Selection (Only show when creating) */}
                                {createModal && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Product Type */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <label className="text-lg font-semibold text-gray-800">Product Type</label>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={editForm.type}
                                                    onChange={(e) => {
                                                        setEditForm({ ...editForm, type: e.target.value, petType: '', petID: null });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                                    required
                                                    title="Select product type: Pet or Food"
                                                >
                                                    <option value="">Choose Product Type</option>
                                                    <option value="Pet">Pet</option>
                                                    <option value="Food">Food</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Pet Selection - always visible but disabled when type is not Pet */}
                                        <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 ${editForm.type === 'Pet'
                                            ? 'hover:shadow-md opacity-100'
                                            : 'opacity-50 pointer-events-none'
                                            }`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                {/* Pet Type Selection Label - Dynamic styling based on product type */}
                                                <label className={`text-lg font-semibold transition-colors duration-200 ${editForm.type === 'Pet'
                                                    ? 'text-gray-800'        // Active label color when Pet type is selected
                                                    : 'text-gray-400'        // Muted label color when not Pet type
                                                    }`}>Pet Type</label>
                                            </div>

                                            {/* Pet Type Dropdown - Only functional when product type is "Pet" */}
                                            <div className="relative">
                                                <select
                                                    // Value logic: Show selected petID only if product type is Pet, otherwise empty
                                                    value={editForm.type === 'Pet' ? (editForm.petID || '') : ''}
                                                    onChange={(e) => {
                                                        // Only process selection changes when product type is Pet
                                                        if (editForm.type === 'Pet') {
                                                            const selectedPetId = e.target.value;
                                                            // Find the complete pet object based on selected ID
                                                            const selectedPet = pets.find(pet => pet.petId == selectedPetId);
                                                            // Update form with both petID and petType from selected pet
                                                            setEditForm({
                                                                ...editForm,
                                                                petID: selectedPetId,
                                                                petType: selectedPet ? selectedPet.petType : null
                                                            });
                                                        }
                                                    }}
                                                    // Dynamic styling: Active/interactive when Pet type, disabled appearance otherwise
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none shadow-sm transition-all duration-200 appearance-none ${editForm.type === 'Pet'
                                                        ? 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 bg-white text-gray-900 cursor-pointer'  // Active Pet product styling
                                                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'  // Disabled non-Pet product styling
                                                        }`}
                                                    // Required field validation: Only required when product type is Pet
                                                    required={editForm.type === 'Pet'}
                                                    // Disable conditions: Not Pet type, still loading pets, or no pets available
                                                    disabled={editForm.type !== 'Pet' || petsLoading || pets.length === 0}
                                                >
                                                    {/* Dynamic placeholder option based on current state */}
                                                    <option value="">
                                                        {editForm.type !== 'Pet' ? "Only aviable for pet products" :      // Not Pet type
                                                            petsLoading ? "Loading..." :                                   // Loading state
                                                                pets.length === 0 ? "No pet available" :                  // No pets found
                                                                    "Choose pet type"}
                                                    </option>

                                                    {/* Render pet type options only when product type is Pet */}
                                                    {editForm.type === 'Pet' && dynamicPetTypes.map(petType => {
                                                        // Business logic: Find the first active pet of each type
                                                        // This ensures we always link to a valid, active pet
                                                        const firstActivePetOfType = pets.find(pet =>
                                                            pet.petType === petType && pet.petStatus === 1  // Only active pets (status = 1)
                                                        );
                                                        return (
                                                            <option key={petType} value={firstActivePetOfType?.petId}>
                                                                {petType}  {/* Display pet type name to user */}
                                                            </option>
                                                        );
                                                    })}
                                                </select>

                                                {/* Dropdown chevron icon - Dynamic styling based on state */}
                                                <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors duration-200 ${editForm.type === 'Pet' ? 'text-gray-400' : 'text-gray-300'
                                                    }`} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Row 4 - Quantity and Status */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Quantity */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="text-lg font-semibold text-gray-800">Quantity</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={editForm.quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter available quantity (≥0)"
                                            min="0"
                                            required
                                        />
                                        {fieldErrors.quantity && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {fieldErrors.quantity}
                                            </p>
                                        )}

                                    </div>

                                    {/* Status */}
                                    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 ${parseInt(editForm.quantity) === 0 || isRelatedPetInactive(editForm)
                                        ? 'opacity-50 pointer-events-none'
                                        : 'hover:shadow-md'
                                        }`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className={`text-lg font-semibold transition-colors duration-200 ${parseInt(editForm.quantity) === 0 || isRelatedPetInactive(editForm)
                                                ? 'text-gray-400'
                                                : 'text-gray-800'
                                                }`}>
                                                Status
                                                {parseInt(editForm.quantity) === 0 && (
                                                    <span className="ml-2 text-sm font-normal text-amber-600">(Auto: Inactive)</span>
                                                )}
                                                {isRelatedPetInactive(editForm) && parseInt(editForm.quantity) > 0 && (
                                                    <span className="ml-2 text-sm font-normal text-orange-600">(Cannot set active: Pet is disabled)</span>
                                                )}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: parseInt(e.target.value) })}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none shadow-sm transition-all duration-200 appearance-none ${parseInt(editForm.quantity) === 0 || isRelatedPetInactive(editForm)
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 bg-white text-gray-900 cursor-pointer'
                                                    }`}
                                                required
                                                title={
                                                    parseInt(editForm.quantity) === 0
                                                        ? "Status is automatically set to Inactive when quantity is 0"
                                                        : isRelatedPetInactive(editForm)
                                                            ? "Cannot set active: related pet is inactive"
                                                            : "Active: available in game | Inactive: unavailable in game"
                                                }
                                                disabled={parseInt(editForm.quantity) === 0 || isRelatedPetInactive(editForm)}
                                            >
                                                <option value="1">Active</option>
                                                <option value="0">Inactive</option>
                                            </select>
                                            <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors duration-200 ${parseInt(editForm.quantity) === 0 || isRelatedPetInactive(editForm)
                                                ? 'text-gray-300'
                                                : 'text-gray-400'
                                                }`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 5 - Description (Full Width) */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">Description</label>
                                    </div>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => handleDescriptionChange(e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none ${fieldErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter product description"
                                        maxLength="1000"
                                    />
                                    {fieldErrors.description && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {fieldErrors.description}
                                        </p>
                                    )}
                                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="text-sm text-purple-700 flex items-center justify-end gap-2">
                                            <span>{editForm.description?.length || 0}/1000 characters</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-6 border-t border-gray-200 flex-shrink-0">
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
                                        onClick={() => handleSubmit(editModal.isOpen)}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        disabled={
                                            // Check for validation errors
                                            Object.values(fieldErrors).some(error => error !== '') ||
                                            // Basic validation for both create and edit
                                            !editForm.name.trim() ||
                                            !editForm.price ||
                                            parseInt(editForm.price) <= 0 ||
                                            editForm.quantity === '' ||
                                            parseInt(editForm.quantity) < 0 ||
                                            !editForm.imageUrl.trim() ||
                                            !editForm.description.trim() ||
                                            // Create mode specific validation
                                            (createModal && (
                                                !hasCreateFormContent ||
                                                !editForm.type.trim() ||
                                                (editForm.type === 'Pet' && !editForm.petID)
                                            )) ||
                                            // Edit mode specific validation - no changes made
                                            (editModal.isOpen && !hasFormChanges)
                                        }
                                    >
                                        {createModal ? (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Create new product
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="w-4 h-4" />
                                                Update Product
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <div className="relative flex justify-center items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-bold text-white">Product detail</h3>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Product Name Header */}
                            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <h1 className="text-3xl font-bold text-purple-600">
                                                Product Name
                                            </h1>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-800">
                                                {selectedProduct.name}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Product Image & Basic Info (1/3 width) */}
                                <div className="lg:col-span-1 space-y-4">
                                    {/* Product Image Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">Product Image</h4>
                                            </div>

                                            <div className="flex justify-center">
                                                {selectedProduct.imageUrl ? (
                                                    <div className="relative group">
                                                        <ProductImage
                                                            imageUrl={selectedProduct.imageUrl}
                                                            productName={selectedProduct.name}
                                                            className="w-full h-32 rounded-xl shadow-lg border border-gray-200 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
                                                            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                                                Product Image
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400 mb-1" />
                                                        <span className="text-gray-500 text-xs font-medium">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                                            </div>

                                            <div className="space-y-3">


                                                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-600">Product Type</span>
                                                        <div>
                                                            {selectedProduct.type === 'Food' && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                                    Food
                                                                </span>
                                                            )}
                                                            {isPetProduct(selectedProduct) && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                                    Pet
                                                                </span>
                                                            )}
                                                            {!isPetProduct(selectedProduct) && !['Food'].includes(selectedProduct.type) && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                                    {selectedProduct.type || 'Unknown'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Only show linked pet info for Pet products */}
                                                {isPetProduct(selectedProduct) && (
                                                    <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-600">Linked Pet</span>
                                                            <div className="text-right">
                                                                {selectedProduct.petID ? (
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {(() => {
                                                                            const linkedPet = pets.find(pet => pet.petId == selectedProduct.petID);
                                                                            return linkedPet
                                                                                ? `${linkedPet.petType}`
                                                                                : `ID: ${selectedProduct.petID}`;
                                                                        })()}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500 italic">Not Specified</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Detailed Product Information (2/3 width) */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">Product Details</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {/* Pricing Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Product Price</h5>
                                                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-green-700">
                                                                {selectedProduct.price?.toLocaleString('vi-VN') || 0} {selectedProduct.currencyType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Inventory Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Quantity</h5>
                                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                                        <span className="text-lg font-bold text-blue-700">{selectedProduct.quantity}</span>
                                                    </div>
                                                </div>

                                                {/* Status Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Status</h5>
                                                    <div className={`p-3 rounded-lg border ${selectedProduct.status === 1
                                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between gap-2">
                                                            {selectedProduct.status === 1 ? (
                                                                <>
                                                                    <span className="text-lg font-bold text-green-700">Active</span>

                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-lg font-bold text-red-700">Inactive</span>

                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Additional Information</h5>
                                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                                        <span className="text-lg font-bold text-purple-700 font-mono">
                                                            #{selectedProduct.shopProductId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Description */}
                                            <div>
                                                <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Product description</h5>
                                                <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                                                    {selectedProduct.description ? (
                                                        <div className="space-y-2">
                                                            <div className="max-h-24 overflow-y-auto pr-2">
                                                                <p className="text-lg font-semibold text-gray-700 leading-relaxed break-words whitespace-pre-wrap word-wrap">
                                                                    {selectedProduct.description}
                                                                </p>
                                                            </div>
                                                            {selectedProduct.description.length > 150 && (
                                                                <div className="flex items-center gap-2 text-xl font-semibold text-gray-500 pt-1 border-t border-gray-200">
                                                                    <Package className="h-3 w-3" />
                                                                    <span>{selectedProduct.description.length} words</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center py-4">
                                                            <span className="text-gray-400 italic flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                No description available for this product
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex justify-end items-center">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(null);
                                            handleEdit(selectedProduct);
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Google Drive Help Modal */}
            {showGoogleDriveHelp && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Google Drive Usage Guide
                            </h3>
                            <button
                                onClick={() => setShowGoogleDriveHelp(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">📁 Step 1: Access Image Folder</h4>
                                <p className="text-sm text-blue-700">
                                    Click the "📁 Open Folder" button to access the Google Drive folder containing product images.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2">🖼️ Step 2: Select Image</h4>
                                <p className="text-sm text-green-700 mb-2">
                                    In the Google Drive folder:
                                </p>
                                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                                    <li>Find and click the image you want to use</li>
                                    <li>Picture will be display in preview mode</li>
                                    <li>Select "Share" on the top right corner</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">🔗 Step 3: Get Share Link</h4>
                                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                    <li>On the sharing pop up,loof for "Genertal Access"</li>
                                    <li>Select "Anyone with the link"</li>
                                    <li>Switch mode to "Editor"</li>
                                    <li>Click "Copy link"</li>
                                    <li>Paste the link into the "Image URL" field in the form</li>
                                </ol>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">✨ Step 4: Finishing</h4>
                                <p className="text-sm text-purple-700">
                                    After pasting the link, the system will automatically convert it to the correct format and display a preview of the image.
                                </p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-red-800 mb-2">💡 Pay attention!!!</h4>
                                <ul className="text-sm text-red-500 list-disc list-inside space-y-1">
                                    <li>Make sure the image is shared publicly ("Anyone with the link")</li>
                                    <li>Only use image files (JPG, PNG, GIF, Webp)</li>
                                    <li>Iamge size must be under 10MB for fast installation</li>
                                    <li>The system supports automation converting various Google Drive link</li>
                                </ul>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-800 mb-2">🔗 Supported link format:</h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>• <code>https://drive.google.com/file/d/FILE_ID/view</code></p>
                                    <p>• <code>https://drive.google.com/uc?id=FILE_ID</code></p>
                                    <p>• <code>https://drive.google.com/uc?export=view&id=FILE_ID</code></p>
                                    <p>• <code>https://drive.google.com/open?id=FILE_ID</code></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <a
                                href="https://drive.google.com/drive/u/0/folders/14-F6VcATkQVW8qwHrA4flc0fX8ffC5Ha"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                📁 Open folder
                            </a>
                            <button
                                onClick={() => setShowGoogleDriveHelp(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Close
                            </button>
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

export default ShopProductManagement;
