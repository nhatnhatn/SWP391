/**
 * ============================================================================================
 * PROTECTED ROUTE COMPONENT
 * ============================================================================================
 * 
 * This component provides authentication-based route protection for the admin dashboard.
 * It ensures that only authenticated users can access protected pages and provides
 * proper loading states and redirects for unauthenticated access attempts.
 * 
 * FEATURES:
 * - Authentication state checking before rendering protected content
 * - Loading state management during authentication verification
 * - Automatic redirect to login page for unauthenticated users
 * - Return URL preservation for post-login navigation
 * - Accessible loading spinner with proper ARIA attributes
 * - Responsive loading screen design
 * 
 * SECURITY FEATURES:
 * - Prevents unauthorized access to admin functionality
 * - Preserves intended destination for seamless login flow
 * - Handles authentication state changes gracefully
 * - No content flash for unauthenticated users
 * 
 * USAGE PATTERNS:
 * - Wrap admin pages that require authentication
 * - Used in routing configuration for protected routes
 * - Integrates with authentication context for state management
 * 
 * NAVIGATION FLOW:
 * 1. User attempts to access protected route
 * 2. Component checks authentication status
 * 3. If loading: Shows loading spinner
 * 4. If authenticated: Renders protected content
 * 5. If not authenticated: Redirects to login with return URL
 * 
 * ACCESSIBILITY:
 * - Loading state announced to screen readers
 * - Proper focus management during state transitions
 * - High contrast loading indicator
 * - Semantic HTML structure
 * 
 * @param {ReactNode} children - The protected content to render when authenticated
 * @returns {JSX.Element} Protected content, loading state, or redirect to login
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextV2';

export default function ProtectedRoute({ children }) {  //ProtectedRoute wrap others components that need to be protected
    // ============================================================================================
    // AUTHENTICATION STATE AND LOCATION
    // ============================================================================================

    /**
     * Extract authentication state from auth context
     * - isAuthenticated: Boolean indicating if user is logged in
     * - loading: Boolean indicating if auth state is being determined
     */
    const { isAuthenticated, loading } = useAuth();

    /**
     * Get current location for return URL preservation
     * This allows redirecting back to intended destination after login
     */
    const location = useLocation();

    // ============================================================================================
    // LOADING STATE HANDLING
    // ============================================================================================

    /**
     * Show loading spinner while authentication state is being determined
     * 
     * This prevents content flash and provides user feedback during
     * the authentication verification process.
     * 
     * Features:
     * - Centered loading layout with full screen coverage
     * - Animated spinner with smooth rotation
     * - Accessible loading message for screen readers
     * - Consistent with app's design system
     */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
                        role="status"
                        aria-label="Loading authentication status"
                    ></div>
                    <p className="mt-4 text-gray-600" aria-live="polite">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================================================
    // AUTHENTICATION REDIRECT HANDLING
    // ============================================================================================

    /**
     * Redirect unauthenticated users to login page
     * 
     * Preserves the current location as a return URL so users can be
     * redirected back to their intended destination after successful login.
     * 
     * Security note: This prevents unauthorized access to admin functionality
     * and ensures proper authentication flow.
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ============================================================================================
    // PROTECTED CONTENT RENDERING
    // ============================================================================================

    /**
     * Render protected content for authenticated users
     * 
     * At this point, the user is confirmed to be authenticated,
     * so it's safe to render the protected content.
     */
    return children; //render the protected content. EX:"/players, /pets, /shop-products (pages link)"
}