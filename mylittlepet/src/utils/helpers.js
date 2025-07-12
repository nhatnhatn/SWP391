/**
 * Utility Helper Functions
 * 
 * This file contains commonly used utility functions throughout the application
 * including date formatting, string manipulation, validation, and Google Drive utilities
 */
import { clsx } from 'clsx';

// ===== CLASS NAME UTILITIES =====
/**
 * Utility function for combining CSS class names
 * @param {...string} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
    return clsx(inputs);
}

// ===== DATE & TIME UTILITIES =====
/**
 * Format date to Vietnamese dd/mm/yyyy format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Format time ago in a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string
 */
export function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return formatDate(dateString);
}

// ===== NUMBER FORMATTING =====
/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toLocaleString('vi-VN');
}

/**
 * Calculate percentage with one decimal place
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {string} Percentage string
 */
export function calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
}

// ===== STRING UTILITIES =====
/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random ID for temporary use
 * @returns {string} Random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ===== VALIDATION UTILITIES =====
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== STATUS & COLOR UTILITIES =====
/**
 * Get status-specific CSS classes for badges
 * @param {string} status - Status value
 * @returns {string} CSS classes
 */
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

// ===== PERFORMANCE UTILITIES =====
/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

// ===== GOOGLE DRIVE UTILITIES =====
/**
 * Extract file ID from various Google Drive URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} Extracted file ID or null if not found
 */
export function extractGoogleDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;

    const cleanUrl = url.trim();

    // Patterns for different Google Drive URL formats
    // File IDs can contain: letters, numbers, underscores, hyphens
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,                    // /file/d/FILE_ID (sharing links)
        /[?&]id=([a-zA-Z0-9_-]+)/,                        // ?id=FILE_ID or &id=FILE_ID
        /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,    // uc?id=FILE_ID (direct links)
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,  // open?id=FILE_ID (open links)
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/   // full file URL (view links)
    ];

    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            // Clean up any accidentally captured parameters
            let fileId = match[1];
            fileId = fileId.split('&')[0].split('?')[0];
            return fileId;
        }
    }

    return null;
}

/**
 * Convert Google Drive share links to direct image display URLs
 * @param {string} url - Google Drive URL to convert
 * @returns {string} Direct image URL or original URL if conversion fails
 */
export function convertGoogleDriveLink(url) {
    if (!url || typeof url !== 'string') return url;

    // If already in correct format, return as is
    if (url.includes('drive.google.com/uc?id=') && !url.includes('export=view')) {
        return url;
    }

    // Extract file ID and convert to direct display format
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url; // Return original if extraction fails

    return `https://drive.google.com/uc?id=${fileId}`;
}
