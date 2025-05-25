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
    }, []);

    const login = async (email, password) => {
        try {
            // Simulate API call - replace with actual API endpoint
            if (email === 'admin@mylittlepet.com' && password === 'admin123') {
                const userData = {
                    id: 1,
                    email: 'admin@mylittlepet.com',
                    name: 'Admin',
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
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adminUser');
    };

    const value = {
        user,
        login,
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