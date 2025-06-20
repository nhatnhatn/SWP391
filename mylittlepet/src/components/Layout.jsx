import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    Users,
    Heart,
    Package,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextV2';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import { t } from '../constants/vietnamese';

const navigation = [
    { name: t('nav.players'), href: '/players', icon: Users },
    { name: t('nav.pets'), href: '/pets', icon: Heart },
    { name: t('nav.shops'), href: '/shop-products', icon: Package },
];

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutDialog(false);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile menu */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />

                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">                        <div className="flex-shrink-0 flex items-center px-4">
                        <h1 className="text-xl font-bold text-gray-900">🐾 My Little Pet</h1>
                    </div>
                        <nav className="mt-5 px-2 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>);
                            })}
                        </nav>                        {/* Mobile user section */}
                        <div className="mt-auto border-t border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-indigo-600">
                                            {user?.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-700">{user?.name || t('nav.admin')}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'admin@mylittlepet.com'}</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title={t('auth.signOut')}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">                        <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-gray-900">🐾 My Little Pet</h1>
                    </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-indigo-600">
                                            {user?.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-700">{user?.name || t('nav.admin')}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'admin@mylittlepet.com'}</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title={t('auth.signOut')}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top navigation */}
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                    <button
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Main content */}
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>                </main>
            </div>

            {/* Logout confirmation dialog */}
            <LogoutConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
