/**
 * ============================================================================================
 * AUTHENTICATION CONTEXT V2
 * ============================================================================================
 * 
 * This context provides centralized authentication management for the My Little Pet admin
 * application. It handles user login, registration, session persistence, token validation,
 * and secure logout functionality with comprehensive error handling.
 * 
 * FEATURES:
 * - Persistent authentication across browser sessions
 * - Automatic token validation on app initialization
 * - Secure token storage in localStorage
 * - Session restoration after page reload
 * - Comprehensive error handling for auth operations
 * - User data management and state synchronization
 * - Secure logout with complete data cleanup
 * 
 * SECURITY FEATURES:
 * - Token validation on app startup
 * - Automatic session cleanup on invalid tokens
 * - Protected API endpoint verification
 * - Secure local storage management
 * - Error boundary for authentication failures
 * 
 * STATE MANAGEMENT:
 * - user: Object containing authenticated user information
 * - loading: Boolean indicating authentication check in progress
 * - isAuthenticated: Computed boolean for authentication status
 * 
 * METHODS:
 * - login(email, password): Authenticate user with backend
 * - register(userData): Register new admin user
 * - changePassword(oldPassword, newPassword): Update user password
 * - logout(): Clear authentication data and user session
 * - clearAuthData(): Emergency data clear function
 * 
 * STORAGE STRATEGY:
 * - authToken: JWT token stored in localStorage
 * - adminUser: User data object stored in localStorage
 * - lastActivity: Session timeout tracking (optional feature)
 * 
 * USAGE:
 * - Wrap app with AuthProvider component
 * - Use useAuth() hook to access authentication state and methods
 * - ProtectedRoute components use isAuthenticated for access control
 * 
 * @version 2.0
 * @author My Little Pet Team
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// ============================================================================================
// CONTEXT CREATION AND CUSTOM HOOK
// ============================================================================================

/**
 * Authentication Context
 * Provides authentication state and methods to child components
 */
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * 
 * Provides a safe way to access authentication state and methods.
 * Throws an error if used outside of AuthProvider to prevent runtime issues.
 * 
 * @returns {Object} Authentication context value with user, loading, and methods
 * @throws {Error} If used outside of AuthProvider
 * 
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ============================================================================================
// AUTHENTICATION PROVIDER COMPONENT
// ============================================================================================

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides authentication methods to the entire
 * application. Handles user session persistence, token validation, and secure
 * authentication operations.
 * 
 * Features:
 * - Automatic session restoration on app load
 * - Token validation with backend verification
 * - Secure local storage management
 * - Loading state management during auth operations
 * - Comprehensive error handling and logging
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to provide context to
 * @returns {JSX.Element} AuthContext.Provider with authentication functionality
 */
