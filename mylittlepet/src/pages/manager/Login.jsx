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
    const [error, setError] = useState(''); const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    } const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('🔑 Login: Starting login submission', { email });

        const result = await login(email, password);

        console.log('🔑 Login: Login result received', result);

        if (result.success) {
            console.log('✅ Login: Login successful, preparing navigation');
            // Navigate to the debug page first to test routing
            const from = location.state?.from?.pathname || '/debug';
            console.log('🧭 Login: Navigating to:', from);
            navigate(from, { replace: true });
            console.log('🧭 Login: Navigation called');
        } else {
            console.log('❌ Login: Login failed', result.error);
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
                        <Heart className="h-8 w-8 text-indigo-600" />
                    </div>                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t('auth.enterEmail')}
                                />
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
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

                        <div className="mt-4 text-center">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-blue-700 text-xs font-medium">{t('auth.demoCredentials')}:</p>
                                <p className="text-blue-600 text-xs">Email: admin@mylittlepet.com</p>
                                <p className="text-blue-600 text-xs">{t('auth.password')}: admin123</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}