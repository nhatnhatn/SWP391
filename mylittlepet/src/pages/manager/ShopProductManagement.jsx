import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Power, Eye, Filter, Package, Store, DollarSign, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Save, RotateCcw, PawPrint } from 'lucide-react';
import { useSimpleShopProducts } from '../../hooks/useSimpleShopProducts';
import { useSimplePets } from '../../hooks/useSimplePets';
import { useAuth } from '../../contexts/AuthContextV2';
import { convertGoogleDriveLink } from '../../utils/helpers';

// Component riêng để hiển thị ảnh với fallback URLs
const ProductImage = ({ imageUrl, productName, className }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Generate fallback URLs - prioritize formats that work better with CORS
    const fallbackUrls = useMemo(() => {
        if (!imageUrl) return [];

        const convertedUrl = convertGoogleDriveLink(imageUrl);
        const fileId = convertedUrl.split('id=')[1];

        if (!fileId) return [convertedUrl];

        return [
            // Google User Content - usually works better with CORS
            `https://lh3.googleusercontent.com/d/${fileId}=w400-h400-c`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,
            // Alternative Google User Content formats
            `https://lh3.googleusercontent.com/d/${fileId}`,
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?id=${fileId}`,
            // Fallback to original
            convertedUrl
        ];
    }, [imageUrl]);

    // Reset state when imageUrl changes
    useEffect(() => {
        setCurrentUrlIndex(0);
        setImageError(false);
    }, [imageUrl]);

    const handleImageError = () => {
        console.log(`❌ Image failed to load (attempt ${currentUrlIndex + 1}):`, fallbackUrls[currentUrlIndex]);
        if (currentUrlIndex < fallbackUrls.length - 1) {
            setCurrentUrlIndex(prev => prev + 1);
            setImageError(false);
            console.log(`🔄 Trying fallback URL ${currentUrlIndex + 2}:`, fallbackUrls[currentUrlIndex + 1]);
        } else {
            setImageError(true);
            console.log('💥 All image URLs failed to load');
        }
    };

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully:', fallbackUrls[currentUrlIndex]);
        setImageError(false);
    };

    if (!imageUrl) {
        return (
            <div className={`bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center ${className}`}>
                <Package className="h-8 w-8 text-gray-400" />
            </div>
        );
    }

    if (imageError) {
        return (
            <div className={`bg-red-50 rounded-lg border border-red-300 flex flex-col items-center justify-center p-2 ${className}`}>
                <Package className="h-6 w-6 text-red-400 mb-1" />
                <span className="text-xs text-red-600 text-center">Lỗi CORS</span>
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 text-center"
                >
                    Xem ảnh
                </a>
                <button
                    onClick={() => {
                        setCurrentUrlIndex(0);
                        setImageError(false);
                    }}
                    className="text-xs text-gray-600 hover:underline mt-1"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <img
                src={fallbackUrls[currentUrlIndex]}
                alt={productName}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                style={{ display: 'block' }}
            />
        </div>
    );
};

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

        // Auto close after duration
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
            <div className={`${bgColor} rounded-lg shadow-2xl border border-white/30 overflow-hidden backdrop-blur-sm`}>
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
                                    {type === 'success' ? 'Thành công' : 'Lỗi'}
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

// Simple ShopProduct Management Component
const ShopProductManagement = () => {
    // Use auth hook to get current user
    const { user } = useAuth();

    // Use hook for data management
    const {
        shopProducts,
        allShopProducts, // All unfiltered products
        shops,
        loading,
        error,
        createShopProduct,
        updateShopProduct,
        deleteShopProduct,
        updateShopProductStatus,
        refreshData,
        getShopName
    } = useSimpleShopProducts();

    // Use pets hook for Pet ID dropdown
    const {
        pets,
        loading: petsLoading
    } = useSimplePets();

    // Dynamic pet types extracted from pets data
    const dynamicPetTypes = useMemo(() => {
        if (!pets || pets.length === 0) return [];

        // Extract unique pet types from pets data
        const types = pets
            .map(pet => pet.petType || pet.type) // Handle both petType and type properties
            .filter(type => type && type.trim()) // Remove empty/null values
            .map(type => type.trim()); // Clean whitespace

        // Return unique types, sorted alphabetically
        const uniqueTypes = [...new Set(types)].sort();

        // Debug log for development
        console.log('🐾 Dynamic Pet Types extracted:', uniqueTypes);

        return uniqueTypes;
    }, [pets]);

    // Helper function to check if a product is a Pet
    const isPetProduct = (product) => {
        // Check if product has petID (indicating it's linked to a pet)
        if (product.petID) return true;

        // Check if product type is one of the dynamic pet types
        return dynamicPetTypes.includes(product.type);
    };

    // Local search state - separated for debouncing
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');    // Filter states
    const [statusFilter, setStatusFilter] = useState('all'); // Đang hoạt động, Hết hàng
    const [currencyFilter, setCurrencyFilter] = useState('all'); // COIN, DIAMOND, GEM
    const [shopTypeFilter, setShopTypeFilter] = useState('all'); // Pet, Food, Toy
    // Debounce search term to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(localSearchTerm);
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Handle search - Use local state with debouncing
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
    }, []);

    // Clear search with debouncing reset
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        clearSearch();
        setStatusFilter('all');
        setCurrencyFilter('all');
        setShopTypeFilter('all');
        setSortConfig({ key: null, direction: 'asc' });
    }, []);

    // Local UI state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editModal, setEditModal] = useState({ isOpen: false, product: null });
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [linkConverted, setLinkConverted] = useState(false);
    const [showGoogleDriveHelp, setShowGoogleDriveHelp] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Local error and success message states
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

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

    // Helper function to show notifications
    const showNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ message, type, show: true });
        // Auto clear after duration
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    };

    // Helper function to clear notifications
    const clearNotification = () => {
        setNotification({ message: '', type: '', show: false });
    };

    // Validation helper functions
    const validateName = (name) => {
        if (!name || name.trim().length === 0) return 'Tên sản phẩm là bắt buộc.';
        if (name.trim().length < 2) return 'Tên sản phẩm phải có ít nhất 2 ký tự.';
        if (name.length > 100) return 'Tên sản phẩm không được vượt quá 100 ký tự.';
        return '';
    };

    const validateType = (type) => {
        if (!type || type.trim().length === 0) return 'Loại sản phẩm là bắt buộc.';
        return '';
    };

    const validatePetType = (petType) => {
        if (!petType || petType.trim().length === 0) return 'Loại thú cưng là bắt buộc.';
        return '';
    };

    const validateDescription = (description) => {
        if (description && description.length > 1000) return 'Mô tả không được vượt quá 1000 ký tự.';
        return '';
    };

    const validateImageUrl = (url) => {
        if (!url || url.trim().length === 0) return 'URL hình ảnh là bắt buộc.';
        if (!url.includes('drive.google.com')) return 'Vui lòng sử dụng Google Drive link.';
        return '';
    };

    const validatePrice = (price) => {
        if (!price || price === '') return 'Giá sản phẩm là bắt buộc.';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) return 'Giá sản phẩm phải lớn hơn 0.';
        if (numPrice > 1000000) return 'Giá sản phẩm không được vượt quá 1,000,000.';
        return '';
    };

    const validateQuantity = (quantity) => {
        if (quantity === '' || quantity === null || quantity === undefined) return 'Số lượng là bắt buộc.';
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) return 'Số lượng phải là số không âm (≥0).';
        if (numQuantity > 10000) return 'Số lượng không được vượt quá 10,000.';
        return '';
    };

    // Clear field error helper
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    };

    // Validation helper functions

    // Handle input changes with validation
    const handleProductNameChange = (value) => {
        setEditForm({ ...editForm, name: value });
        clearFieldError('name');

        const error = validateName(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, name: error }));
        }
    };

    const handleProductTypeChange = (value) => {
        setEditForm({ ...editForm, type: value });
        clearFieldError('type');

        const error = validateType(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, type: error }));
        }
    };

    const handlePetTypeChange = (value) => {
        setEditForm({ ...editForm, petType: value });
        clearFieldError('petType');

        const error = validatePetType(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, petType: error }));
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

    const handleImageUrlChange = (value) => {
        setEditForm({ ...editForm, imageUrl: value });
        clearFieldError('imageUrl');

        const error = validateImageUrl(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, imageUrl: error }));
        }
    };

    const handlePriceChange = (value) => {
        setEditForm({ ...editForm, price: value });
        clearFieldError('price');

        const error = validatePrice(value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, price: error }));
        }
    };

    const handleQuantityChange = (value) => {
        const numValue = parseInt(value) || 0;
        const newForm = { ...editForm, quantity: value };

        // If quantity is 0, automatically set status to inactive
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

    // Show general error as notification
    useEffect(() => {
        if (error) {
            showNotification('Có lỗi xảy ra: ' + error, 'error');
        }
    }, [error]);

    // Check for login success notification from sessionStorage
    useEffect(() => {
        const storedNotification = sessionStorage.getItem('loginSuccessNotification');
        if (storedNotification) {
            try {
                const notificationData = JSON.parse(storedNotification);
                // Check if notification is not too old (within 30 seconds)
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                if (timeDiff < 30000) { // 30 seconds
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                // Clear the notification from sessionStorage after using it
                sessionStorage.removeItem('loginSuccessNotification');
            } catch (error) {
                console.error('Error parsing stored notification:', error);
                sessionStorage.removeItem('loginSuccessNotification');
            }
        }
    }, []);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [editForm, setEditForm] = useState({
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
    });

    // Original form data to track changes
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

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Check if form has changes (for edit mode)
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

    // Check if create form has any content (for create mode)
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
    }, [editForm]);    // Filter and sort all products, then paginate (proper client-side filtering)
    const filteredAndSortedProducts = useMemo(() => {
        // Start with all products (assume allShopProducts exists or use shopProducts)
        const allProducts = allShopProducts || shopProducts;

        // Apply filters first
        let filtered = allProducts.filter(product => {
            // Search filter - use debounced search term
            if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const productName = (product.name || '').toLowerCase();
                const productDescription = (product.description || '').toLowerCase();
                if (!productName.includes(searchLower) && !productDescription.includes(searchLower)) {
                    return false;
                }
            }

            // 1. Status filter (Đang hoạt động, Hết hàng)
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && product.status !== 1) return false;
                if (statusFilter === 'outOfStock' && (product.status !== 0 && product.quantity > 0)) return false;
            }

            // 2. Currency filter (Coin, Diamond, Gem)
            if (currencyFilter !== 'all') {
                if (product.currencyType !== currencyFilter) return false;
            }

            // 3. Shop Type filter - categorize products
            if (shopTypeFilter !== 'all') {
                if (shopTypeFilter === 'Pet') {
                    // Pet products are those with dynamic pet types or petID
                    if (!dynamicPetTypes.includes(product.type) && !product.petID) return false;
                } else if (shopTypeFilter === 'Food') {
                    if (product.type !== 'Food') return false;
                } else if (shopTypeFilter === 'Toy') {
                    if (product.type !== 'Toy') return false;
                }
            }



            return true;
        });

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Special handling for numeric fields
                if (sortConfig.key === 'price' || sortConfig.key === 'quantity') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Special handling for status (ensure numeric comparison)
                if (sortConfig.key === 'status') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                // Handle string comparisons
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [allShopProducts, shopProducts, debouncedSearchTerm, statusFilter, currencyFilter, shopTypeFilter, sortConfig]);

    // Calculate pagination (use filteredAndSortedProducts)
    const totalItems = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
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

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
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

        const predefinedTypes = ['Food', 'Toy'];

        let formType = '';
        let formPetType = '';

        if (dynamicPetTypes.includes(product.type)) {
            formType = 'Pet';
            formPetType = product.type;
        } else if (predefinedTypes.includes(product.type)) {
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

        setCreateModal(false);
        setEditModal({ isOpen: false, product: null });
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
            showNotification('Sản phẩm này đã bị vô hiệu hóa rồi!', 'error');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận vô hiệu hóa',
            message: 'Bạn có chắc muốn vô hiệu hóa sản phẩm này?',
            onConfirm: async () => {
                try {
                    // Update product status to 0 (inactive)
                    await updateShopProduct(productId, { ...product, status: 0 });
                    setLocalError('');
                    showNotification('Vô hiệu hóa sản phẩm thành công!', 'success');
                } catch (error) {
                    console.error('Failed to disable product:', error);
                    showNotification('Vô hiệu hóa thất bại: ' + (error.message || 'Lỗi không xác định'), 'error');
                }
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    // Handle enable product
    const handleEnable = async (productId) => {
        const product = shopProducts.find(p => p.shopProductId === productId);
        if (!product) return;

        if (product.status === 1) {
            showNotification('Sản phẩm này đã được kích hoạt rồi!', 'error');
            return;
        }

        try {
            // Update product status to 1 (active)
            await updateShopProduct(productId, { ...product, status: 1 });
            setLocalError('');
            showNotification('Kích hoạt sản phẩm thành công!', 'success');
        } catch (error) {
            console.error('Failed to enable product:', error);
            showNotification('Kích hoạt thất bại: ' + (error.message || 'Lỗi không xác định'), 'error');
        }
    };

    // Handle form submission for create/edit
    const handleSubmit = async (isEdit = false) => {
        try {
            // Clear previous errors
            setFieldErrors({
                name: '',
                type: '',
                petType: '',
                description: '',
                imageUrl: '',
                price: '',
                quantity: ''
            });

            // Validate all fields
            const errors = {};
            let isValid = true;

            const nameError = validateName(editForm.name);
            if (nameError) {
                errors.name = nameError;
                isValid = false;
            }

            // Chỉ validate type khi đang tạo mới sản phẩm
            if (!isEdit && createModal) {
                const typeError = validateType(editForm.type);
                if (typeError) {
                    errors.type = typeError;
                    isValid = false;
                }
            }

            const priceError = validatePrice(editForm.price);
            if (priceError) {
                errors.price = priceError;
                isValid = false;
            }

            const quantityError = validateQuantity(editForm.quantity);
            if (quantityError) {
                errors.quantity = quantityError;
                isValid = false;
            }

            const descError = validateDescription(editForm.description);
            if (descError) {
                errors.description = descError;
                isValid = false;
            }

            const imageError = validateImageUrl(editForm.imageUrl);
            if (imageError) {
                errors.imageUrl = imageError;
                isValid = false;
            }

            // Chỉ validate pet type và petID khi đang tạo mới và loại sản phẩm là Pet
            if (!isEdit && editForm.type === 'Pet') {
                const petTypeError = validatePetType(editForm.petType);
                if (petTypeError) {
                    errors.petType = petTypeError;
                    isValid = false;
                }
                if (!editForm.petID) {
                    errors.petType = 'Vui lòng chọn thú cưng cụ thể.';
                    isValid = false;
                }
            }

            if (!isValid) {
                setFieldErrors(errors);
                showNotification('Vui lòng kiểm tra và sửa các lỗi trong form.', 'error');
                return;
            }

            // Determine the actual type to submit - chỉ khi tạo mới
            let actualType = '';
            let isPetType = false;

            if (!isEdit) {
                // Logic xử lý type chỉ cho tạo mới sản phẩm
                if (editForm.type === 'Pet') {
                    // Always use "Pet" for all pet products, regardless of specific pet type
                    actualType = 'Pet';
                    isPetType = true;
                } else {
                    actualType = editForm.type;
                    isPetType = false;
                }
            }

            // Prepare submission data
            let submissionData = {
                ...editForm,
                price: parseFloat(editForm.price) || 0, // Ensure numeric
                quantity: parseInt(editForm.quantity) || 0, // Ensure integer
                status: parseInt(editForm.status) || 0, // Ensure integer
                // Add adminId from current user
                adminId: user?.adminId || user?.id
            };

            // Chỉ thêm logic type khi tạo mới
            if (!isEdit) {
                submissionData.type = actualType; // Use the actual type (pet type from selection, or item type)
                submissionData.shopId = isPetType ? 1 : 1; // Set shopId based on product type: Pet types = 1, Item types = 2

                // For Pet types, use the selected petID, otherwise set to null
                if (isPetType && editForm.petID) {
                    submissionData.petID = parseInt(editForm.petID);
                } else {
                    submissionData.petID = null;
                }
            }

            // Remove petType field since we use type directly (or not needed for edit)
            delete submissionData.petType;

            // Remove undefined fields
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] === undefined) {
                    delete submissionData[key];
                }
            });

            console.log('🚀 Submitting product data:', submissionData);
            console.log('🔍 Product type being saved:', submissionData.type);
            console.log('🐾 Pet ID being saved:', submissionData.petID);

            if (isEdit) {
                await updateShopProduct(editModal.product.shopProductId, submissionData);
                setEditModal({ isOpen: false, product: null });
            } else {
                await createShopProduct(submissionData);
                setCreateModal(false);
            }

            // Reset form
            setEditForm({
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
            });

            refreshData();

            setLocalError('');
            showNotification(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!', 'success');
        } catch (error) {
            console.error('❌ Error saving product:', error);
            console.error('❌ Error details:', error.response?.data);

            let errorMessage = 'Lỗi khi lưu sản phẩm';
            if (error.response?.data?.message) {
                errorMessage += ': ' + error.response.data.message;
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            } else {
                errorMessage += ': HTTP ' + (error.response?.status || 500);
            }

            showNotification(errorMessage, 'error');
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        try {
            await deleteShopProduct(deleteModal.product.shopProductId);
            setDeleteModal({ isOpen: false, product: null });
            refreshData();
            setLocalError('');
            showNotification('Xóa sản phẩm thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi khi xóa sản phẩm: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

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
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm trong cửa hàng</h1>
                        </div>
                    </div>

                    {/* Statistics in Header */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <Package className="h-4 w-4 text-purple-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Đang bán</p>
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
                                <p className="text-sm font-medium text-gray-600">Hết hàng</p>
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
                                <p className="text-xs font-medium text-gray-600">Tổng</p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{shopProducts.length}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Đang bán</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">
                                {shopProducts.filter(p => p.status === 1).length}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Hết hàng</p>
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
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
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
                            <span className="text-sm font-medium text-gray-700">Tìm kiếm & Tạo mới sản phẩm</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors duration-200" />                                    <input
                                        type="text"
                                        placeholder="Nhập tên sản phẩm để tìm kiếm..."
                                        value={localSearchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                    />
                                    {localSearchTerm && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                            title="Xóa tìm kiếm"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
                                >
                                    <Plus className="h-5 w-5" />
                                    Thêm Sản phẩm
                                </button>

                            </div>                            {(localSearchTerm || debouncedSearchTerm) && (
                                <div className="bg-purple-100 rounded-md p-3 border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-purple-800 font-medium">
                                            🔍 Đang hiển thị kết quả tìm kiếm cho: "<span className="font-semibold text-purple-900">{debouncedSearchTerm || localSearchTerm}</span>"
                                            {localSearchTerm !== debouncedSearchTerm && localSearchTerm && (
                                                <span className="text-xs text-purple-600 ml-2">(đang nhập...)</span>
                                            )}
                                        </p>
                                        <button
                                            onClick={clearSearch}
                                            className="ml-auto text-purple-600 hover:text-purple-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                        >
                                            Xóa tìm kiếm
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
                                    Bộ lọc nâng cao
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
                                        <span className="text-sm font-medium text-gray-700">Lọc theo nội dung</span>
                                    </div>                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {/* 1. Shop Type Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Loại vật phẩm
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={shopTypeFilter}
                                                    onChange={(e) => handleShopTypeFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả vật phẩm</option>
                                                    <option value="Pet"> Pet</option>
                                                    <option value="Food"> Food</option>
                                                    <option value="Toy"> Toy</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 2. Currency Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Tiền tệ
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={currencyFilter}
                                                    onChange={(e) => handleCurrencyFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả loại tiền</option>
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
                                                Trạng thái
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả trạng thái</option>
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
                                        <span className="text-sm font-medium text-gray-700">Sắp xếp dữ liệu</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Sort Field */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sắp xếp theo
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={sortConfig.key || ''}
                                                    onChange={(e) => {
                                                        const key = e.target.value;
                                                        if (key) {
                                                            handleSort(key);
                                                        } else {
                                                            setSortConfig({ key: null, direction: 'asc' });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> Không sắp xếp</option>
                                                    <option value="name">Tên sản phẩm</option>
                                                    <option value="price">Giá</option>
                                                    <option value="quantity">Số lượng</option>
                                                    <option value="status">Trạng thái</option>
                                                    <option value="type">Loại sản phẩm</option>
                                                    <option value="currencyType">Loại tiền tệ</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Thứ tự
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
                                                        Tăng dần
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
                                                        Giảm dần
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
                                                        Đang sắp xếp theo: <span className="font-bold">
                                                            {sortConfig.key === 'name' && 'Tên sản phẩm'}
                                                            {sortConfig.key === 'price' && 'Giá'}
                                                            {sortConfig.key === 'quantity' && 'Số lượng'}
                                                            {sortConfig.key === 'status' && 'Trạng thái'}
                                                            {sortConfig.key === 'type' && 'Loại sản phẩm'}
                                                            {sortConfig.key === 'currencyType' && 'Loại tiền tệ'}
                                                        </span> ({sortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'})
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                                >
                                                    Bỏ sắp xếp
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
                                        <span className="text-sm font-medium text-gray-700">Thao tác</span>
                                    </div>                                    <div className="flex flex-wrap gap-3">
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
                                                ? 'Không có bộ lọc nào'
                                                : 'Xóa tất cả bộ lọc'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(statusFilter !== 'all' || currencyFilter !== 'all' || shopTypeFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Tìm kiếm',
                                                    statusFilter !== 'all' && 'Trạng thái',
                                                    currencyFilter !== 'all' && 'Tiền tệ',
                                                    shopTypeFilter !== 'all' && 'Loại cửa hàng',
                                                    sortConfig.key && 'Sắp xếp'
                                                ].filter(Boolean).length} bộ lọc đang áp dụng
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            {(debouncedSearchTerm || statusFilter !== 'all' || currencyFilter !== 'all' || shopTypeFilter !== 'all' || sortConfig.key) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                                Hiển thị <span className="font-bold text-blue-600">{currentProducts.length}</span> / <span className="font-bold">{totalItems}</span> sản phẩm
                                {debouncedSearchTerm && <span className="text-gray-500"> với từ khóa "{debouncedSearchTerm}"</span>}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            {sortConfig.key && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded border">
                                    {sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    <span>Sắp xếp: {
                                        sortConfig.key === 'name' ? 'Tên' :
                                            sortConfig.key === 'price' ? 'Giá' :
                                                sortConfig.key === 'quantity' ? 'Số lượng' :
                                                    sortConfig.key === 'status' ? 'Trạng thái' :
                                                        sortConfig.key === 'type' ? 'Loại' :
                                                            sortConfig.key === 'currencyType' ? 'Tiền tệ' :
                                                                sortConfig.key
                                    } ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})</span>
                                </div>
                            )}
                            <span>Trang {currentPage}/{totalPages}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-purple-600 to-pink-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">DANH SÁCH SẢN PHẨM TRONG CỬA HÀNG GAME</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[15%]" />
                                <col className="w-[13%]" />
                                <col className="w-[23%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-purple-600 to-pink-600 border-b-4 border-purple-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Tên sản phẩm
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Loại vật phẩm
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        Mô tả sản phẩm
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Giá
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Loại tiền
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Số lượng
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-purple-500 border-opacity-30">
                                        <div className="flex items-center justify-center gap-1">
                                            Trạng thái
                                        </div>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">Không có sản phẩm nào</h3>                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || shopTypeFilter !== 'all' || statusFilter !== 'all' || currencyFilter !== 'all' ?
                                                            'Không tìm thấy sản phẩm phù hợp với bộ lọc.' :
                                                            'Hãy bắt đầu bằng cách thêm sản phẩm mới.'
                                                        }
                                                    </p>
                                                    {!(localSearchTerm || debouncedSearchTerm) && shopTypeFilter === 'all' && statusFilter === 'all' && currencyFilter === 'all' && (
                                                        <button
                                                            onClick={handleCreate}
                                                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Thêm sản phẩm
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (currentProducts.map((product) => (
                                    <tr key={product.shopProductId} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                                        {/* Product Info */}
                                        <td className="px-3 py-4">
                                            <div className="flex items-center space-x-3 ml-2">
                                                <div>
                                                    {product.imageUrl ? (
                                                        <ProductImage
                                                            imageUrl={product.imageUrl}
                                                            productName={product.name}
                                                            className="h-10 w-10 rounded-lg flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0">
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center min-w-0 flex-1">
                                                    <div className="text-sm font-bold text-gray-900 break-words whitespace-normal leading-tight ml-1" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                </div>
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
                                                {product.type === 'Toy' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200 shadow-sm">
                                                        Toy
                                                    </span>
                                                )}
                                                {isPetProduct(product) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                        Pet
                                                    </span>
                                                )}
                                                {!isPetProduct(product) && !['Food', 'Toy'].includes(product.type) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                        {product.type || 'Chưa phân loại'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-3 py-4">
                                            <div className="text-xs text-center text-gray-700 break-words whitespace-normal text-wrap max-w-full leading-relaxed"
                                                title={product.description || 'Không có mô tả'}>
                                                {product.description || 'Không có mô tả'}
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
                                                {product.status === 1 ? (
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

                                        {/* Actions */}
                                        <td className="px-3 py-4">
                                            <div className="flex justify-center space-x-1">
                                                <button
                                                    onClick={() => handleView(product)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {product.status === 1 ? (
                                                    <button
                                                        onClick={() => handleDelete(product.shopProductId)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Vô hiệu hóa"
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnable(product.shopProductId)}
                                                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Kích hoạt"
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
                                <span className="hidden sm:inline">Trước</span>
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
                                <span className="hidden sm:inline">Tiếp</span>
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
                                    {createModal ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
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
                                            <label className="text-lg font-semibold text-gray-800">Tên sản phẩm</label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => handleProductNameChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Nhập tên sản phẩm"
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
                                            <label className="text-lg font-semibold text-gray-800">URL Hình ảnh</label>
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
                                                    ❓ Hướng dẫn
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

                                                        // Debug logging để kiểm tra conversion
                                                        if (originalUrl !== convertedUrl) {
                                                            console.log('🔄 Google Drive Link Conversion:');
                                                            console.log('Original:', originalUrl);
                                                            console.log('Converted:', convertedUrl);
                                                            setEditForm({ ...editForm, imageUrl: convertedUrl });

                                                            // Hiển thị thông báo thành công
                                                            setLinkConverted(true);
                                                            setTimeout(() => setLinkConverted(false), 3000);
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.imageUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Dán link Google Drive hoặc URL ảnh khác tại đây..."
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
                                            <label className="text-lg font-semibold text-gray-800">Giá sản phẩm</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => handlePriceChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Nhập giá sản phẩm (>0)"
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
                                            <label className="text-lg font-semibold text-gray-800">Loại tiền tệ</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.currencyType}
                                                onChange={(e) => setEditForm({ ...editForm, currencyType: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                                required
                                                title="Chọn loại tiền tệ để mua sản phẩm"
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
                                                <label className="text-lg font-semibold text-gray-800">Loại sản phẩm</label>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={editForm.type}
                                                    onChange={(e) => {
                                                        setEditForm({ ...editForm, type: e.target.value, petType: '', petID: null });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 appearance-none cursor-pointer"
                                                    required
                                                    title="Chọn loại sản phẩm: Pet, Food, hoặc Toy"
                                                >
                                                    <option value="">Chọn loại sản phẩm</option>
                                                    <option value="Pet">Pet</option>
                                                    <option value="Food">Food</option>
                                                    <option value="Toy">Toy</option>
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
                                                <label className={`text-lg font-semibold transition-colors duration-200 ${editForm.type === 'Pet'
                                                    ? 'text-gray-800'
                                                    : 'text-gray-400'
                                                    }`}>Chọn thú cưng</label>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={editForm.type === 'Pet' ? (editForm.petID || '') : ''}
                                                    onChange={(e) => {
                                                        if (editForm.type === 'Pet') {
                                                            const selectedPetId = e.target.value;
                                                            const selectedPet = pets.find(pet => pet.petId == selectedPetId);
                                                            setEditForm({
                                                                ...editForm,
                                                                petID: selectedPetId,
                                                                petType: selectedPet ? selectedPet.petType : null
                                                            });
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none shadow-sm transition-all duration-200 appearance-none ${editForm.type === 'Pet'
                                                        ? 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 bg-white text-gray-900 cursor-pointer'
                                                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    required={editForm.type === 'Pet'}
                                                    disabled={editForm.type !== 'Pet' || petsLoading || pets.length === 0}
                                                >
                                                    <option value="">
                                                        {editForm.type !== 'Pet' ? "Chọn loại sản phẩm 'Pet' trước" :
                                                            petsLoading ? "Đang tải..." :
                                                                pets.length === 0 ? "Không có thú cưng nào" :
                                                                    "Chọn thú cưng"}
                                                    </option>
                                                    {editForm.type === 'Pet' && dynamicPetTypes.map(petType => {
                                                        const firstPetOfType = pets.find(pet => pet.petType === petType);
                                                        return (
                                                            <option key={petType} value={firstPetOfType?.petId}>
                                                                {petType}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
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
                                            <label className="text-lg font-semibold text-gray-800">Số lượng</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={editForm.quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 ${fieldErrors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Nhập số lượng có sẵn (≥0)"
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
                                    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 ${parseInt(editForm.quantity) === 0 ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className={`text-lg font-semibold transition-colors duration-200 ${parseInt(editForm.quantity) === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                                                Trạng thái
                                                {parseInt(editForm.quantity) === 0 && (
                                                    <span className="ml-2 text-sm font-normal text-amber-600">(Tự động: Inactive)</span>
                                                )}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: parseInt(e.target.value) })}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none shadow-sm transition-all duration-200 appearance-none ${parseInt(editForm.quantity) === 0
                                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 bg-white text-gray-900 cursor-pointer'
                                                    }`}
                                                required
                                                title={parseInt(editForm.quantity) === 0 ? "Trạng thái tự động đặt thành Inactive khi số lượng = 0" : "Active: hiển thị trong game | Inactive: ẩn khỏi game"}
                                                disabled={parseInt(editForm.quantity) === 0}
                                            >
                                                <option value="1">Active</option>
                                                <option value="0">Inactive</option>
                                            </select>
                                            <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors duration-200 ${parseInt(editForm.quantity) === 0 ? 'text-gray-300' : 'text-gray-400'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 5 - Description (Full Width) */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <label className="text-lg font-semibold text-gray-800">Mô tả</label>
                                    </div>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => handleDescriptionChange(e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 resize-none ${fieldErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập mô tả sản phẩm (tùy chọn)"
                                        maxLength="500"
                                    />
                                    {fieldErrors.description && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {fieldErrors.description}
                                        </p>
                                    )}
                                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="text-sm text-purple-700 flex items-center justify-end gap-2">
                                            <span>{editForm.description?.length || 0}/500 ký tự</span>
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
                                        Hủy
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
                                                Tạo Sản phẩm
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="w-4 h-4" />
                                                Cập nhật
                                            </>
                                        )}
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
                                Hướng dẫn sử dụng Google Drive
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
                                <h4 className="font-semibold text-blue-800 mb-2">📁 Bước 1: Truy cập thư mục ảnh</h4>
                                <p className="text-sm text-blue-700">
                                    Click vào button "📁 Mở thư mục" để truy cập thư mục Google Drive chứa ảnh sản phẩm.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2">🖼️ Bước 2: Chọn ảnh</h4>
                                <p className="text-sm text-green-700 mb-2">
                                    Trong thư mục Google Drive:
                                </p>
                                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                                    <li>Tìm và click vào ảnh bạn muốn sử dụng</li>
                                    <li>Ảnh sẽ mở trong chế độ preview</li>
                                    <li>Click vào icon "⋮" (3 chấm dọc) ở góc trên bên phải</li>
                                    <li>Chọn "Chia sẻ" hoặc "Share"</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">🔗 Bước 3: Lấy link chia sẻ</h4>
                                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                    <li>Trong popup chia sẻ, click "Thay đổi" bên cạnh "Hạn chế"</li>
                                    <li>Chọn "Bất kỳ ai có liên kết"</li>
                                    <li>Click "Sao chép liên kết"</li>
                                    <li>Dán link vào ô "URL Hình ảnh" trong form</li>
                                </ol>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">✨ Bước 4: Hoàn thành</h4>
                                <p className="text-sm text-purple-700">
                                    Sau khi dán link, hệ thống sẽ tự động chuyển đổi sang định dạng phù hợp và hiển thị ảnh preview.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">💡 Lưu ý quan trọng</h4>
                                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                    <li>Đảm bảo ảnh được chia sẻ công khai ("Bất kỳ ai có liên kết")</li>
                                    <li>Chỉ sử dụng các file ảnh (JPG, PNG, GIF, WebP)</li>
                                    <li>Kích thước ảnh nên dưới 10MB để tải nhanh</li>
                                    <li>Hệ thống hỗ trợ tự động chuyển đổi nhiều định dạng link Google Drive</li>
                                </ul>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-800 mb-2">🔗 Các định dạng link được hỗ trợ:</h4>
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
                                📁 Mở thư mục ngay
                            </a>
                            <button
                                onClick={() => setShowGoogleDriveHelp(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteModal.product?.name}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Xóa
                            </button>
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
                                    <h3 className="text-4xl font-bold text-white">Chi tiết sản phẩm</h3>
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
                                                Tên sản phẩm
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
                                                <h4 className="text-lg font-semibold text-gray-800">Hình ảnh sản phẩm</h4>
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
                                                                Hình ảnh sản phẩm
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400 mb-1" />
                                                        <span className="text-gray-500 text-xs font-medium">Không có hình ảnh</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h4>
                                            </div>

                                            <div className="space-y-3">


                                                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-600">Loại sản phẩm</span>
                                                        <div>
                                                            {selectedProduct.type === 'Food' && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                                    Food
                                                                </span>
                                                            )}
                                                            {selectedProduct.type === 'Toy' && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200 shadow-sm">
                                                                    Toy
                                                                </span>
                                                            )}
                                                            {isPetProduct(selectedProduct) && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 shadow-sm">
                                                                    Pet
                                                                </span>
                                                            )}
                                                            {!isPetProduct(selectedProduct) && !['Food', 'Toy'].includes(selectedProduct.type) && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200 shadow-sm">
                                                                    {selectedProduct.type || 'Chưa phân loại'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Only show linked pet info for Pet products */}
                                                {isPetProduct(selectedProduct) && (
                                                    <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-600">Thú cưng liên kết</span>
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
                                                                    <span className="text-sm text-gray-500 italic">Không có</span>
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
                                                <h4 className="text-lg font-semibold text-gray-800">Chi tiết sản phẩm</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {/* Pricing Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Thông tin giá cả</h5>
                                                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Giá sản phẩm</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-green-700">
                                                                {selectedProduct.price?.toLocaleString('vi-VN') || 0} {selectedProduct.currencyType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Inventory Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Thông tin kho hàng</h5>
                                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Số lượng tồn kho</span>
                                                        <span className="text-xl font-bold text-blue-700">{selectedProduct.quantity}</span>
                                                    </div>
                                                </div>

                                                {/* Status Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Trạng thái hoạt động</h5>
                                                    <div className={`p-3 rounded-lg border ${selectedProduct.status === 1
                                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                                                        }`}>
                                                        <span className="text-sm font-medium text-gray-600 block mb-2">Trạng thái hiện tại</span>
                                                        <div className="flex items-center justify-between gap-2">
                                                            {selectedProduct.status === 1 ? (
                                                                <>
                                                                    <span className="text-base font-semibold text-green-700">Active</span>

                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-base font-semibold text-red-700">Inactive</span>

                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Information */}
                                                <div className="space-y-3">
                                                    <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1">Thông tin bổ sung</h5>
                                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">ID sản phẩm</span>
                                                        <span className="text-base font-bold text-purple-700 font-mono">
                                                            #{selectedProduct.shopProductId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Description */}
                                            <div>
                                                <h5 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Mô tả sản phẩm</h5>
                                                <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                                                    {selectedProduct.description ? (
                                                        <div className="space-y-2">
                                                            <div className="max-h-24 overflow-y-auto pr-2">
                                                                <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap word-wrap">
                                                                    {selectedProduct.description}
                                                                </p>
                                                            </div>
                                                            {selectedProduct.description.length > 150 && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
                                                                    <Package className="h-3 w-3" />
                                                                    <span>{selectedProduct.description.length} ký tự</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center py-4">
                                                            <span className="text-gray-400 italic flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                Chưa có mô tả cho sản phẩm này
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
                                        Đóng
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(null);
                                            handleEdit(selectedProduct);
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
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
                                Hủy
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProductManagement;
