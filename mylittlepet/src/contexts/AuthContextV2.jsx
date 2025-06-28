import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);    // Check for existing authentication on app load
    useEffect(() => {
        const initAuth = async () => {            
            // OPTION 2: Check for session timeout (uncomment to use)
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
            
            // Update last activity
            localStorage.setItem('lastActivity', now.toString());
            */

            // PERSISTENT AUTHENTICATION - Restore user session on reload
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('adminUser');

            console.log('🔍 AuthContextV2: Initial auth check', {
                hasToken: !!token,
                hasStoredUser: !!storedUser,
                tokenPreview: token ? token.substring(0, 20) + '...' : null,
                storedUserPreview: storedUser ? storedUser.substring(0, 50) + '...' : null
            });

            // Prioritize stored user data, token is optional for session restore
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    console.log('✅ AuthContextV2: Restoring user session from localStorage', userData);

                    // Skip server validation during reload to prevent logout
                    // Just restore the user session from localStorage
                    setUser(userData);
                    console.log('✅ AuthContextV2: User session restored successfully');

                    // Optional: Validate token with backend in background (don't logout on failure)
                    /*
                    if (token) {
                        try {
                            await apiService.healthCheck();
                            console.log('✅ AuthContextV2: Background token validation successful');
                        } catch (validationError) {
                            console.warn('⚠️ AuthContextV2: Background token validation failed, but keeping user logged in:', validationError);
                            // Don't logout user, just log the warning
                        }
                    }
                    */
                } catch (error) {
                    console.error('❌ AuthContextV2: Failed to parse stored user data:', error);
                    // Clear invalid user data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('adminUser');
                    setUser(null);
                }
            } else {
                console.log('ℹ️ AuthContextV2: No stored user data found');
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 AuthContextV2: Starting login process', { email });

            // Backend authentication
            const response = await apiService.login(email, password);
            console.log('✅ AuthContextV2: Backend login successful:', response); const userData = {
                id: response.adminInfo?.id || response.userId,
                email: response.adminInfo?.email || email,
                name: response.adminInfo?.username || 'Admin User',
                role: response.adminInfo?.role || 'admin',
                avatar: response.avatar || null,
                loginTime: new Date().toISOString(),
                token: response.token
            };

            console.log('📝 AuthContextV2: Setting user data:', userData);
            setUser(userData);

            // Lưu cả token riêng và user data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            console.log('✅ AuthContextV2: User state and token saved successfully');

            return { success: true, user: userData };

        } catch (error) {
            console.error('❌ AuthContextV2: Login failed:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiService.register(userData);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await apiService.changePassword(oldPassword, newPassword);
            return { success: true, message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            console.error('Change password failed:', error);
            throw error;
        }
    };

    const logout = () => {
        console.log('🚪 AuthContextV2: Logging out user');
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('lastVisitedPath'); // Also clear the saved path
        setUser(null);
        console.log('✅ AuthContextV2: Logout completed');
    };

    const clearAuthData = () => {
        localStorage.clear(); // Clear everything
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            changePassword,
            logout,
            clearAuthData,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
