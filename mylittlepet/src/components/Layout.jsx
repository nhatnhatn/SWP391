/**
 * ============================================================================================
 * MAIN APPLICATION LAYOUT COMPONENT
 * ============================================================================================
 * 
 * This component provides the primary layout structure for the admin dashboard application.
 * It implements a responsive sidebar navigation layout with mobile and desktop variants,
 * dynamic theming, and user authentication controls.
 * 
 * FEATURES:
 * - Responsive sidebar navigation (collapsible on desktop, overlay on mobile)
 * - Dynamic color theming based on current page/route
 * - User authentication integration with logout functionality
 * - Mobile-first responsive design with Tailwind CSS
 * - Smooth animations and transitions for enhanced UX
 * - Navigation highlighting for current active page
 * - User profile display with avatar initials
 * 
 * LAYOUT STRUCTURE:
 * - Mobile: Overlay sidebar with backdrop blur
 * - Desktop: Fixed sidebar with expand/collapse functionality
 * - Main content area with responsive padding and scrolling
 * - Top navigation bar for mobile menu trigger
 * 
 * THEMING SYSTEM:
 * - Green theme for Players management (/players)
 * - Purple theme for Shop Products management (/shop-products)  
 * - Cyan theme for Pet management (/pets)
 * - Default blue theme for other pages
 * 
 * NAVIGATION STRUCTURE:
 * - Players: User management and statistics
 * - Pets: Pet CRUD operations and filtering
 * - Shops: Shop product management and inventory
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile (< md): Overlay sidebar with backdrop
 * - Desktop (>= md): Fixed collapsible sidebar
 * - Smooth transitions between states
 * 
 * STATE MANAGEMENT:
 * - sidebarOpen: Controls mobile sidebar visibility
 * - sidebarExpanded: Controls desktop sidebar expansion
 * - showLogoutDialog: Controls logout confirmation modal
 * 
 * @param {ReactNode} children - The main content to render in the layout
 * @returns {JSX.Element} Complete layout structure with navigation and content area
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    Users,
    PawPrint,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextV2';
import LogoutConfirmDialog from './LogoutConfirmDialog';

/**
 * Navigation Configuration
 * Defines the main navigation items with routes, labels, and icons
 * This centralized configuration makes it easy to add/remove navigation items
 */
const navigation = [
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Pets', href: '/pets', icon: PawPrint },
    { name: 'Shops', href: '/shop-products', icon: Package },
];

