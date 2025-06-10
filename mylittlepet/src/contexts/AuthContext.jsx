import React, { createContext, useContext, useState, useEffect } from 'react';

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
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('adminUser');
            }
        }
        setLoading(false);
    }, []); const login = async (email, password) => {
        try {
            // Get stored admin users from localStorage
            const storedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');

            // Check if user exists in stored admins
            const adminUser = storedAdmins.find(admin =>
                admin.email === email && admin.password === password
            );

            // Also check default admin
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
                return { success: true };
            } else if (adminUser) {
                const userData = {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: 'admin',
                    avatar: null,
                    loginTime: new Date().toISOString()
                };

                setUser(userData);
                localStorage.setItem('adminUser', JSON.stringify(userData));
                return { success: true };
            } else {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }
    };

    const register = async (email, password, fullName) => {
        try {
            // Get existing admin users
            const storedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');

            // Check if email already exists
            const emailExists = storedAdmins.some(admin => admin.email === email) ||
                email === 'admin@mylittlepet.com';

            if (emailExists) {
                return {
                    success: false,
                    error: 'Email already exists'
                };
            }

            // Validate password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                return {
                    success: false,
                    error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
                };
            }

            // Create new admin user
            const newAdmin = {
                id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                email: email,
                password: password,
                name: fullName,
                role: 'admin',
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            const updatedAdmins = [...storedAdmins, newAdmin];
            localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed. Please try again.'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adminUser');
    }; const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};