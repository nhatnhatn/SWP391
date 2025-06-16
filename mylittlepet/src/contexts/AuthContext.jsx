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
    const [loading, setLoading] = useState(true);

    // Check for existing authentication on app load
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('adminUser');

            console.log('🔍 AuthContext: Initial auth check', {
                hasToken: !!token,
                hasStoredUser: !!storedUser,
                tokenPreview: token ? token.substring(0, 20) + '...' : null,
                storedUserPreview: storedUser ? storedUser.substring(0, 50) + '...' : null
            });

            if (token && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    console.log('✅ AuthContext: Using stored user data');
                    setUser(userData);
                } catch (error) {
                    console.error('❌ AuthContext: User data parsing failed:', error);
                    // Clear invalid data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('adminUser');
                    setUser(null);
                }
            } else {
                console.log('ℹ️ AuthContext: No stored auth data found');
            }
            setLoading(false);
        };

        initAuth();
    }, []); const login = async (email, password) => {
        try {
            console.log('🔐 AuthContext: Starting login process', { email });

            // In the mock version, just use the API service for login
            const response = await apiService.login(email, password);
            console.log('✅ AuthContext: Login successful:', response);

            const userData = {
                id: response.adminInfo?.id || response.userId || 1,
                email: response.adminInfo?.email || response.email || email,
                name: response.adminInfo?.username || response.name || response.username || 'Admin User',
                role: response.adminInfo?.role || response.role || 'admin',
                avatar: response.avatar || null,
                loginTime: new Date().toISOString(),
                token: response.token
            };
            console.log('📝 AuthContext: Setting user data:', userData);
            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (error) {
            console.error('❌ AuthContext: Login failed:', error);

            // If using default admin credentials fails, try to use stored users
            if (email === 'admin@mylittlepet.com' && password !== 'Admin123!') {
                return await tryLocalUsers(email, password);
            }

            throw error;
        }
    }; const tryLocalUsers = async (email, password) => {
        try {
            console.log('🔄 Attempting to use locally stored users');

            // Get stored admin users from localStorage
            const storedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');

            // Check if user exists in stored admins
            const adminUser = storedAdmins.find(admin =>
                admin.email === email && admin.password === password
            );

            if (adminUser) {
                const userData = {
                    id: adminUser.id || 999,
                    email: adminUser.email,
                    name: adminUser.name || 'Local Admin',
                    role: 'admin',
                    avatar: adminUser.avatar || null,
                    loginTime: new Date().toISOString()
                };

                setUser(userData);
                localStorage.setItem('adminUser', JSON.stringify(userData));
                console.log('✅ Fallback login successful (stored admin):', userData);
                return { success: true, user: userData };
            }

            // Check default admin
            if (email === 'admin@mylittlepet.com' && password === 'admin123') {
                const userData = {
                    id: 'default-admin',
                    email: 'admin@mylittlepet.com',
                    name: 'Default Admin',
                    role: 'admin',
                    avatar: null,
                    loginTime: new Date().toISOString()
                };

                setUser(userData);
                localStorage.setItem('adminUser', JSON.stringify(userData));
                console.log('✅ Fallback login successful (default admin):', userData);
                return { success: true, user: userData };
            }

            console.log('❌ Fallback login failed: Invalid credentials');
            return { success: false, error: 'Thông tin đăng nhập không chính xác' };
        } catch (error) {
            console.error('❌ Fallback login error:', error);
            return { success: false, error: 'Lỗi đăng nhập. Vui lòng thử lại.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiService.register(userData);

            const newUser = {
                id: response.userId,
                email: response.email || userData.email,
                name: response.name || userData.name,
                role: response.role || 'user',
                avatar: response.avatar || null,
                loginTime: new Date().toISOString(),
                token: response.token
            };

            setUser(newUser);
            localStorage.setItem('adminUser', JSON.stringify(newUser));

            return { success: true, user: newUser };

        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message || 'Đăng ký thất bại' };
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await apiService.changePassword(oldPassword, newPassword);
            return { success: true, message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            console.error('Change password failed:', error);
            return { success: false, error: error.message || 'Đổi mật khẩu thất bại' };
        }
    }; const logout = () => {
        console.log('🚪 Logging out user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
        setUser(null);
    };    // Debug function to clear all auth data
    const clearAuthData = () => {
        console.log('🧹 Clearing all auth data');
        localStorage.clear(); // Clear everything
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        changePassword,
        clearAuthData,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;