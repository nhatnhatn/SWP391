import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Eye, Users, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Filter, Save, Edit, Shield, ShieldCheck } from 'lucide-react';
import { useSimplePlayers } from '../../hooks/useSimplePlayers';

// Notification Toast Component
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

// Simple Players component - Updated with Backend Integration
const PlayersSimple = () => {    // Use hook for data management
    const {
        players,
        allPlayers, // All unfiltered players for proper filtering
        loading,
        error,
        banPlayer,
        unbanPlayer,
        stats,
        pagination, goToPage, nextPage,
        previousPage,
        getPlayerPets,
        updatePlayer,
        refreshData: refreshCurrentPage } = useSimplePlayers();

    // Local search state - separated from hook for debouncing
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(localSearchTerm);
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Local UI state
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedPlayerPets, setSelectedPlayerPets] = useState([]);
    const [loadingPets, setLoadingPets] = useState(false);
    const [banModal, setBanModal] = useState({ isOpen: false, player: null });
    const [editModal, setEditModal] = useState({ isOpen: false, player: null });
    const [editForm, setEditForm] = useState({
        userName: '',
        email: '',
        level: 1,
        coin: 0,
        diamond: 0,
        gem: 0
    });

    const [banTimers, setBanTimers] = useState({}); // Track ban end times locally (hidden counting)

    // Notification state
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    // Helper function to show notifications
    const showNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, duration);
    };

    // Helper function to clear notifications
    const clearNotification = () => {
        setNotification({ message: '', type: '', show: false });
    };

    // Check for login success notification from sessionStorage
    useEffect(() => {
        const storedNotification = sessionStorage.getItem('loginSuccessNotification');
        if (storedNotification) {
            try {
                const notificationData = JSON.parse(storedNotification);
                // Check if notification is not too old (within 30 seconds)
                const now = Date.now();
                const timeDiff = now - notificationData.timestamp;
                if (timeDiff < 30000) { // 30 seconds
                    showNotification(notificationData.message, notificationData.type, 4000);
                }
                // Clear the notification from sessionStorage after using it
                sessionStorage.removeItem('loginSuccessNotification');
            } catch (error) {
                console.error('Error parsing stored notification:', error);
                sessionStorage.removeItem('loginSuccessNotification');
            }
        }
    }, []);

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Hidden timer check - auto unban when time expires (no UI display)
    useEffect(() => {
        const interval = setInterval(async () => {
            const now = new Date();
            const expiredBans = [];

            // Check for expired bans silently
            Object.entries(banTimers).forEach(([playerId, banEndDate]) => {
                const timeLeft = new Date(banEndDate) - now;
                if (timeLeft <= 0) {
                    console.log(`⏰ Silent auto-unban: Player ${playerId} ban expired`);
                    expiredBans.push(playerId);
                }
            });

            // Auto-unban expired players silently
            for (const playerId of expiredBans) {
                try {
                    await handleAutoUnban(playerId);
                } catch (error) {
                    console.error(`Failed to auto-unban player ${playerId}:`, error);
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [banTimers]);    // Handle search - Use local state with debouncing
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
    }, []);

    // Clear search with debouncing reset
    const clearSearch = useCallback(() => {
        setLocalSearchTerm('');
        setDebouncedSearchTerm('');
    }, []);// Handle player actions
    const handleBanPlayer = async (playerId, duration = null) => {
        if (!duration) {
            // Open ban modal to select duration
            const player = players.find(p => p.id === playerId);
            setBanModal({ isOpen: true, player });
            return;
        }

        try {
            // Calculate ban end date
            const now = new Date();
            let banEndDate;
            switch (duration) {
                case '1minute':
                    banEndDate = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
                    break;
                case '3days':
                    banEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                    break;
                case '7days':
                    banEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case '1month':
                    banEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'permanent':
                    banEndDate = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
                    break;
                default:
                    banEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
            }            await banPlayer(playerId, banEndDate);
            console.log(`✅ Player banned for ${duration} until ${banEndDate.toLocaleDateString('vi-VN')} ${banEndDate.toLocaleTimeString('vi-VN')}`);

            // Store ban timer locally for hidden counting
            setBanTimers(prev => ({
                ...prev,
                [playerId]: banEndDate.toISOString()
            }));

            setBanModal({ isOpen: false, player: null });
        } catch (error) {
            console.error('Failed to ban player:', error);
        }
    }; const handleUnbanPlayer = async (playerId) => {
        try {
            await unbanPlayer(playerId);
            console.log('Player unbanned successfully');

            // Remove from hidden ban timers
            setBanTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[playerId];
                return newTimers;
            });
        } catch (error) {
            console.error('Failed to unban player:', error);
        }
    };

    // Auto-unban function (called by hidden timer)
    const handleAutoUnban = async (playerId) => {
        try {
            console.log(`🤖 Auto-unbanning player ${playerId} - ban time expired (hidden)`);
            await unbanPlayer(playerId);

            // Remove from hidden ban timers
            setBanTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[playerId];
                return newTimers;
            });

            console.log(`✅ Player ${playerId} automatically unbanned - status changed to ACTIVE`);
        } catch (error) {
            console.error(`❌ Failed to auto-unban player ${playerId}:`, error);
        }
    };

    // Sort function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Get sort icon
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-4 h-4 inline ml-1" /> :
            <ChevronDown className="w-4 h-4 inline ml-1" />;
    };    // Filter and sort all players, then paginate (proper client-side pagination)
    const [currentFilterPage, setCurrentFilterPage] = useState(0);
    const itemsPerPage = 10;

    const filteredPlayers = useMemo(() => {
        // Start with all players from the hook
        let filtered = allPlayers.filter(player => {
            // Search filter - use debounced search term
            if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const userName = (player.userName || '').toLowerCase();
                const email = (player.email || '').toLowerCase();
                if (!userName.includes(searchLower) && !email.includes(searchLower)) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                const playerStatus = player.userStatus || 'ACTIVE';
                if (playerStatus !== statusFilter) return false;
            }

            // Level filter
            if (levelFilter !== 'all') {
                const playerLevel = player.level || 1;
                switch (levelFilter) {
                    case 'low':
                        if (playerLevel >= 10) return false;
                        break;
                    case 'medium':
                        if (playerLevel < 10 || playerLevel >= 50) return false;
                        break;
                    case 'high':
                        if (playerLevel < 50) return false;
                        break;
                    default:
                        break;
                }
            }

            return true;
        });

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparisons
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [allPlayers, debouncedSearchTerm, sortConfig, statusFilter, levelFilter]);

    // Calculate pagination for filtered results
    const totalFilteredPages = Math.ceil(filteredPlayers.length / itemsPerPage);
    const startIndex = currentFilterPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayPlayers = filteredPlayers.slice(startIndex, endIndex);    // Reset to first page when filters change
    useEffect(() => {
        setCurrentFilterPage(0);
    }, [debouncedSearchTerm, statusFilter, levelFilter]);

    // Pagination handlers for filtered results
    const handleFilterPreviousPage = () => {
        if (currentFilterPage > 0) {
            setCurrentFilterPage(currentFilterPage - 1);
        }
    };

    const handleFilterNextPage = () => {
        if (currentFilterPage < totalFilteredPages - 1) {
            setCurrentFilterPage(currentFilterPage + 1);
        }
    };

    // Basic functions - updated for backend
    const handleView = async (player) => {
        setSelectedPlayer(player);
        setLoadingPets(true);

        try {
            console.log('Loading pets for player:', player.userName);
            const pets = await getPlayerPets(player.id);
            setSelectedPlayerPets(pets || []);
            console.log('Pets loaded:', pets);
        } catch (error) {
            console.error('Failed to load player pets:', error);
            setSelectedPlayerPets([]);
        } finally {
            setLoadingPets(false);
        }
    };

    // Edit functions
    const handleEdit = (player) => {
        setEditForm({
            userName: player.userName || '',
            email: player.email || '',
            level: player.level || 1,
            coin: player.coin || 0,
            diamond: player.diamond || 0,
            gem: player.gem || 0
        });
        setEditModal({ isOpen: true, player: player });
    };

    const handleEditSubmit = async () => {
        try {
            const updatedData = {
                ...editForm,
                id: editModal.player.id,
                userStatus: editModal.player.userStatus // Giữ nguyên status
            };

            await updatePlayer(editModal.player.id, updatedData);
            setEditModal({ isOpen: false, player: null });

            // Refresh data sau khi update
            await refreshCurrentPage();

            alert('Cập nhật thông tin người chơi thành công!');
        } catch (error) {
            console.error('Failed to update player:', error);
            alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    const handleEditCancel = () => {
        setEditModal({ isOpen: false, player: null });
        setEditForm({
            userName: '',
            email: '',
            level: 1,
            coin: 0,
            diamond: 0,
            gem: 0
        });
    };

    const handleDelete = (playerId) => {
        // Simple delete - happy case
        const confirmDelete = window.confirm('Bạn có chắc muốn xóa?');
        if (confirmDelete) {
            // Note: deletePlayer function from hook can be added later
            alert('Chức năng xóa sẽ được hoàn thiện sau!');
        }
    };    // Enhanced status badge with icons and better styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'ACTIVE': {
                classes: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-700',
                icon: '',
                text: 'Active'
            },
            'BANNED': {
                classes: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 shadow-sm dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700',
                icon: '',
                text: 'Banned'
            },
            'INACTIVE': {
                classes: 'bg-gradient-to-r from-stone-100 to-gray-100 text-stone-800 border border-stone-200 shadow-sm dark:from-stone-800/30 dark:to-gray-800/30 dark:text-stone-300 dark:border-stone-600',
                icon: '',
                text: 'Inactive'
            }
        };

        const config = statusConfig[status] || statusConfig.INACTIVE;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.classes}`}>
                {config.icon && <span className="mr-1">{config.icon}</span>}
                {config.text}
            </span>
        );
    };
    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Notification Toast */}
            {notification.show && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}

            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý người chơi</h1>
                            {/* <p className="text-gray-600 mt-1">Quản lý danh sách người chơi trong game</p> */}
                        </div>
                    </div>

                    {/* Statistics in Header */}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-green-100 rounded-lg">
                                    <Users className="h-4 w-4 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Tổng người chơi</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{stats?.total || players.length}</p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">
                                {stats?.active || players.filter(p => p.userStatus === 'ACTIVE').length}
                            </p>
                        </div>

                        <div className="w-px h-12 bg-gray-300"></div>

                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold text-sm">✕</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">Bị cấm</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {stats?.banned || players.filter(p => p.userStatus === 'BANNED').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Statistics */}
                <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-green-600" />
                                <p className="text-xs font-medium text-gray-600">Tổng người chơi</p>
                            </div>
                            <p className="text-lg font-bold text-green-600">{stats?.total || players.length}</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-emerald-600 font-bold text-sm">✓</span>
                                <p className="text-xs font-medium text-gray-600">Đang hoạt động</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">
                                {stats?.active || players.filter(p => p.userStatus === 'ACTIVE').length}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-red-600 font-bold text-sm">✕</span>
                                <p className="text-xs font-medium text-gray-600">Bị cấm</p>
                            </div>
                            <p className="text-lg font-bold text-red-600">
                                {stats?.banned || players.filter(p => p.userStatus === 'BANNED').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Search Section */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                                <Search className="h-2 w-2 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700"> Tìm kiếm người chơi</span>
                        </div>

                        <div className="space-y-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors duration-200" />                                <input
                                    type="text"
                                    placeholder="Nhập tên người chơi để tìm kiếm..."
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                />
                                {localSearchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                        title="Xóa tìm kiếm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {(localSearchTerm || debouncedSearchTerm) && (
                                <div className="bg-green-100 rounded-md p-3 border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-green-800 font-medium">
                                            🔍 Đang hiển thị kết quả tìm kiếm cho: "<span className="font-semibold text-green-900">{debouncedSearchTerm || localSearchTerm}</span>"
                                            {localSearchTerm !== debouncedSearchTerm && localSearchTerm && (
                                                <span className="text-xs text-green-600 ml-2">(đang nhập...)</span>
                                            )}
                                        </p>
                                        <button
                                            onClick={clearSearch}
                                            className="ml-auto text-green-600 hover:text-green-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                        >
                                            Xóa tìm kiếm
                                        </button>
                                    </div>
                                </div>)}
                        </div>
                    </div>                    {/* Filters Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg border border-gray-200 transition-all duration-200 group"
                            >
                                <Filter className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                    Bộ lọc nâng cao
                                </span>
                                {showAdvancedFilters ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                )}
                                {/* Filter Status Indicator */}
                                {(statusFilter !== 'all' || levelFilter !== 'all' || sortConfig.key) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                        {[statusFilter !== 'all' ? statusFilter : null, levelFilter !== 'all' ? levelFilter : null, sortConfig.key].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Advanced Filters Content - Collapsible */}
                        {showAdvancedFilters && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center">
                                            <Filter className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Lọc theo nội dung</span>
                                    </div>                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Trạng thái tài khoản
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả trạng thái</option>
                                                    <option value="ACTIVE"> Active</option>
                                                    <option value="BANNED"> Banned</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Level Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Mức độ Level
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={levelFilter}
                                                    onChange={(e) => setLevelFilter(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value="all"> Tất cả level</option>
                                                    <option value="low"> Thấp (1-9)</option>
                                                    <option value="medium"> Trung bình (10-49)</option>
                                                    <option value="high"> Cao (50+)</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter Status Display */}
                                    {(statusFilter !== 'all' || levelFilter !== 'all') && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {statusFilter !== 'all' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    {statusFilter === 'ACTIVE' ? ' Active' : ' Banned'}
                                                </span>
                                            )}
                                            {levelFilter !== 'all' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    {levelFilter === 'low' ? ' Level thấp' :
                                                        levelFilter === 'medium' ? ' Level trung bình' :
                                                            ' Level cao'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Sorting Section */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center">

                                            <ChevronUp className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Sắp xếp dữ liệu</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Sort Field */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sắp xếp theo
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={sortConfig.key || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            setSortConfig({ key: e.target.value, direction: sortConfig.direction || 'asc' });
                                                        } else {
                                                            setSortConfig({ key: null, direction: 'asc' });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                                >
                                                    <option value=""> Không sắp xếp</option>
                                                    <option value="userName"> Tên người chơi</option>
                                                    <option value="level"> Level</option>
                                                    <option value="coin"> Coin</option>
                                                    <option value="diamond"> Diamond</option>
                                                    <option value="gem"> Gem</option>
                                                    <option value="userStatus"> Trạng thái</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Sort Direction */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Thứ tự
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSortConfig(prev => ({ ...prev, direction: 'asc' }))}
                                                    disabled={!sortConfig.key}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${sortConfig.direction === 'asc' && sortConfig.key
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : sortConfig.key
                                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        <ChevronUp className="h-4 w-4" />
                                                        Tăng dần
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setSortConfig(prev => ({ ...prev, direction: 'desc' }))}
                                                    disabled={!sortConfig.key}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${sortConfig.direction === 'desc' && sortConfig.key
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : sortConfig.key
                                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        <ChevronDown className="h-4 w-4" />
                                                        Giảm dần
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Sort Display */}
                                    {sortConfig.key && (
                                        <div className="mt-3 p-2.5 bg-blue-100 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <span className="text-blue-800 font-medium">
                                                        Đang sắp xếp theo: <span className="font-bold">
                                                            {sortConfig.key === 'userName' && 'Tên người chơi'}
                                                            {sortConfig.key === 'level' && 'Level'}
                                                            {sortConfig.key === 'coin' && ' Coin'}
                                                            {sortConfig.key === 'diamond' && ' Diamond'}
                                                            {sortConfig.key === 'gem' && ' Gem'}
                                                            {sortConfig.key === 'userStatus' && 'Trạng thái'}
                                                        </span> ({sortConfig.direction === 'asc' ? 'Thứ tự tăng dần' : 'Thứ tự giảm Giảm dần'})
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline hover:no-underline transition-all duration-200"
                                                >
                                                    Bỏ sắp xếp
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section - Separated */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-4 w-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <X className="h-2 w-2 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700"> Thao tác</span>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                setStatusFilter('all');
                                                setLevelFilter('all');
                                                setSortConfig({ key: null, direction: 'asc' });
                                                clearSearch();
                                            }}
                                            disabled={statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm}
                                            className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                                }`}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !localSearchTerm && !debouncedSearchTerm
                                                ? 'Không có bộ lọc nào'
                                                : 'Xóa tất cả bộ lọc'
                                            }
                                        </button>

                                        {/* Filter Status Indicator */}
                                        {(statusFilter !== 'all' || levelFilter !== 'all' || sortConfig.key || localSearchTerm || debouncedSearchTerm) && (
                                            <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                                {[
                                                    (localSearchTerm || debouncedSearchTerm) && 'Tìm kiếm',
                                                    statusFilter !== 'all' && 'Trạng thái',
                                                    levelFilter !== 'all' && 'Level',
                                                    sortConfig.key && 'Sắp xếp'
                                                ].filter(Boolean).length} bộ lọc đang áp dụng
                                            </div>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player Details Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                        {/* Header with Gradient */}
                        <div className="relative bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 p-6 border-b border-gray-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-green-600/90 to-emerald-600/90"></div>
                            <div className="relative flex justify-center items-center">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="text-4xl font-bold text-white">Chi tiết người chơi</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content - No scroll */}
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Status Banner */}
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between ">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-blue-600 font-bold text-sm">👤</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-800">Trạng thái tài khoản</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(selectedPlayer.userStatus || 'ACTIVE')}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedPlayer.joinDate ?
                                                `Ngày tham gia: ${new Date(selectedPlayer.joinDate).toLocaleDateString('vi-VN')}` :
                                                'Ngày tham gia: N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Level Card */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Cấp độ hiện tại</p>
                                            <p className="text-2xl font-bold text-amber-700">{selectedPlayer.level || 1}</p>
                                        </div>

                                    </div>
                                </div>

                                {/* Coins Card */}
                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Coins</p>
                                            <p className="text-2xl font-bold text-yellow-700">{(selectedPlayer.coin || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Diamonds Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Diamonds</p>
                                            <p className="text-2xl font-bold text-blue-700">{(selectedPlayer.diamond || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gems Card */}
                                <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Gems</p>
                                            <p className="text-2xl font-bold text-green-700">{(selectedPlayer.gem || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <span className="text-2xl"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Personal Information Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <h4 className="text-2xl font-semibold text-gray-800">Thông tin cá nhân</h4>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">ID Người chơi</span>
                                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">#{selectedPlayer.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">Tên người chơi</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedPlayer.userName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-gray-600">Email</span>
                                            <span className="text-sm text-gray-900 break-all">{selectedPlayer.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Game Statistics Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <h4 className="text-2xl font-semibold text-gray-800">Thống kê Game</h4>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">

                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm font-medium text-gray-600">Tổng thú cưng</span>
                                            <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                                                <span>🐾</span>
                                                {selectedPlayer.totalPets || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-gray-600">Cấp độ hiện tại</span>
                                            <div className="flex items-center gap-2">

                                                <span className="text-sm text-black-500">{selectedPlayer.level || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pets Section */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <span className="text-emerald-600 text-lg">🐾</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">Danh sách thú cưng</h4>
                                            </div>
                                        </div>
                                        {selectedPlayerPets.length > 0 && (
                                            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                                {selectedPlayerPets.length} thú cưng
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5">
                                    {loadingPets ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                                            <span className="text-lg font-medium">Đang tải danh sách thú cưng...</span>
                                            <span className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</span>
                                        </div>
                                    ) : selectedPlayerPets.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {selectedPlayerPets.map((pet, index) => (
                                                <div key={pet.playerPetId || index}
                                                    className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
                                                                <span className="text-sm">🐾</span>
                                                            </div>
                                                            <div className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                                                Lv.{pet.level || 1}
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h6 className="font-semibold text-gray-900 text-sm line-clamp-1" title={pet.petCustomName || pet.petDefaultName || 'Chưa đặt tên'}>
                                                            {pet.petCustomName || pet.petDefaultName || 'Chưa đặt tên'}
                                                        </h6>

                                                        {pet.petType && (
                                                            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full w-fit">
                                                                <span>🏷️</span>
                                                                <span>{pet.petType}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-lg font-semibold text-gray-700 mb-2">Chưa có thú cưng nào</p>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                                Người chơi này chưa sở hữu thú cưng nào trong game.
                                                Họ có thể nhận thú cưng đầu tiên từ cửa hàng.
                                            </p>
                                            <div className="mt-4 flex justify-center">
                                                <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm">
                                                    0 thú cưng
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="flex p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white justify-end items-center">

                            <div className="flex gap-3">
                                {/* Uncomment if you want to add edit functionality */}
                                {/* <button
                                        onClick={() => {
                                            handleEdit(selectedPlayer);
                                            setSelectedPlayer(null);
                                            setSelectedPlayerPets([]);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button> */}

                                <button
                                    onClick={() => {
                                        setSelectedPlayer(null);
                                        setSelectedPlayerPets([]);
                                    }}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Player Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gradient-to-l from-teal-600 to-green-600 px-6 py-4 border-b border-green-100">
                    <div className="flex items-center justify-center">
                        <p className="text-xl font-bold text-white text-center">DANH SÁCH NGƯỜI CHƠI TRONG GAME</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <colgroup>
                                <col className="w-[18%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-l from-teal-600 to-green-600 border-b-4 border-green-800 shadow-lg">
                                <tr>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Tên Người chơi
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Level
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Coin
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Diamond
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Gem
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide border-r border-green-500 border-opacity-30">
                                        <span className="flex items-center justify-center gap-2">
                                            Trạng thái
                                        </span>
                                    </th>
                                    <th className="px-3 py-6 text-center text-sm font-bold text-white uppercase tracking-wide">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200 text-justify">
                                {displayPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-medium text-gray-900">Không có người chơi nào</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {(localSearchTerm || debouncedSearchTerm) || statusFilter !== 'all' || levelFilter !== 'all'
                                                            ? 'Không tìm thấy người chơi phù hợp với bộ lọc.'
                                                            : 'Không có người chơi nào trong trang này.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>) : (displayPlayers.map((player) => (
                                        <tr key={player.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200">
                                            {/* Player Name */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-sm font-bold text-gray-900 break-words" title={player.userName || 'N/A'}>
                                                        {player.userName || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Level */}
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm">
                                                        {player.level || 1}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Coin */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-xs font-medium text-yellow-600">
                                                            {(player.coin || 0).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Diamond */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-xs font-medium text-blue-600">
                                                            {(player.diamond || 0).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Gem */}
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-xs font-medium text-green-600">
                                                            {(player.gem || 0).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center">
                                                    {getStatusBadge(player.userStatus || 'ACTIVE')}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleView(player)}
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Ban/Unban Button */}
                                                    {/* {player.userStatus === 'BANNED' ? (
                                                        <button
                                                            onClick={() => handleUnbanPlayer(player.id)}
                                                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                            title="Bỏ cấm tài khoản"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBanPlayer(player.id)}
                                                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                            title="Cấm tài khoản"
                                                        >
                                                            <Power className="w-3.5 h-3.5" />
                                                        </button>
                                                    )} */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Pagination - Blue-Cyan Gradient */}
            {
                totalFilteredPages > 1 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-t border-blue-200">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={handleFilterPreviousPage}
                                    disabled={currentFilterPage === 0}
                                    className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Trước</span>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalFilteredPages }, (_, i) => i).map((page) => {
                                        const shouldShow =
                                            page === 0 ||
                                            page === totalFilteredPages - 1 ||
                                            Math.abs(page - currentFilterPage) <= 1;

                                        if (!shouldShow && page !== 1 && page !== totalFilteredPages - 2) {
                                            return null;
                                        }

                                        if (
                                            (page === 1 && currentFilterPage > 3) ||
                                            (page === totalFilteredPages - 2 && currentFilterPage < totalFilteredPages - 4)
                                        ) {
                                            return (
                                                <span key={page} className="px-2 text-blue-500">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentFilterPage(page)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === currentFilterPage
                                                    ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md'
                                                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800'
                                                    }`}
                                            >
                                                {page + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={handleFilterNextPage}
                                    disabled={currentFilterPage >= totalFilteredPages - 1}
                                    className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                                >
                                    <span className="hidden sm:inline">Tiếp</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Player Modal */}
            {
                editModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Chỉnh sửa người chơi: {editModal.player?.userName}
                            </h3>                            <div className="space-y-4 mb-6">
                                {/* Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Level
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={editForm.level}
                                        onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Tài sản */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Coins
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.coin}
                                            onChange={(e) => setEditForm({ ...editForm, coin: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Diamonds
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.diamond}
                                            onChange={(e) => setEditForm({ ...editForm, diamond: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gems
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.gem}
                                            onChange={(e) => setEditForm({ ...editForm, gem: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleEditCancel}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Ban Duration Modal */}
            {
                banModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Cấm người chơi: {banModal.player?.userName}
                            </h3>                <p className="text-gray-600 mb-6">
                                Chọn thời gian cấm cho người chơi này:
                            </p>

                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => handleBanPlayer(banModal.player?.id, '1minute')}
                                    className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-25"
                                >
                                    <div className="font-medium text-red-700">1 phút (Test)</div>
                                    <div className="text-sm text-red-500">Cấm trong 1 phút để test</div>
                                </button>

                                <button
                                    onClick={() => handleBanPlayer(banModal.player?.id, '3days')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="font-medium">3 ngày</div>
                                    <div className="text-sm text-gray-500">Cấm trong 3 ngày</div>
                                </button>

                                <button
                                    onClick={() => handleBanPlayer(banModal.player?.id, '7days')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="font-medium">7 ngày</div>
                                    <div className="text-sm text-gray-500">Cấm trong 1 tuần</div>
                                </button>

                                <button
                                    onClick={() => handleBanPlayer(banModal.player?.id, '1month')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="font-medium">1 tháng</div>
                                    <div className="text-sm text-gray-500">Cấm trong 30 ngày</div>
                                </button>

                                <button
                                    onClick={() => handleBanPlayer(banModal.player?.id, 'permanent')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="font-medium">Vĩnh viễn</div>
                                    <div className="text-sm text-gray-500">Cấm vĩnh viễn người chơi này</div>
                                </button>

                            </div>

                            <div className="flex justify-end space-x-3">                    <button
                                onClick={() => setBanModal({ isOpen: false, player: null })}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            </div>
                        </div>
                    </div>

                )
            }
        </div>
    )
};

export default PlayersSimple;
