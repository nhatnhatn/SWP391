/**
 * REGISTER COMPONENT
 * 
 * User registration page for My Little Pet application
 * Features: Form validation, real-time error checking, password strength requirements,
 * notification system, and automatic redirect after successful registration
 */

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextV2';

// ============================================================================
// NOTIFICATION TOAST COMPONENT
// ============================================================================

/**
 * Reusable notification toast component with auto-dismiss functionality
 * Features: Progress bar animation, different notification types, smooth transitions
 */
/**
 * Reusable notification toast component with auto-dismiss functionality
 * Features: Progress bar animation, different notification types, smooth transitions
 */
const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    // Progress bar state (100% to 0% over duration)
    const [progress, setProgress] = useState(100);
    // Visibility state for smooth enter/exit animations
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Start visible animation
        setIsVisible(true);

        // Progress bar animation setup
        const updateInterval = 50; // Update every 50ms for smooth animation
        const decrementAmount = 100 / (duration / updateInterval);

        // Animate progress bar countdown
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, updateInterval);

        // Auto-dismiss timer with exit animation
        const timer = setTimeout(() => {
            setIsVisible(false); // Start exit animation
            setTimeout(onClose, 300); // Close after animation completes
        }, duration);

        // Cleanup timers on unmount
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
        // Fixed positioning with responsive design and smooth transitions
        <div className={`fixed top-4 right-4 z-9999 max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`${bgColor} rounded-lg shadow-2xl border border-white/30 overflow-hidden backdrop-blur-sm`}>
                {/* Main notification content */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {/* Status icon */}
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
                            {/* Message content */}
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium text-white`}>
                                    {type === 'success' ? 'Success' : 'Error'}
                                </h3>
                                <p className={`text-sm ${textColor} mt-1`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                        {/* Manual close button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="ml-4 text-white/80 hover:text-white transition-colors"
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

// ============================================================================
// MAIN REGISTER COMPONENT
// ============================================================================

/**
 * Registration form component with comprehensive validation and user feedback
 * Features: Real-time validation, password strength checking, field-specific error messages,
 * automatic authentication state management, and post-registration redirect
 */
export default function Register() {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    // Form input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // UI state for password visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form submission and feedback states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Notification system state
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        show: false
    });

    /**
     * Individual field error tracking for granular validation feedback
     * Each field can show specific error messages independently
     */
    const [fieldErrors, setFieldErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // ============================================================================
    // HOOKS AND AUTHENTICATION
    // ============================================================================

    // Authentication context and navigation hooks
    const { register, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    /**
     * Redirect logic for already authenticated users
     * Prevents showing registration form to logged-in users
     */
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    // ============================================================================
    // VALIDATION FUNCTIONS
    // ============================================================================

    /**
     * Email validation using standard email regex pattern
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if email format is valid
     */
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Password strength validation
     * Requirements: 8+ characters, uppercase, lowercase, and numbers
     * @param {string} password - Password to validate
     * @returns {boolean} - True if password meets requirements
     */
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    };

    /**
     * Full name validation
     * Requirements: Non-empty, trimmed, and under 50 characters
     * @param {string} name - Full name to validate
     * @returns {boolean} - True if name is valid
     */
    const validateFullName = (name) => {
        return name && name.trim().length > 0 && name.length <= 50;
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Clears specific field error and general error state
     * @param {string} fieldName - Name of the field to clear error for
     */
    const clearFieldError = (fieldName) => {
        // Clear specific field error and reset general error
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
        setError('');
    };

    /**
     * Shows notification toast with auto-dismiss
     * @param {string} message - Message to display
     * @param {string} type - Type of notification ('success' or 'error')
     * @param {number} duration - Display duration in milliseconds
     */
    const showNotification = (message, type = 'error', duration = 3000) => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    };

    /**
     * Clears notification state immediately
     */
    const clearNotification = () => {
        setNotification({ message: '', type: '', show: false });
    };

    // ============================================================================
    // INPUT CHANGE HANDLERS WITH REAL-TIME VALIDATION
    // ============================================================================

    /**
     * Handles full name input changes with real-time validation
     * Validates length and emptiness as user types
     */
    const handleFullNameChange = (e) => {
        const value = e.target.value;
        setFullName(value);
        clearFieldError('fullName');

        // Real-time validation feedback
        if (value.trim().length === 0) {
            setFieldErrors(prev => ({ ...prev, fullName: 'Full name is required.' }));
        } else if (value.length > 50) {
            setFieldErrors(prev => ({ ...prev, fullName: 'Full name cannot exceed 50 characters.' }));
        } 
    };

    /**
     * Handles email input changes with real-time validation
     * Validates email format as user types
     */
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        clearFieldError('email');

        // Real-time email format validation
        if (value && !validateEmail(value)) {
            setFieldErrors(prev => ({ ...prev, email: 'Invalid email. Please enter a valid email format (e.g., user@example.com).' }));
        }
    };

    /**
     * Handles password input changes with real-time validation
     * Also triggers confirm password validation if it's already filled
     */
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        clearFieldError('password');

        // Real-time password strength validation
        if (value && !validatePassword(value)) {
            setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.' }));
        }

        // Cross-validate with confirm password field if it's already filled
        if (confirmPassword && value !== confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Password confirmation does not match.' }));
        } else if (confirmPassword && value === confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    /**
     * Handles confirm password input changes with real-time validation
     * Compares with main password field for consistency
     */
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        clearFieldError('confirmPassword');

        // Real-time password match validation
        if (value && password && value !== password) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Password confirmation does not match.' }));
        }
    };

    // ============================================================================
    // ERROR MESSAGE PROCESSING
    // ============================================================================

    /**
     * Processes backend error messages and returns user-friendly messages
     * Handles various error types with specific, actionable feedback
     * @param {string} errorMsg - Raw error message from backend
     * @returns {string} - User-friendly error message with emoji
     */
    const getErrorMessage = (errorMsg) => {
        if (!errorMsg) return '';

        const lowerError = errorMsg.toLowerCase();

        // Handle specific error types with user-friendly messages
        if (lowerError.includes('email already exists')) {
            return '❌ This email is already in use. Please use a different email or login if this is your account.';
        }

        if (lowerError.includes('username already exists')) {
            return '❌ This username is already taken. Please choose a different name.';
        }

        if (lowerError.includes('password must be') || lowerError.includes('weak password')) {
            return '❌ Password is not strong enough. Must be at least 8 characters with uppercase, lowercase, and numbers.';
        }

        if (lowerError.includes('invalid email')) {
            return '❌ Invalid email format. Please check again.';
        }

        if (lowerError.includes('network') || lowerError.includes('connection')) {
            return '❌ Network connection error. Please check your internet connection and try again.';
        }

        if (lowerError.includes('server error')) {
            return '❌ Server error. Please try again in a few minutes.';
        }

        // Default fallback for unhandled error types
        return `❌ ${errorMsg}`;
    };

    // ============================================================================
    // FORM VALIDATION
    // ============================================================================

    /**
     * Comprehensive form validation before submission
     * Validates all fields and sets appropriate error messages
     * @returns {boolean} - True if all validation passes
     */
    const validateForm = () => {
        let isValid = true;
        const errors = {};

        // Full name validation
        if (!fullName || fullName.trim().length === 0) {
            errors.fullName = 'Full name is required.';
            isValid = false;
        } else if (fullName.length > 50) {
            errors.fullName = 'Full name cannot exceed 50 characters.';
            isValid = false;
        }

        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required.';
            isValid = false;
        } else if (!validateEmail(email)) {
            errors.email = 'Invalid email. Please enter a valid email format.';
            isValid = false;
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required.';
            isValid = false;
        } else if (!validatePassword(password)) {
            errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.';
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            errors.confirmPassword = 'Password confirmation is required.';
            isValid = false;
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Password confirmation does not match.';
            isValid = false;
        }

        // Apply all field errors at once for better UX
        setFieldErrors(errors);

        // Set general error message if validation fails
        if (!isValid) {
            setError('Please check and fix the errors in the form.');
            showNotification('Please check and fix the errors in the form.', 'error');
        }

        return isValid;
    };

    // ============================================================================
    // FORM SUBMISSION HANDLER
    // ============================================================================

    /**
     * Handles form submission with comprehensive validation and error handling
     * Manages loading state, authentication cleanup, and post-registration redirect
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Early return if validation fails
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        // Prepare user data for registration API
        const userData = {
            username: fullName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            // Call registration API through auth context
            const result = await register(userData);

            if (result.success) {
                // Success handling
                setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
                showNotification('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.', 'success');

                // Clear form data for security
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
                setFieldErrors({
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });

                // Clear authentication data to ensure fresh login state
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminUser');
                // Use logout function to clear all auth state
                logout();

                // Navigate to login page after displaying success message
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } else {
                // Handle registration failure
                const errorMessage = getErrorMessage(result.error || 'Đăng ký thất bại');
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            // Handle unexpected errors during registration
            console.error('Registration error:', error);
            const errorMessage = getErrorMessage(error.message || 'An error occurred during registration. Please try again.');
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            // Always reset loading state
            setIsLoading(false);
        }
    };

    // ============================================================================
    // COMPONENT RENDER
    // ============================================================================

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Notification Toast Component */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}

            {/* Main Registration Form Container */}
            <div className="max-w-md w-full space-y-8">
                {/* Header Section */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🐾 My Little Pet
                    </h2>
                    <p className="mt-2 text-center text-4xl text-gray-600">
                        Create Account
                    </p>
                </div>

                {/* Registration Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">

                            {/* Full Name Input Field */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your full name"
                                />
                                {/* Field-specific error message */}
                                {fieldErrors.fullName && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Email Input Field */}
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
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your email address"
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? 'Hide Password' : 'Show Password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password ? (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.password}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Re-enter your password to confirm"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    success ||
                                    Object.values(fieldErrors).some(error => error !== '') ||
                                    !fullName.trim() ||
                                    !email.trim() ||
                                    !password ||
                                    !confirmPassword
                                }
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing up...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create Account
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-emerald-600 hover:text-emerald-500"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        {success && (
                            <div className="mt-4 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Go to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
