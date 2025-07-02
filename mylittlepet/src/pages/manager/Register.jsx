import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextV2';
import { t } from '../../constants/vietnamese';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Individual field error states for better UX
    const [fieldErrors, setFieldErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    }); const { register, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    };

    const validateFullName = (name) => {
        return name && name.trim().length > 0 && name.length <= 50;
    };

    // Clear field error helper
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
        setError('');
    };

    // Input change handlers with real-time validation
    const handleFullNameChange = (e) => {
        const value = e.target.value;
        setFullName(value);
        clearFieldError('fullName');

        if (value && !validateFullName(value)) {
            if (value.trim().length === 0) {
                setFieldErrors(prev => ({ ...prev, fullName: 'Họ và tên không được để trống.' }));
            } else if (value.length > 50) {
                setFieldErrors(prev => ({ ...prev, fullName: 'Họ và tên không được vượt quá 50 ký tự.' }));
            }
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        clearFieldError('email');

        if (value && !validateEmail(value)) {
            setFieldErrors(prev => ({ ...prev, email: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: user@example.com).' }));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        clearFieldError('password');

        if (value && !validatePassword(value)) {
            setFieldErrors(prev => ({ ...prev, password: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.' }));
        }

        // Also validate confirm password if it's already filled
        if (confirmPassword && value !== confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp.' }));
        } else if (confirmPassword && value === confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        clearFieldError('confirmPassword');

        if (value && password && value !== password) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp.' }));
        }
    };

    // Get specific error message based on error type
    const getErrorMessage = (errorMsg) => {
        if (!errorMsg) return '';

        const lowerError = errorMsg.toLowerCase();

        if (lowerError.includes('email already exists') || lowerError.includes('email đã tồn tại')) {
            return '❌ Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn.';
        }

        if (lowerError.includes('username already exists') || lowerError.includes('tên người dùng đã tồn tại')) {
            return '❌ Tên người dùng này đã được sử dụng. Vui lòng chọn tên khác.';
        }

        if (lowerError.includes('password must be') || lowerError.includes('weak password') || lowerError.includes('mật khẩu yếu')) {
            return '❌ Mật khẩu không đủ mạnh. Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
        }

        if (lowerError.includes('invalid email') || lowerError.includes('email không hợp lệ')) {
            return '❌ Định dạng email không hợp lệ. Vui lòng kiểm tra lại.';
        }

        if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('kết nối')) {
            return '❌ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
        }

        if (lowerError.includes('server error') || lowerError.includes('lỗi máy chủ')) {
            return '❌ Lỗi máy chủ. Vui lòng thử lại sau ít phút.';
        }

        // Default fallback for other errors
        return `❌ ${errorMsg}`;
    }; const validateForm = () => {
        let isValid = true;
        const errors = {};

        // Validate full name
        if (!fullName || fullName.trim().length === 0) {
            errors.fullName = 'Họ và tên là bắt buộc.';
            isValid = false;
        } else if (fullName.length > 50) {
            errors.fullName = 'Họ và tên không được vượt quá 50 ký tự.';
            isValid = false;
        }

        // Validate email
        if (!email.trim()) {
            errors.email = 'Email là bắt buộc.';
            isValid = false;
        } else if (!validateEmail(email)) {
            errors.email = 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.';
            isValid = false;
        }

        // Validate password
        if (!password) {
            errors.password = 'Mật khẩu là bắt buộc.';
            isValid = false;
        } else if (!validatePassword(password)) {
            errors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc.';
            isValid = false;
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
            isValid = false;
        }

        // Set all field errors at once
        setFieldErrors(errors);

        // Set general error if form is invalid
        if (!isValid) {
            setError('Vui lòng kiểm tra và sửa các lỗi trong form.');
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        const userData = {
            username: fullName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            const result = await register(userData);

            if (result.success) {
                setSuccess('🎉 Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
                // Clear form
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

                // Clear localStorage and logout to ensure fresh login
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminUser');
                // Use logout function to clear all auth state
                logout();

                // Navigate to login page after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } else {
                const errorMessage = getErrorMessage(result.error || 'Đăng ký thất bại');
                setError(errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = getErrorMessage(error.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🐾 My Little Pet
                    </h2>
                    <p className="mt-2 text-center text-4xl text-gray-600">
                        {t('auth.createAccount')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-300 rounded-md p-3">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-300 rounded-md p-3">
                                    <p className="text-green-700 text-sm">{success}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    {t('auth.fullName')}
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
                                    placeholder="Nhập họ và tên của bạn"
                                />
                                {fieldErrors.fullName && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {fieldErrors.fullName}
                                    </p>
                                )}
                            </div>

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
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Nhập địa chỉ email của bạn"
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
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Nhập mật khẩu của bạn"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                                        Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    {t('auth.confirmPassword')}
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
                                        placeholder="Nhập lại mật khẩu của bạn để xác nhận"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                                        {t('auth.signingUp')}
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        {t('auth.signUpForAccount')}
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                {t('auth.alreadyHaveAccount')}{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-emerald-600 hover:text-emerald-500"
                                >
                                    {t('auth.goToLogin')}
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
                                    {t('auth.goToLogin')}
                                </Link>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
