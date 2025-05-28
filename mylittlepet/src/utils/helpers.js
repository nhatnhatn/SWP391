import { clsx } from 'clsx';
import { RARITY_TYPES, RARITY_COLORS } from '../data/mockData';

// Utility function for combining class names
export function cn(...inputs) {
    return clsx(inputs);
}

// Format date utility
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time ago utility
export function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(dateString);
}

// Get rarity color utility
export function getRarityColor(rarity) {
    return RARITY_COLORS[rarity] || RARITY_COLORS[RARITY_TYPES.COMMON];
}

// Get rarity class utility
export function getRarityClass(rarity) {
    return `rarity-${rarity}`;
}

// Format number with commas
export function formatNumber(num) {
    return num.toLocaleString();
}

// Calculate percentage
export function calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
}

// Capitalize first letter
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate random ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Validate email
export function isValidEmail(email) {
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
