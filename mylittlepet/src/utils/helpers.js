import { clsx } from 'clsx';


// Utility function for combining class names
export function cn(...inputs) {
    return clsx(inputs);
}

// Format date utility - Vietnamese dd/mm/yyyy format
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
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

// Google Drive utilities
export function extractGoogleDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;

    // Clean the URL and remove any extra parameters
    const cleanUrl = url.trim();

    // Match various Google Drive URL formats
    // Google Drive file IDs can contain: letters, numbers, underscore, hyphens (including multiple consecutive)
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,                    // /file/d/FILE_ID (sharing links)
        /[?&]id=([a-zA-Z0-9_-]+)/,                        // ?id=FILE_ID or &id=FILE_ID (uc/open links)
        /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,    // uc?id=FILE_ID (direct uc links)
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,  // open?id=FILE_ID (open links)
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/   // full file URL (view links)
    ];

    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            // Return the file ID, removing any trailing parameters that might be captured
            let fileId = match[1];
            // Clean up any accidentally captured parameters (stop at first & or ?)
            fileId = fileId.split('&')[0].split('?')[0];
            return fileId;
        }
    }

    return null;
}

export function convertGoogleDriveLink(url) {
    if (!url || typeof url !== 'string') return url;

    // If it's already in the correct format, return as is
    if (url.includes('drive.google.com/uc?id=') && !url.includes('export=view')) {
        return url;
    }

    // Extract file ID
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url; // Return original if can't extract ID

    // Return the correct format for direct image display
    return `https://drive.google.com/uc?id=${fileId}`;
}

// Format currency with Vietnamese formatting
export function formatCurrency(amount, type) {
    const formatAmount = new Intl.NumberFormat('vi-VN').format(amount);
    const symbols = {
        'COIN': '🪙',
        'DIAMOND': '💎',
        'GEM': '🔷',
        // Support database case variations
        'Coin': '🪙',
        'Diamond': '💎',
        'Gem': '🔷'
    };
    return `${symbols[type] || '💰'} ${formatAmount}`;
}
