/**
 * Custom Hook for Notification Management
 * 
 * Provides a centralized notification system for the application including:
 * - Toast notification display and management
 * - Operation result handling with notifications
 * - Form submission with validation and notifications
 * - Persistent notifications across page navigation
 * - Auto-cleanup and timing management
 * 
 * @param {Function} refreshData - Optional callback to refresh data after operations
 * @returns {Object} Notification state and management functions
 */
import { useState, useEffect, useCallback } from 'react';

export const useNotificationManager = (refreshData) => {
    // ===== STATE MANAGEMENT =====
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        show: false
    });

    // ===== CORE NOTIFICATION FUNCTIONS =====
    /**
     * Display a notification toast
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     * @param {number} duration - How long to show notification (ms)
     */
    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        setNotification({ message, type, show: true });
        // Auto-clear after specified duration
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    }, []);

    /**
     * Manually clear the current notification
     */
    const clearNotification = useCallback(() => {
        setNotification({ message: '', type: '', show: false });
    }, []);

    // ===== ADVANCED OPERATION HANDLING =====
    /**
     * Handle operations with automatic notification and data refresh
     * @param {Function} operation - Async operation to execute
     * @param {string} successMessage - Message to show on success
     * @param {string} errorMessage - Message to show on error
     * @param {boolean} shouldRefresh - Whether to refresh data after success
     * @param {boolean} persistSuccess - Whether to persist success notification across page transitions
     * @returns {Promise} Operation result
     */
    const handleOperationWithNotification = useCallback(async (
        operation,
        successMessage,
        errorMessage = 'Có lỗi xảy ra',
        shouldRefresh = true,
        persistSuccess = false
    ) => {
        try {
            const result = await operation();

            if (persistSuccess) {
                // Store notification for cross-page persistence
                const notificationData = {
                    message: successMessage,
                    type: 'success',
                    timestamp: Date.now()
                };
                sessionStorage.setItem('operationSuccessNotification', JSON.stringify(notificationData));
            } else {
                showNotification(successMessage, 'success');
            }

            // Refresh data if needed and callback provided
            if (shouldRefresh && refreshData) {
                await refreshData();
            }

            return result;
        } catch (error) {
            console.error('❌ Operation failed:', error);
            const errorMsg = error.response?.data?.message || error.message || errorMessage;
            showNotification(errorMsg, 'error');
            throw error;
        }
    }, [showNotification, refreshData]);

    // ===== PERSISTENT NOTIFICATION MANAGEMENT =====
    // Check for persisted notifications on component mount
    useEffect(() => {
        // Handle login success notifications
        const loginNotification = sessionStorage.getItem('loginSuccessNotification');
        if (loginNotification) {
            try {
                const notificationData = JSON.parse(loginNotification);
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                // Show notification if it's recent (within 30 seconds)
                if (timeDiff < 30000) {
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                sessionStorage.removeItem('loginSuccessNotification');
            } catch (error) {
                console.error('❌ Error parsing login notification:', error);
                sessionStorage.removeItem('loginSuccessNotification');
            }
        }

        // Handle general operation success notifications
        const operationNotification = sessionStorage.getItem('operationSuccessNotification');
        if (operationNotification) {
            try {
                const notificationData = JSON.parse(operationNotification);
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                // Show notification if it's recent (within 10 seconds)
                if (timeDiff < 10000) {
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                sessionStorage.removeItem('operationSuccessNotification');
            } catch (error) {
                console.error('❌ Error parsing operation notification:', error);
                sessionStorage.removeItem('operationSuccessNotification');
            }
        }
    }, [showNotification]);

    // ===== FORM SUBMISSION HANDLING =====
    /**
     * Handle form submission with validation, notification, and data refresh
     * @param {Object} formData - Form data to submit
     * @param {Object} validationErrors - Object containing field validation errors
     * @param {Function} submitOperation - Async operation to submit the form
     * @param {string} successMessage - Success message to display
     * @param {string} errorMessage - Error message to display on failure
     * @param {Function} onSuccess - Optional success callback
     * @param {boolean} shouldRefresh - Whether to refresh data after success
     * @returns {Promise<boolean>} Success status
     */
    const handleFormSubmission = useCallback(async (
        formData,
        validationErrors,
        submitOperation,
        successMessage,
        errorMessage = 'Có lỗi xảy ra',
        onSuccess = null,
        shouldRefresh = true
    ) => {
        // Check for validation errors first
        const hasErrors = Object.values(validationErrors).some(error => error !== '');
        if (hasErrors) {
            showNotification('Vui lòng kiểm tra và sửa các lỗi trong form.', 'error');
            return false;
        }

        try {
            const result = await submitOperation(formData);
            showNotification(successMessage, 'success');

            // Execute success callback if provided
            if (onSuccess) {
                await onSuccess(result);
            }

            // Refresh data if needed and callback provided
            if (shouldRefresh && refreshData) {
                await refreshData();
            }

            return true;
        } catch (error) {
            console.error('❌ Form submission failed:', error);
            const errorMsg = error.response?.data?.message || error.message || errorMessage;
            showNotification(errorMsg, 'error');
            return false;
        }
    }, [showNotification, refreshData]);

    // ===== RETURN HOOK INTERFACE =====
    return {
        // ===== STATE =====
        notification,                    // Current notification state

        // ===== CORE FUNCTIONS =====
        showNotification,                // Display notification
        clearNotification,               // Clear current notification

        // ===== ADVANCED HANDLERS =====
        handleOperationWithNotification, // Handle operations with notifications
        handleFormSubmission             // Handle form submissions with validation
    };
};

export default useNotificationManager;