export const AuthProvider = ({ children }) => {
    // ============================================================================================
    // STATE MANAGEMENT
    // ============================================================================================

    /**
     * User Authentication State
     * Contains the currently authenticated user's information
     * null when user is not authenticated
     */
    const [user, setUser] = useState(null);

    /**
     * Loading State
     * Indicates whether authentication initialization is in progress
     * Used to show loading screens and prevent premature redirects
     */
    const [loading, setLoading] = useState(true);

    // ============================================================================================
    // AUTHENTICATION INITIALIZATION
    // ============================================================================================

    /**
     * Initialize Authentication on App Load
     * 
     * This effect runs once when the app loads to:
     * 1. Check for existing authentication tokens
     * 2. Validate tokens with the backend
     * 3. Restore user session if valid
     * 4. Clean up invalid or expired sessions
     * 
     * The process ensures users don't need to log in again after page
     * refreshes while maintaining security through token validation.
     */
    useEffect(() => {
        /**
         * Async function to initialize authentication state
         * 
         * Performs the following operations:
         * 1. Retrieve stored authentication data from localStorage
         * 2. Validate session timeout (optional feature)
         * 3. Verify token validity with backend API
         * 4. Restore user session or clear invalid data
         * 5. Set loading to false when complete
         */
        const initAuth = async () => {

            // ========================================================================================
            // OPTIONAL: SESSION TIMEOUT CHECKING
            // ========================================================================================
            // Uncomment this section to enable session timeout functionality
            // Session will expire after 30 minutes of inactivity
            /*
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('adminUser');
            const lastActivity = localStorage.getItem('lastActivity');
            
            // Session timeout: 30 minutes (1800000 ms)
            const SESSION_TIMEOUT = 30 * 60 * 1000;
            const now = Date.now();
            
            if (lastActivity && (now - parseInt(lastActivity)) > SESSION_TIMEOUT) {
                console.log('🕐 AuthContextV2: Session expired due to timeout');
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('lastActivity');
                setUser(null);
                setLoading(false);
                return;
            }
            
            // Update last activity timestamp
            localStorage.setItem('lastActivity', now.toString());
            */

            // ========================================================================================
            // PERSISTENT AUTHENTICATION - Session Restoration
            // ========================================================================================

            /**
             * Retrieve stored authentication data
             * Both token and user data must exist for session restoration
             */
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('adminUser');

            console.log('🔍 AuthContextV2: Initial auth check', {
                hasToken: !!token,
                hasStoredUser: !!storedUser,
                tokenPreview: token ? token.substring(0, 20) + '...' : null,
                storedUserPreview: storedUser ? storedUser.substring(0, 50) + '...' : null
            });

            /**
             * Session Restoration Process
             * Only proceed if both token and user data are available
             * This prevents partial session restoration that could cause errors
             */
            if (token && storedUser) {
                try {
                    /**
                     * Parse User Data from Storage
                     * Convert JSON string back to user object
                     * This may fail if data is corrupted or invalid
                     */
                    const userData = JSON.parse(storedUser);
                    console.log('✅ AuthContextV2: Attempting to restore user session', userData);

                    // ========================================================================================
                    // TOKEN VALIDATION WITH BACKEND
                    // ========================================================================================

                    /**
                     * Security Check: Validate Token with Backend
                     * 
                     * Makes a request to a protected endpoint to verify:
                     * 1. Token is still valid (not expired)
                     * 2. Token hasn't been revoked
                     * 3. User still has valid permissions
                     * 
                     * This prevents using stale or compromised tokens
                     */
                    try {
                        // Make a request to the backend to validate the JWT token
                        // This checks if the token is still valid and the user session can be restored
                        const response = await fetch('http://localhost:8080/api/auth/protected', {
                            // Set request headers:
                            // - 'Authorization': sends the JWT token to authenticate the user
                            // - 'Content-Type': specifies that the request body (if any) is in JSON format
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            /**
                             * Token Valid - Restore Session
                             * Token passed backend validation, safe to restore user session
                             */
                            console.log('✅ AuthContextV2: Token is valid, restoring session');
                            setUser(userData);
                        } else {
                            /**
                             * Token Invalid - Clear Session
                             * Token failed validation, clear all auth data for security
                             */
                            console.log('❌ AuthContextV2: Token is invalid, clearing session');
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('adminUser');
                            setUser(null);
                        }
                    } catch (tokenError) {
                        /**
                         * Network/API Error During Validation
                         * Clear session data to be safe, user will need to re-login
                         */
                        console.error('❌ AuthContextV2: Token validation failed:', tokenError);
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('adminUser');
                        setUser(null);
                    }
                } catch (error) {
                    /**
                     * User Data Parsing Error
                     * Stored user data is corrupted or invalid format
                     * Clear all auth data and require fresh login
                     */
                    console.error('❌ AuthContextV2: Failed to parse stored user data:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('adminUser');
                    setUser(null);
                }
            } else {
                /**
                 * No Authentication Data Found
                 * Either first visit or user previously logged out
                 * Clean up any partial data that might exist
                 */
                console.log('ℹ️ AuthContextV2: No stored token or user data found');
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminUser');
                setUser(null);
            }

            /**
             * Initialization Complete
             * Set loading to false to allow app to proceed
             * This enables routing and component rendering
             */
            setLoading(false);
        };

        /**
         * Initialize Authentication on Component Mount
         * This triggers session restoration when the app starts
         */
        initAuth();
    }, []); // Empty dependency array = run only once on mount

    // ================================================================================================
    // AUTHENTICATION METHODS
    // ================================================================================================

    /**
     * Login Method
     * 
     * Handles user authentication with email/password
     * Manages both success and error scenarios
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<{success: boolean, message: string, user?: Object}>}
     */

    const login = async (email, password) => {
        try {
            console.log('🔐 AuthContextV2: Starting login process', { email });

            // ========================================================================================
            // BACKEND AUTHENTICATION
            // ========================================================================================

            /**
             * Send credentials to backend for verification
             * This validates user credentials and returns authentication token
             */
            const response = await apiService.login(email, password);
            console.log('✅ AuthContextV2: Backend login successful:', response);

            // ========================================================================================
            // USER DATA PROCESSING
            // ========================================================================================

            /**
             * Construct User Object
             * Normalize response data into consistent user object structure
             * Handles different response formats from backend
             */
            const userData = {
                id: response.adminInfo?.id || response.userId,
                email: response.adminInfo?.email || email,
                name: response.adminInfo?.username || 'Admin User',
                role: response.adminInfo?.role || 'admin',
                avatar: response.avatar || null,
                loginTime: new Date().toISOString(),
                token: response.token
            };

            console.log('📝 AuthContextV2: Setting user data:', userData);

            // ========================================================================================
            // STATE AND STORAGE UPDATE
            // ========================================================================================

            /**
             * Update Application State
             * Set user in context to trigger auth state changes throughout app
             */
            setUser(userData);

            /**
             * Persist Authentication Data
             * Save to localStorage for session restoration on page refresh
             * Store token and user data separately for security and convenience
             */
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            console.log('✅ AuthContextV2: User state and token saved successfully');

            /**
             * Return Success Response
             * Indicates successful login with user data
             */
            return { success: true, user: userData };

        } catch (error) {
            // ========================================================================================
            // ERROR HANDLING
            // ========================================================================================

            /**
             * Login Error Processing
             * Logs detailed error information for debugging
             * Returns standardized error response to caller
             */
            console.error('❌ AuthContextV2: Login failed:', error);
            console.error('❌ AuthContextV2: Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            /**
             * Return Structured Error Response
             * Instead of throwing, return error object for graceful handling
             * Allows UI to show appropriate error messages to user
             */
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    };

    /**
     * Register Method
     * 
     * Handles new user registration
     * Creates new account with provided user data
     * 
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User's email address
     * @param {string} userData.password - User's password
     * @param {string} userData.username - User's chosen username
     * @returns {Promise<Object>} Registration response from backend
     */
    const register = async (userData) => {
        try {
            /**
             * Send Registration Request to Backend
             * Creates new user account with provided data
             */
            const response = await apiService.register(userData);
            return response;
        } catch (error) {
            /**
             * Registration Error Handling
             * Log error and re-throw for component handling
             */
            console.error('❌ AuthContextV2: Register error:', error);
            throw error;
        }
    };

    /**
     * Logout Method
     * 
     * Securely logs out the current user by:
     * 1. Clearing all authentication data from localStorage
     * 2. Resetting user state to null
     * 3. Cleaning up session-related data
     * 
     * This ensures complete cleanup and prevents session leakage
     */
    const logout = () => {
        console.log('🚪 AuthContextV2: Logging out user');

        /**
         * Clear Authentication Data
         * Remove all auth-related items from localStorage
         * This includes tokens, user data, and session tracking
         */
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('lastVisitedPath'); // Also clear the saved path

        /**
         * Reset Application State
         * Set user to null to trigger auth state changes
         */
        setUser(null);
        console.log('✅ AuthContextV2: Logout completed');
    };

    /**
     * Clear Auth Data Method
     * 
     * Nuclear option - clears ALL localStorage data
     * Use this for complete reset or when corruption is suspected
     * More aggressive than logout() method
     */
    const clearAuthData = () => {
        /**
         * Clear All Local Storage
         * WARNING: This removes ALL localStorage data, not just auth data
         * Use with caution as it may affect other app features
         */
        localStorage.clear(); // Clear everything
        setUser(null);
    };

    // ================================================================================================
    // CONTEXT PROVIDER
    // ================================================================================================

    /**
     * AuthContext Provider
     * 
     * Provides authentication state and methods to all child components
     * 
     * Available Values:
     * - user: Current authenticated user object (null if not authenticated)
     * - loading: Boolean indicating if auth initialization is in progress
     * - login: Function to authenticate user with email/password
     * - register: Function to create new user account
     * - changePassword: Function to change user's password
     * - logout: Function to securely log out current user
     * - clearAuthData: Function to clear all authentication data
     * - isAuthenticated: Boolean computed from user state
     */
    return (
        <AuthContext.Provider value={{
            user,                    // Current user object or null
            loading,                 // Authentication loading state
            login,                   // Login method
            register,                // Registration method
            logout,                  // Logout method
            clearAuthData,          // Clear all auth data method
            isAuthenticated: !!user  // Computed authentication status
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
