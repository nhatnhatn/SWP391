import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextV2';
import { t } from '../../constants/vietnamese';

// Notification Toast Component (copied from ShopProductManagement)
const NotificationToast = ({ message, type, onClose, duration = 3000 }) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const updateInterval = 50;
        const decrementAmount = 100 / (duration / updateInterval);
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrementAmount;
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, updateInterval);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

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
                                    {type === 'success' ? 'Thành công' : 'Lỗi'}
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
                        >
                            <span className="h-4 w-4">×</span>
                        </button>
                    </div>
                </div>
                {/* Progress Bar */}
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

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Individual field error states for better UX (like Register)
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });
    
    // Notification state
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Clear field error helper
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
        setError('');
    };

    // Handle email input change with validation
    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        clearFieldError('email');

        if (emailValue && !validateEmail(emailValue)) {
            setFieldErrors(prev => ({ ...prev, email: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.' }));
        }
    };

    // Handle password input change with validation
    const handlePasswordChange = (e) => {
        const passwordValue = e.target.value;
        setPassword(passwordValue);
        clearFieldError('password');

        if (passwordValue && passwordValue.length < 6) {
            setFieldErrors(prev => ({ ...prev, password: 'Mật khẩu phải có ít nhất 6 ký tự.' }));
        }
    };

    // Get specific error message based on error type
    const getErrorMessage = (errorMsg) => {
        if (!errorMsg) return '';

        const lowerError = errorMsg.toLowerCase();

        if (lowerError.includes('invalid email') || lowerError.includes('email not found') || lowerError.includes('user not found')) {
            return ' Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email của bạn.';
        }

        if (lowerError.includes('wrong password') || lowerError.includes('invalid password') || lowerError.includes('incorrect password')) {
            return ' Mật khẩu không chính xác. Vui lòng kiểm tra lại mật khẩu của bạn.';
        }

        if (lowerError.includes('unauthorized') || lowerError.includes('access denied') || lowerError.includes('role') || lowerError.includes('permission')) {
            return ' Tài khoản của bạn không có quyền truy cập vào trang quản trị. Chỉ Admin mới có thể đăng nhập.';
        }

        if (lowerError.includes('account disabled') || lowerError.includes('account suspended') || lowerError.includes('banned')) {
            return ' Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên cấp cao.';
        }

        if (lowerError.includes('network') || lowerError.includes('connection')) {
            return ' Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
        }

        // Default fallback for other errors
        return ` ${errorMsg}`;
    };

    const showNotification = (message, type = 'error', duration = 3000) => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    };

    const clearNotification = () => setNotification({ message: '', type: '', show: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setFieldErrors({ email: '', password: '' });

        // Client-side validation
        const errors = {};
        let isValid = true;

        if (!email.trim()) {
            errors.email = 'Email là bắt buộc. Vui lòng nhập email của bạn.';
            isValid = false;
        } else if (!validateEmail(email)) {
            errors.email = 'Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: user@example.com).';
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = 'Mật khẩu là bắt buộc. Vui lòng nhập mật khẩu của bạn.';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            isValid = false;
        }

        if (!isValid) {
            setFieldErrors(errors);
            setIsLoading(false);
            showNotification('Vui lòng kiểm tra và sửa các lỗi trong form.', 'error');
            return;
        }

        try {
            console.log('🔍 Debug: Attempting to login with:', { email, password: '***' });

            const result = await login(email, password);
            console.log('🔑 Login: Login result received', result);

            if (result.success) {
                console.log('✅ Login: Login successful, preparing navigation');

                // Show success notification
                showNotification('🎉 Đăng nhập thành công! Đang chuyển hướng...', 'success', 2000);

                // Store success notification for next page
                sessionStorage.setItem('loginSuccessNotification', JSON.stringify({
                    message: 'Chào mừng bạn đến với trang quản lí My Little Pet!',
                    type: 'success',
                    timestamp: Date.now()
                }));

                // Wait for notification to be visible before navigating
                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/players';
                    console.log('🧭 Login: Navigating to:', from);
                    navigate(from, { replace: true });
                    console.log('🧭 Login: Navigation called');
                }, 1800); // 1.8 second delay to show the success notification

            } else {
                const errorMessage = getErrorMessage(result.error || 'Đăng nhập thất bại');
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error.message || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Notification Toast */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🐾 My Little Pet
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đăng nhập vào tài khoản quản trị viên
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    {t('auth.emailAddress')}
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
                                    placeholder={t('auth.enterEmail')}
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
                                    {t('auth.password')}
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
                                        placeholder={t('auth.enterPassword')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
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

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={
                                    isLoading || 
                                    Object.values(fieldErrors).some(error => error !== '') ||
                                    !email.trim() || 
                                    !password.trim()
                                }
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                            >                                {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {t('auth.signingIn')}
                                </div>
                            ) : (<div className="flex items-center">
                                <LogIn className="h-4 w-4 mr-2" />
                                {t('auth.signIn')}
                            </div>
                            )}
                            </button>
                        </div>                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                {t('auth.dontHaveAccount')}{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {t('auth.goToRegister')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}