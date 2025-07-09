import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing notifications and data refresh operations
 * Provides consistent notification handling and data refresh patterns across all pages
 */
export const useNotificationManager = (refreshData) => {
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    // Helper function to show notifications
    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        setNotification({ message, type, show: true });
        // Auto clear after duration
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    }, []);

    // Helper function to clear notifications
    const clearNotification = useCallback(() => {
        setNotification({ message: '', type: '', show: false });
    }, []);

    // Enhanced function for handling operations with notifications and refresh
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
                // Store notification in sessionStorage for page transitions
                const notificationData = {
                    message: successMessage,
                    type: 'success',
                    timestamp: Date.now()
                };
                sessionStorage.setItem('operationSuccessNotification', JSON.stringify(notificationData));
            } else {
                showNotification(successMessage, 'success');
            }

            // Refresh data if needed
            if (shouldRefresh && refreshData) {
                await refreshData();
            }

            return result;
        } catch (error) {
            console.error('Operation failed:', error);
            const errorMsg = error.response?.data?.message || error.message || errorMessage;
            showNotification(errorMsg, 'error');
            throw error;
        }
    }, [showNotification, refreshData]);

    // Check for persisted notifications on component mount
    useEffect(() => {
        // Check for login success notification
        const loginNotification = sessionStorage.getItem('loginSuccessNotification');
        if (loginNotification) {
            try {
                const notificationData = JSON.parse(loginNotification);
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                // Show notification if it's not too old (within 30 seconds)
                if (timeDiff < 30000) {
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                sessionStorage.removeItem('loginSuccessNotification');
            } catch (error) {
                console.error('Error parsing login notification:', error);
                sessionStorage.removeItem('loginSuccessNotification');
            }
        }

        // Check for operation success notification
        const operationNotification = sessionStorage.getItem('operationSuccessNotification');
        if (operationNotification) {
            try {
                const notificationData = JSON.parse(operationNotification);
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                // Show notification if it's not too old (within 10 seconds)
                if (timeDiff < 10000) {
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                sessionStorage.removeItem('operationSuccessNotification');
            } catch (error) {
                console.error('Error parsing operation notification:', error);
                sessionStorage.removeItem('operationSuccessNotification');
            }
        }
    }, [showNotification]);

    // Handle form submission with validation, notification, and refresh
    const handleFormSubmission = useCallback(async (
        formData,
        validationErrors,
        submitOperation,
        successMessage,
        errorMessage = 'Có lỗi xảy ra',
        onSuccess = null,
        shouldRefresh = true
    ) => {
        // Check for validation errors
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

            // Refresh data if needed
            if (shouldRefresh && refreshData) {
                await refreshData();
            }

            return true;
        } catch (error) {
            console.error('Form submission failed:', error);
            const errorMsg = error.response?.data?.message || error.message || errorMessage;
            showNotification(errorMsg, 'error');
            return false;
        }
    }, [showNotification, refreshData]);

    return {
        notification,
        showNotification,
        clearNotification,
        handleOperationWithNotification,
        handleFormSubmission
    };
};

export default useNotificationManager;
