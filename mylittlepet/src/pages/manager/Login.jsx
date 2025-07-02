import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextV2';
import { t } from '../../constants/vietnamese';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');

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

    // Handle email input change with validation
    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        setEmailError('');
        setError('');

        if (emailValue && !validateEmail(emailValue)) {
            setEmailError('Email không hợp lệ. Vui lòng nhập đúng định dạng email.');
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
            return ' Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
        }

        if (lowerError.includes('network') || lowerError.includes('connection')) {
            return ' Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
        }

        // Default fallback for other errors
        return ` ${errorMsg}`;
    }; const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setEmailError('');

        // Client-side validation
        if (!email.trim()) {
            setEmailError('Email là bắt buộc. Vui lòng nhập email của bạn.');
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: user@example.com).');
            setIsLoading(false);
            return;
        }

        if (!password.trim()) {
            setError('Mật khẩu là bắt buộc. Vui lòng nhập mật khẩu của bạn.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            setIsLoading(false);
            return;
        }

        try {
            console.log('🔍 Debug: Attempting to login with:', { email, password: '***' });

            const result = await login(email, password);
            console.log('🔑 Login: Login result received', result);

            if (result.success) {
                console.log('✅ Login: Login successful, preparing navigation');
                // Navigate to the players page (main admin dashboard)
                const from = location.state?.from?.pathname || '/players';
                console.log('🧭 Login: Navigating to:', from);
                navigate(from, { replace: true });
                console.log('🧭 Login: Navigation called');
            } else {
                console.error('❌ Login failed:', result.error);
                const errorMessage = getErrorMessage(result.error || 'Đăng nhập thất bại');
                setError(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = getErrorMessage(error.message || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🐾 My Little Pet
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your admin account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-300 rounded-md p-3">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}                            <div>
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
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder={t('auth.enterEmail')}
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {emailError}
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
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(''); // Clear error when user starts typing
                                        }}
                                        className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${error && error.includes('Mật khẩu') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
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
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading || emailError || !email.trim() || !password.trim()}
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