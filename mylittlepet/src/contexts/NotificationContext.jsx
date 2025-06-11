import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: 'info', // default type
            duration: 5000, // default duration
            ...notification,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        } return id;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods for different notification types
    const showSuccess = useCallback((message, options = {}) => {
        return addNotification({
            type: 'success',
            message,
            ...options,
        });
    }, [addNotification]);

    const showError = useCallback((message, options = {}) => {
        return addNotification({
            type: 'error',
            message,
            duration: 7000, // Errors stay longer
            ...options,
        });
    }, [addNotification]);

    const showWarning = useCallback((message, options = {}) => {
        return addNotification({
            type: 'warning',
            message,
            ...options,
        });
    }, [addNotification]);

    const showInfo = useCallback((message, options = {}) => {
        return addNotification({
            type: 'info',
            message,
            ...options,
        });
    }, [addNotification]);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Render notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <NotificationComponent
                        key={notification.id}
                        notification={notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

// Notification component for rendering individual notifications
const NotificationComponent = ({ notification, onClose }) => {
    const getTypeStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    return (
        <div
            className={`
        flex items-center justify-between p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        max-w-md min-w-64
        ${getTypeStyles(notification.type)}
      `}
        >
            <div className="flex items-center space-x-3">
                <span className="text-lg">{getIcon(notification.type)}</span>
                <div>
                    {notification.title && (
                        <h4 className="font-medium">{notification.title}</h4>
                    )}
                    <p className="text-sm">{notification.message}</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close notification"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
};

export default NotificationContext;