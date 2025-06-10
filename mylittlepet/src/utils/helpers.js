import { clsx } from 'clsx';
import { RARITY_TYPES, RARITY_COLORS } from '../data/mockData';

// Utility function for combining class names
export function cn(...inputs) {
    return clsx(inputs);
}

// Format date utility - Vietnamese dd/mm/yyyy format
export function formatDate(dateString) {
    if (!dateString) {
        return 'N/A';
    }
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

// Format time ago utility
export function formatTimeAgo(dateString) {
    if (!dateString) {
        return 'N/A';
    }
    try {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return formatDate(dateString);
    } catch (error) {
        return 'N/A';
    }
}

// Get rarity color utility
export function getRarityColor(rarity) {
    switch (rarity?.toLowerCase()) {
        case 'common':
            return '#9ca3af';
        case 'uncommon':
            return '#22c55e';
        case 'rare':
            return '#3b82f6';
        case 'epic':
            return '#8b5cf6';
        case 'legendary':
            return '#f59e0b';
        case 'mythic':
            return '#ec4899';
        default:
            return '#9ca3af';
    }
}

// Get rarity class utility
export function getRarityClass(rarity) {
    switch (rarity?.toLowerCase()) {
        case 'common':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'uncommon':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'rare':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'epic':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'legendary':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'mythic':
            return 'bg-pink-100 text-pink-800 border-pink-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

// Format number with commas
export function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return Number(num).toLocaleString();
}

// Calculate percentage
export function calculatePercentage(value, total) {
    if (value === null || value === undefined || total === null || total === undefined || isNaN(value) || isNaN(total)) {
        return '0';
    }
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
}

// Capitalize first letter
export function capitalize(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate random ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Validate email
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get status color
export function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'text-green-600 bg-green-100';
        case 'inactive':
            return 'text-gray-600 bg-gray-100';
        case 'banned':
            return 'text-red-600 bg-red-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
