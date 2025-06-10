import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextV2';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute: Auth check', {
        isAuthenticated,
        loading,
        user: user ? { id: user.id, email: user.email } : null,
        pathname: location.pathname
    });

    if (loading) {
        console.log('⏳ ProtectedRoute: Still loading authentication...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
        // Redirect to login page with return URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('✅ ProtectedRoute: Authenticated, rendering protected content');
    return children;
}