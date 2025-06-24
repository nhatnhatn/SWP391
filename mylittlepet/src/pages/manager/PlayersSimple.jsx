import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Users, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Filter, Save, Edit, Shield, ShieldCheck } from 'lucide-react';
import { useSimplePlayers } from '../../hooks/useSimplePlayers';

// Simple Players component - Updated with Backend Integration
const PlayersSimple = () => {    // Use hook for data management
    const {
        players,
        allPlayers, // All unfiltered players for proper filtering
        loading,
        error,
        searchTerm,
        setSearchTerm,
        banPlayer,
        unbanPlayer,
        stats,
        pagination, goToPage, nextPage,
        previousPage,
        getPlayerPets,
        updatePlayer,
        refreshData: refreshCurrentPage } = useSimplePlayers();

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
    }, [banTimers]);    // Handle search - Use hook's setSearchTerm directly
    const handleSearch = (term) => {
        setSearchTerm(term);
    };// Handle player actions
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
            // Search filter
            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                const userName = (player.userName || '').toLowerCase();
                if (!userName.includes(searchLower)) return false;
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
    }, [allPlayers, searchTerm, sortConfig, statusFilter, levelFilter]);

    // Calculate pagination for filtered results
    const totalFilteredPages = Math.ceil(filteredPlayers.length / itemsPerPage);
    const startIndex = currentFilterPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayPlayers = filteredPlayers.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentFilterPage(0);
    }, [searchTerm, statusFilter, levelFilter]);

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
    };    // Simple status badge
    const getStatusBadge = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'BANNED': 'bg-red-100 text-red-800',
            'INACTIVE': 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || colors.INACTIVE}`}>
                {status}
            </span>
        );
    }; return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Quản lý Người Chơi</h1>
                            <p className="text-gray-600 mt-1">Quản lý danh sách người chơi trong game một cách hiệu quả</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 text-gray-500">
                        <div className="text-center">
                            <p className="text-sm font-medium">Tổng người chơi</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.total || players.length}</p>
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
            )}            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng Người chơi</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.total || players.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <span className="text-emerald-600 font-bold text-lg">✓</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang Hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.active || players.filter(p => p.userStatus === 'ACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-red-600 font-bold text-lg">✕</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Bị Cấm</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.banned || players.filter(p => p.userStatus === 'BANNED').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tìm kiếm & Bộ lọc</h3>
                                <p className="text-green-100 text-sm">Tìm kiếm và lọc danh sách người chơi một cách thông minh</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-white/80 text-sm">
                            <Users className="h-4 w-4" />
                            <span>Quản lý hiệu quả</span>
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
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Tìm kiếm người chơi
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors duration-200" />
                                <input
                                    type="text"
                                    placeholder="Nhập tên người chơi để tìm kiếm..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                        title="Xóa tìm kiếm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {searchTerm && (
                                <div className="bg-green-100 rounded-md p-3 border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-green-800 font-medium">
                                            🔍 Đang hiển thị kết quả tìm kiếm cho: "<span className="font-semibold text-green-900">{searchTerm}</span>"
                                        </p>
                                        <button
                                            onClick={() => handleSearch('')}
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
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300"><div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
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
                                            <option value="ACTIVE"> Hoạt động</option>
                                            <option value="BANNED"> Bị cấm</option>
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
                                            {statusFilter === 'ACTIVE' ? ' Hoạt động' : ' Bị cấm'}
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
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                                    <ChevronDown className="h-2 w-2 text-white rotate-180" />
                                </div>
                                <span className="text-sm font-medium text-gray-700"> Sắp xếp dữ liệu</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Sort by Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Sắp xếp theo tên
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={sortConfig.key === 'userName' ? sortConfig.direction : ''}
                                            onChange={(e) => {
                                                if (e.target.value === '') {
                                                    setSortConfig({ key: null, direction: 'asc' });
                                                } else {
                                                    setSortConfig({ key: 'userName', direction: e.target.value });
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                        >
                                            <option value=""> Không sắp xếp</option>
                                            <option value="asc"> Tên A-Z</option>
                                            <option value="desc"> Tên Z-A</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Sort by Currency */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Sắp xếp theo tài sản
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={['coin', 'diamond', 'gem'].includes(sortConfig.key) ? `${sortConfig.key}_${sortConfig.direction}` : ''}
                                            onChange={(e) => {
                                                if (e.target.value === '') {
                                                    setSortConfig({ key: null, direction: 'asc' });
                                                } else {
                                                    const [key, direction] = e.target.value.split('_');
                                                    setSortConfig({ key, direction });
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                        >
                                            <option value=""> Không sắp xếp</option>
                                            <option value="coin_desc">💰 Coin cao đến thấp</option>
                                            <option value="coin_asc">💰 Coin thấp đến cao</option>
                                            <option value="diamond_desc">💎 Diamond cao đến thấp</option>
                                            <option value="diamond_asc">💎 Diamond thấp đến cao</option>
                                            <option value="gem_desc">💜 Gem cao đến thấp</option>
                                            <option value="gem_asc">💜 Gem thấp đến cao</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Sort Status Display */}
                            {sortConfig.key && (
                                <div className="mt-3 p-2 bg-blue-100 rounded-md">
                                    <p className="text-xs text-blue-700 font-medium">
                                        Đang sắp xếp theo: {
                                            sortConfig.key === 'userName' ? `Tên (${sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})` :
                                                sortConfig.key === 'coin' ? `💰 Coin (${sortConfig.direction === 'asc' ? 'Thấp→Cao' : 'Cao→Thấp'})` :
                                                    sortConfig.key === 'diamond' ? `💎 Diamond (${sortConfig.direction === 'asc' ? 'Thấp→Cao' : 'Cao→Thấp'})` :
                                                        sortConfig.key === 'gem' ? `💜 Gem (${sortConfig.direction === 'asc' ? 'Thấp→Cao' : 'Cao→Thấp'})` :
                                                            sortConfig.key
                                        }
                                    </p>
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
                                        handleSearch('');
                                    }}
                                    disabled={statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !searchTerm}
                                    className={`inline-flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !searchTerm
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md transform hover:scale-105'
                                        }`}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    {statusFilter === 'all' && levelFilter === 'all' && !sortConfig.key && !searchTerm
                                        ? 'Không có bộ lọc nào'
                                        : 'Xóa tất cả bộ lọc'
                                    }
                                </button>

                                {/* Filter Status Indicator */}
                                {(statusFilter !== 'all' || levelFilter !== 'all' || sortConfig.key || searchTerm) && (
                                    <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                        {[
                                            searchTerm && 'Tìm kiếm',
                                            statusFilter !== 'all' && 'Trạng thái',
                                            levelFilter !== 'all' && 'Level',
                                            sortConfig.key && 'Sắp xếp'
                                        ].filter(Boolean).length} bộ lọc đang áp dụng
                                    </div>                                )}
                            </div>
                        </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player Details Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Chi tiết Người chơi</h3>
                            <button
                                onClick={() => {
                                    setSelectedPlayer(null);
                                    setSelectedPlayerPets([]);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Column 1: Personal Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">ID</label>
                                        <p className="text-sm text-gray-900 font-mono">#{selectedPlayer.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Tên người chơi</label>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedPlayer.userName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Email</label>
                                        <p className="text-sm text-gray-900">{selectedPlayer.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Level</label>
                                        <p className="text-lg font-bold text-blue-600">Lv. {selectedPlayer.level || 1}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Ngày đăng ký</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedPlayer.joinDate ? new Date(selectedPlayer.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Column 2: Game Resources */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Tài nguyên</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Coins</label>
                                        <p className="text-sm text-yellow-600 font-bold flex items-center">
                                            <span className="text-base mr-1">💰</span>
                                            {(selectedPlayer.coin || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Diamonds</label>
                                        <p className="text-sm text-blue-500 font-bold flex items-center">
                                            <span className="text-base mr-1">💎</span>
                                            {(selectedPlayer.diamond || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Gems</label>
                                        <p className="text-sm text-purple-600 font-bold flex items-center">
                                            <span className="text-base mr-1">💜</span>
                                            {(selectedPlayer.gem || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Tổng thú cưng</label>
                                        <p className="text-sm text-green-600 font-bold flex items-center">
                                            <span className="text-base mr-1">🐾</span>
                                            {selectedPlayer.totalPets || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Column 3: Status */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 border-b pb-2">Trạng thái</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Tình trạng tài khoản</label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedPlayer.userStatus || 'ACTIVE')}
                                        </div>
                                    </div>
                                </div>
                            </div>                            {/* Pets Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-lg mr-2">🐾</span>
                                    Danh sách thú cưng ({selectedPlayerPets.length})
                                </h4>
                                {loadingPets ? (
                                    <div className="flex items-center justify-center space-x-2 text-blue-600 py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span>Đang tải danh sách thú cưng...</span>
                                    </div>
                                ) : selectedPlayerPets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                        {selectedPlayerPets.map((pet, index) => (
                                            <div key={pet.playerPetId || index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                            🐾
                                                        </div>
                                                        <div>
                                                            <h6 className="font-medium text-gray-900 text-xs">
                                                                {pet.petCustomName || pet.petDefaultName || 'Chưa đặt tên'}
                                                            </h6>
                                                            {pet.adoptedAt && (
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(pet.adoptedAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-full">
                                                        Lv.{pet.level || 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        <div className="text-3xl mb-2">🐾</div>
                                        <p className="text-sm font-medium text-gray-600">Chưa có thú cưng</p>
                                        <p className="text-xs text-gray-500">Người chơi này chưa có thú cưng nào</p>
                                    </div>
                                )}
                            </div>
                        </div>                        {/* Footer */}
                        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">                            <button
                            onClick={() => {
                                handleEdit(selectedPlayer);
                                setSelectedPlayer(null); // Đóng modal chi tiết
                                setSelectedPlayerPets([]);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Cập nhật
                        </button>
                            <button
                                onClick={() => {
                                    setSelectedPlayer(null);
                                    setSelectedPlayerPets([]);
                                }}
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}            {/* Player Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-teal-600 to-green-600 border-b-4 border-green-800 shadow-lg">
                            <tr>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Người chơi
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Level
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Coin
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Diamond
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Gem
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Password
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider border-r border-green-500 border-opacity-30">
                                    <span className="flex items-center justify-center gap-2">
                                        Trạng thái
                                    </span>
                                </th>
                                <th className="px-6 py-6 text-center text-base font-bold text-white uppercase tracking-wider">
                                    <span className="flex items-center justify-center gap-2">
                                        Thao tác
                                    </span>
                                </th>
                            </tr>
                        </thead>                            <tbody className="bg-white divide-y divide-gray-200">
                            {displayPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <div className="text-4xl mb-4">👥</div>
                                            <p className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy người chơi</p>
                                            <p className="text-sm text-gray-500">
                                                {searchTerm || statusFilter !== 'all' || levelFilter !== 'all'
                                                    ? 'Không có người chơi nào phù hợp với bộ lọc trong trang này'
                                                    : 'Không có người chơi nào trong trang này'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>) : (displayPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200">
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center justify-center">

                                                <div className="ml-4 text-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {player.userName || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm">
                                                {player.level || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="mr-1">💰</span>
                                                <span className="font-medium text-yellow-600">{(player.coin || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="mr-1">💎</span>
                                                <span className="font-medium text-blue-600">{(player.diamond || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                <span className="mr-1">💜</span>
                                                <span className="font-medium text-purple-600">{(player.gem || 0).toLocaleString()}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <span className="text-gray-400 font-mono">••••••••</span>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            {getStatusBadge(player.userStatus || 'ACTIVE')}
                                        </td>                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                {/* Detail View Button */}
                                                <button
                                                    onClick={() => handleView(player)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEdit(player)}
                                                    className="text-amber-600 hover:text-amber-900 hover:bg-amber-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Chỉnh sửa thông tin"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* Ban/Unban Button */}
                                                {player.userStatus === 'BANNED' ? (
                                                    <button
                                                        onClick={() => handleUnbanPlayer(player.id)}
                                                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Bỏ cấm tài khoản"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBanPlayer(player.id)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                                        title="Cấm tài khoản"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>            {/* Pagination - Blue-Cyan Gradient */}
            {totalFilteredPages > 1 && (
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
            )}

            {/* Edit Player Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Chỉnh sửa người chơi: {editModal.player?.userName}
                        </h3>

                        <div className="space-y-4 mb-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên người chơi
                                </label>
                                <input
                                    type="text"
                                    value={editForm.userName}
                                    onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên người chơi"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập email"
                                />
                            </div>

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
                                        💰 Coins
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
                                        💎 Diamonds
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
                                        💜 Gems
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
            )}

            {/* Ban Duration Modal */}
            {banModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Cấm người chơi: {banModal.player?.userName}
                        </h3>

                        <p className="text-gray-600 mb-6">
                            Chọn thời gian cấm cho người chơi này:
                        </p>                        <div className="space-y-3 mb-6">
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

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setBanModal({ isOpen: false, player: null })}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayersSimple;