export default function Layout({ children }) {
    // ============================================================================================
    // STATE MANAGEMENT
    // ============================================================================================
    
    /**
     * Mobile sidebar visibility state
     * Controls whether the overlay sidebar is shown on mobile devices
     */
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    /**
     * Desktop sidebar expansion state  
     * Controls whether the desktop sidebar is expanded (wide) or collapsed (narrow)
     */
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    
    /**
     * Logout dialog visibility state
     * Controls whether the logout confirmation modal is displayed
     */
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    
    // ============================================================================================
    // HOOKS AND CONTEXT
    // ============================================================================================
    
    const location = useLocation();     // Current route information
    const navigate = useNavigate();     // Programmatic navigation
    const { user, logout } = useAuth(); // Authentication context

    // ============================================================================================
    // DYNAMIC THEMING SYSTEM
    // ============================================================================================
    
    /**
     * Dynamic color theme generator based on current route
     * 
     * Provides different color schemes for each main section of the application
     * to help users visually distinguish between different management areas.
     * 
     * @returns {Object} Theme colors object with active, hover, and normal states
     * 
     * Color Schemes:
     * - Players (/players): Green theme - represents growth and user management
     * - Shop Products (/shop-products): Purple theme - represents commerce and premium features  
     * - Pets (/pets): Cyan theme - represents care and nurturing
     * - Default: Blue theme - standard professional appearance
     */
    const getThemeColors = () => {
        const path = location.pathname;

        if (path === '/players') {
            // Green theme for Players management - represents growth and user engagement
            return {
                active: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-r-2 border-green-500',
                hover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700',
                normal: 'text-gray-600'
            };
        } else if (path === '/shop-products') {
            // Purple theme for Shop Products management - represents commerce and premium features
            return {
                active: 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-r-2 border-purple-500',
                hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700',
                normal: 'text-gray-600'
            };
        } else if (path === '/pets') {
            // Cyan theme for Pet management - represents care, nurturing, and animals
            return {
                active: 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-r-2 border-cyan-500',
                hover: 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700',
                normal: 'text-gray-600'
            };
        } else {
            // Default blue theme for unmatched routes - professional and neutral
            return {
                active: 'bg-blue-50 text-blue-700 border-r-2 border-blue-500',
                hover: 'hover:bg-gray-50 hover:text-gray-900',
                normal: 'text-gray-600'
            };
        }
    };

    /**
     * Get the current theme colors based on active route
     * This ensures consistent theming throughout the navigation
     */
    const themeColors = getThemeColors();

    // ============================================================================================
    // EVENT HANDLERS
    // ============================================================================================
    
    /**
     * Handle user logout process
     * 
     * Performs cleanup and navigation after logout confirmation:
     * 1. Calls logout function from auth context (clears tokens, user data)
     * 2. Navigates to login page
     * 3. Closes the logout confirmation dialog
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutDialog(false);
    };

    // ============================================================================================
    // RENDER LAYOUT STRUCTURE
    // ============================================================================================
    
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            
            {/* ========================================================================================
                MOBILE NAVIGATION OVERLAY
                ========================================================================================
                
                Responsive overlay sidebar for mobile devices (< md breakpoint).
                Features:
                - Full-screen overlay with backdrop blur
                - Slide-in animation from left side
                - Touch-friendly close button
                - Compact navigation with icons and labels
                - User profile section at bottom
                - Auto-close when navigation item is selected
            */}
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
                                    <p className="text-xs font-medium text-gray-700 truncate">{user?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@mylittlepet.com'}</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="ml-1 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================================
                DESKTOP NAVIGATION SIDEBAR
                ========================================================================================
                
                Fixed sidebar navigation for desktop devices (>= md breakpoint).
                Features:
                - Collapsible design (expanded/collapsed states)
                - Smooth width transition animations
                - Toggle button for expand/collapse control
                - Icon-only mode when collapsed (with tooltips)
                - Full navigation with labels when expanded
                - User profile section at bottom
                - Consistent theming with mobile version
                
                States:
                - Expanded (w-48): Shows full navigation with icons and labels
                - Collapsed (w-16): Shows icon-only navigation with tooltips
            */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className={`flex flex-col transition-all duration-300 ${sidebarExpanded ? 'w-48' : 'w-16'}`}>
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
                        {/* Toggle button */}
                        <div className="flex justify-end p-2 border-b border-gray-200">
                            <button
                                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title={sidebarExpanded ? 'Collapse' : 'Expand'}
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
                                        <p className="text-xs font-medium text-gray-700 truncate">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@mylittlepet.com'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowLogoutDialog(true)}
                                        className="ml-1 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                        title="Sign Out"
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
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================================
                MAIN CONTENT AREA
                ========================================================================================
                
                The primary content area where page-specific components are rendered.
                Features:
                - Responsive flex layout that takes remaining space
                - Mobile menu trigger button (hidden on desktop)
                - Scrollable main content area
                - Responsive padding and max-width constraints
                - Proper z-index stacking for overlays
            */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                
                {/* Mobile menu trigger - only visible on mobile devices */}
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                    <button
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open mobile navigation menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Main content container with responsive padding and scrolling */}
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* ========================================================================================
                LOGOUT CONFIRMATION DIALOG
                ========================================================================================
                
                Modal dialog for confirming user logout actions.
                Prevents accidental logouts and provides clear user feedback.
                
                Features:
                - Modal overlay with backdrop
                - Clear confirmation message
                - Cancel and confirm action buttons
                - Proper accessibility and focus management
            */}
            <LogoutConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
