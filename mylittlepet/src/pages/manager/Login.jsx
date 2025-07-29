import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextV2';

/**
 * Reusable notification toast component
 * Shows success/error messages with auto-dismiss and progress bar
 */
const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show toast with fade-in animation
        setIsVisible(true);

        // Calculate progress bar decrement
        const updateInterval = 50;
        const decrementAmount = 100 / (duration / updateInterval);

        // Update progress bar every 50ms
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, updateInterval);

        // Auto-dismiss toast after duration
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    // Dynamic styling based on notification type
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
    const progressColor = type === 'success' ? 'bg-green-200' : 'bg-red-200';

    return (
        <div className={`fixed top-4 right-4 z-9999 max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`${bgColor} rounded-lg shadow-2xl border border-white/30 overflow-hidden backdrop-blur-sm`}>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {type === 'success' ? (
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">✓</span>
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">!</span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium text-white`}>
                                    {type === 'success' ? 'Success' : 'Error'}
                                </h3>
                                <p className={`text-sm ${textColor} mt-1`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="ml-4 text-white/80 hover:text-white transition-colors"
                            aria-label="Close notification"
                        >
                            <span className="h-4 w-4">×</span>
                        </button>
                    </div>
                </div>
                {/* Animated progress bar showing remaining time */}
                <div className="h-1 bg-white/20">
                    <div
                        className={`h-full ${progressColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Login component for admin authentication
 * Features: Form validation, error handling, role-based access control
 */
export default function Login() {
    // Form state management
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Field-specific error states for better UX
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });

    // Notification state for toast messages
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        show: false
    });

    const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect authenticated users to their intended destination
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    // Utility functions
    /**
     * Validates email format using regex
     */
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Clears specific field error and general error
     */
    const clearFieldError = (fieldName) => {
        // Clear specific field error and reset general error
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
        setError('');
    };

    // Event handlers
    /**
     * Handles email input with real-time validation
     */
    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        clearFieldError('email');

        // Real-time validation feedback
        if (emailValue && !validateEmail(emailValue)) {
            setFieldErrors(prev => ({
                ...prev,
                email: 'Invalid email. Please enter a valid email format.'
            }));
        }
    };

    /**
     * Handles password input with real-time validation
     */
    const handlePasswordChange = (e) => {
        const passwordValue = e.target.value;
        setPassword(passwordValue);
        clearFieldError('password');

        // Real-time validation feedback
        if (passwordValue && passwordValue.length < 6) {
            setFieldErrors(prev => ({
                ...prev,
                password: 'Password must be at least 6 characters.'
            }));
        }
    };

    /**
     * Converts backend error messages to user-friendly messages
     * Handles role-based access, validation errors, and network issues
     */
    const getErrorMessage = (errorMsg) => {
        if (!errorMsg) return '';

        const lowerError = errorMsg.toLowerCase();
        console.log('🔍 Debug: Analyzing error message:', errorMsg);

        // Role-based access control errors (highest priority)
        if (lowerError.includes('player') || lowerError.includes('user role') || lowerError.includes('not admin')) {
            return '🚫 This is a Player account, not authorized to access admin panel. Only Admin accounts can login to the management system.';
        }

        if (lowerError.includes('unauthorized') || lowerError.includes('access denied') || lowerError.includes('role') || lowerError.includes('permission') || lowerError.includes('forbidden')) {
            return '🚫 Your account does not have permission to access the admin panel. Only Admins can login.';
        }

        // Authentication errors
        if (lowerError.includes('invalid email') || lowerError.includes('email not found') || lowerError.includes('user not found')) {
            return '📧 Email not found in the system. Please check your email address.';
        }

        if (lowerError.includes('wrong password') || lowerError.includes('invalid password') || lowerError.includes('incorrect password') || lowerError.includes('password')) {
            return '🔐 Incorrect password. Please check your password.';
        }

        // Network errors
        if (lowerError.includes('network') || lowerError.includes('connection')) {
            return '🌐 Network connection error. Please check your internet connection and try again.';
        }

        // Default fallback for unhandled errors
        return `❌ ${errorMsg}`;
    };

    /**
     * Shows notification toast with auto-dismiss
     */
    const showNotification = (message, type = 'error', duration = 3000) => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    };

    /**
     * Manually clears notification
     */
    const clearNotification = () => setNotification({
        message: '',
        type: '',
        show: false
    });

    /**
     * Handles form submission with validation and authentication
     */
    const handleSubmit = async (e) => {
        //Prevents the default browser behavior (page reload) when the form is submitted.
        e.preventDefault();
        setIsLoading(true);
        //Clears any previous general error and field-specific errors before validating the new input.
        setError('');
        setFieldErrors({ email: '', password: '' });

        // Client-side validation before API call
        const errors = {};
        let isValid = true;

        if (!email.trim()) {
            errors.email = 'Email is required. Please enter your email.';
            isValid = false;
        } else if (!validateEmail(email)) {
            errors.email = 'Invalid email format. Please enter a valid email (e.g., user@example.com).';
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = 'Password is required. Please enter your password.';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        // Stop if validation fails
        if (!isValid) {
            setFieldErrors(errors);
            setIsLoading(false);
            showNotification('Please check and fix the errors in the form.', 'error');
            return;
        }

        try {
            console.log('🔍 Debug: Attempting to login with:', { email, password: '***' });

            const result = await login(email, password);
            console.log('🔑 Login: Login result received', result);

            if (result.success) {
                console.log('✅ Login: Login successful, preparing navigation');

                // Show success notification
                showNotification('🎉 Login successful! Redirecting...', 'success', 2000);

                // Store success notification for next page
                sessionStorage.setItem('loginSuccessNotification', JSON.stringify({
                    message: 'Welcome to My Little Pet Management Panel!',
                    type: 'success',
                    timestamp: Date.now()
                }));

                // Navigate after showing success message
                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/players';
                    console.log('🧭 Login: Navigating to:', from);
                    navigate(from, { replace: true });
                    console.log('🧭 Login: Navigation called');
                }, 1800); // 1.8 second delay to show the success notification

            } else {
                // Handle login failure
                console.log('❌ Login: Login failed with error:', result.error);
                // Process error message from back-end 
                const errorMessage = getErrorMessage(result.error || 'Login failed');
                console.log('📝 Login: Processed error message:', errorMessage);
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            // Handle unexpected errors
            console.log('💥 Login: Exception caught:', error);
            console.log('💥 Login: Error message:', error.message);
            // Process error message from back-end 
            const errorMessage = getErrorMessage(error.message || 'An error occurred during login. Please try again.');
            console.log('📝 Login: Processed exception message:', errorMessage);
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Notification Toast - positioned at top-right */}
            {/* Check if show is true => show message and custom by type */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}

            <div className="max-w-md w-full space-y-8">
                {/* Header Section */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🐾 My Little Pet
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your admin account
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your email"
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter your password"
                                    />
                                    {/* Password visibility toggle */}
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        // if clicked showPassword is set to the opposite value
                                        onClick={() => setShowPassword(!showPassword)}
                                        //default is set to hide password
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ?
                                            ( // if showPassword is true, show EyeOff icon 
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : ( // if showPassword is false, show Eye icon
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                //condidionally disable the button if loading, errors exist, or fields are empty
                                disabled={
                                    isLoading ||
                                    Object.values(fieldErrors).some(error => error !== '') ||
                                    !email.trim() ||
                                    !password.trim()
                                }
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Sign In
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Register Link */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}