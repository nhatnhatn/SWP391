import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    Users,
    PawPrint,
    Package,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextV2';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import { t } from '../constants/vietnamese';

const navigation = [
    { name: t('nav.players'), href: '/players', icon: Users },
    { name: t('nav.pets'), href: '/pets', icon: PawPrint },
    { name: t('nav.shops'), href: '/shop-products', icon: Package },
];

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Dynamic color themes based on current page
    const getThemeColors = () => {
        const path = location.pathname;
        
        if (path === '/players') {
            // Green theme for PlayersSimple
            return {
                active: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-r-2 border-green-500',
                hover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700',
                normal: 'text-gray-600'
            };
        } else if (path === '/shop-products') {
            // Purple theme for ShopProductManagement
            return {
                active: 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-r-2 border-purple-500',
                hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700',
                normal: 'text-gray-600'
            };
        } else if (path === '/pets') {
            // Cyan theme for PetManagement
            return {
                active: 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-r-2 border-cyan-500',
                hover: 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700',
                normal: 'text-gray-600'
            };
        } else {
            // Default blue theme
            return {
                active: 'bg-blue-50 text-blue-700 border-r-2 border-blue-500',
                hover: 'hover:bg-gray-50 hover:text-gray-900',
                normal: 'text-gray-600'
            };
        }
    };

    const themeColors = getThemeColors();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutDialog(false);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">            {/* Mobile menu */}
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
                    </div>                    <div className="flex-1 h-0 pt-3 pb-3 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-3 mb-3">
                            <h1 className="text-base font-bold text-gray-900">My Little Pet</h1>
                        </div>                        <nav className="mt-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${isActive
                                            ? themeColors.active
                                            : `${themeColors.normal} ${themeColors.hover}`
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        {/* Mobile user section */}
                        <div className="mt-auto border-t border-gray-200 p-2">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-indigo-600">
                                            {user?.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-2 flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate">{user?.name || t('nav.admin')}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@mylittlepet.com'}</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="ml-1 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                    title={t('auth.signOut')}
                                >
                                    <LogOut className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className={`flex flex-col transition-all duration-300 ${sidebarExpanded ? 'w-48' : 'w-16'}`}>
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
                        {/* Toggle button */}
                        <div className="flex justify-end p-2 border-b border-gray-200">
                            <button
                                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title={sidebarExpanded ? 'Thu gọn' : 'Mở rộng'}
                            >
                                {sidebarExpanded ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col pt-3 pb-3 overflow-y-auto">
                            {sidebarExpanded && (
                                <div className="flex items-center flex-shrink-0 px-3 mb-3">
                                    <h1 className="text-base font-bold text-gray-900">My Little Pet</h1>
                                </div>
                            )}                            <nav className={`mt-1 flex-1 bg-white space-y-1 ${sidebarExpanded ? 'px-2' : 'px-1'}`}>
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center rounded-md transition-all duration-200 ${sidebarExpanded ? 'px-2 py-2' : 'px-2 py-2 justify-center'
                                                } ${isActive
                                                    ? themeColors.active
                                                    : `${themeColors.normal} ${themeColors.hover}`
                                                }`}
                                            title={!sidebarExpanded ? item.name : undefined}
                                        >
                                            <Icon className={`h-4 w-4 flex-shrink-0 ${sidebarExpanded ? 'mr-2' : ''}`} />
                                            {sidebarExpanded && (
                                                <span className="text-xs font-medium truncate">{item.name}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>                        <div className={`flex-shrink-0 border-t border-gray-200 ${sidebarExpanded ? 'p-2' : 'p-1'}`}>
                            {sidebarExpanded ? (
                                <div className="flex items-center w-full">
                                    <div className="flex-shrink-0">
                                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-xs font-medium text-indigo-600">
                                                {user?.name?.charAt(0) || 'A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-700 truncate">{user?.name || t('nav.admin')}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@mylittlepet.com'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowLogoutDialog(true)}
                                        className="ml-1 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                        title={t('auth.signOut')}
                                    >
                                        <LogOut className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-indigo-600">
                                            {user?.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowLogoutDialog(true)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title={t('auth.signOut')}
                                    >
                                        <LogOut className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
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
