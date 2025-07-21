/**
 * ============================================================================================
 * UTILITY HELPER FUNCTIONS
 * ============================================================================================
 * 
 * This file contains commonly used utility functions throughout the application.
 * These functions provide consistent, reusable solutions for Google Drive URL manipulation.
 * 
 * Architecture Pattern: Pure functions with no side effects
 * Usage: Import specific functions as needed across components
 */

// ============================================================================================
// GOOGLE DRIVE URL UTILITIES
// ============================================================================================
// These utilities handle Google Drive URL manipulation for image hosting
// The application uses Google Drive for consistent, reliable image storage

/**
 * Extract file ID from various Google Drive URL formats
 * Handles all common Google Drive sharing and viewing URL patterns
 * 
 * @param {string} url - Google Drive URL in any format
 * @returns {string|null} Extracted file ID or null if not found/invalid
 * 
 * @example
 * // Sharing link format
 * extractGoogleDriveFileId('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs/view')
 * // Returns: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs"
 * 
 * // Direct link format
 * extractGoogleDriveFileId('https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs')
 * // Returns: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs"
 */
export function extractGoogleDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;

    const cleanUrl = url.trim();

    // Comprehensive patterns for different Google Drive URL formats
    // Google Drive file IDs are alphanumeric with underscores and hyphens
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,                    // Sharing links: /file/d/FILE_ID
        /[?&]id=([a-zA-Z0-9_-]+)/,                        // Query parameter: ?id=FILE_ID or &id=FILE_ID
        /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,    // Direct links: uc?id=FILE_ID
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,  // Open links: open?id=FILE_ID
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/   // Full file URLs: file/d/FILE_ID
    ];

    // Try each pattern until we find a match
    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            // Clean up any accidentally captured URL parameters
            let fileId = match[1];
            fileId = fileId.split('&')[0].split('?')[0];  // Remove trailing parameters
            return fileId;
        }
    }

    return null;  // No valid file ID found
}

/**
 * Convert Google Drive share links to direct image display URLs
 * Transforms any Google Drive URL into a format suitable for <img> src attribute
 * 
 * @param {string} url - Google Drive URL to convert
 * @returns {string} Direct image URL or original URL if conversion fails
 * 
 * @example
 * // Convert sharing link to direct display link
 * convertGoogleDriveLink('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs/view')
 * // Returns: "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs"
 * 
 * // Already converted links pass through unchanged
 * convertGoogleDriveLink('https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs')
 * // Returns: "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlWs"
 */
export function convertGoogleDriveLink(url) {
    if (!url || typeof url !== 'string') return url;

    // If already in correct direct format, return as-is
    if (url.includes('drive.google.com/uc?id=') && !url.includes('export=view')) {
        return url;
    }

    // Extract file ID and convert to direct display format
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url; // Return original if extraction fails

    // Return direct access URL format
    return `https://drive.google.com/uc?id=${fileId}`;
}
