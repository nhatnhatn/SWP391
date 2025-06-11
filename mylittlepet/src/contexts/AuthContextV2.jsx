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

            if (token && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    // Verify token is still valid by making a test API call
                    await apiService.healthCheck();
                    setUser(userData);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    // Clear invalid token and user data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('adminUser');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // Try backend authentication first
            const response = await apiService.login(email, password);

            const userData = {
                id: response.userId,
                email: response.email || email,
                name: response.name || response.username || 'Admin User',
                role: response.role || 'admin',
                avatar: response.avatar || null,
                loginTime: new Date().toISOString(),
                token: response.token
            };

            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));

            return { success: true, user: userData };

        } catch (error) {
            console.error('Backend login failed, trying fallback:', error);

            // Fallback to local authentication for development
            return await fallbackLogin(email, password);
        }
    };

    const fallbackLogin = async (email, password) => {
        try {
            // Get stored admin users from localStorage
            const storedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');

            // Check if user exists in stored admins
            const adminUser = storedAdmins.find(admin =>
                admin.email === email && admin.password === password
            );

            if (adminUser) {
                const userData = {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: 'admin',
                    avatar: adminUser.avatar || null,
                    loginTime: new Date().toISOString()
                };

                setUser(userData);
                localStorage.setItem('adminUser', JSON.stringify(userData));
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
                return { success: true, user: userData };
            }

            return { success: false, error: 'Thông tin đăng nhập không chính xác' };

        } catch (error) {
            console.error('Fallback login error:', error);
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
    };

    const logout = () => {
        apiService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        changePassword,
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
