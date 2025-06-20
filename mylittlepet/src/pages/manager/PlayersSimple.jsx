import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSimplePlayers } from '../../hooks/useSimplePlayers';

// Simple Players component - Updated with Backend Integration
const PlayersSimple = () => {
    // Use hook for data management
    const {
        players,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        banPlayer,
        unbanPlayer,
        stats,
        pagination, goToPage, nextPage,
        previousPage, setPageSize,
        getPlayerPets,
        updatePlayer,
        refreshData: refreshCurrentPage
    } = useSimplePlayers();// Local UI state
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
    }); const [banTimers, setBanTimers] = useState({}); // Track ban end times locally (hidden counting)

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
    }, [banTimers]);

    // Handle search - Simple frontend only
    const handleSearch = (term) => {
        setSearchTerm(term);
        // Just set search term, filtering will be done in filteredPlayers
    };    // Handle player actions
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
                    break; default:
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

    // Filter players locally for display - Simple username only search
    const filteredPlayers = players.filter(player => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();
        const userName = (player.userName || '').toLowerCase();

        return userName.includes(searchLower);
    });    // Basic functions - updated for backend
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
    }; const handleEdit = (player) => {
        setEditForm({
            userName: player.userName || '',
            email: player.email || '',
            level: player.level || 1,
            coin: player.coin || 0,
            diamond: player.diamond || 0,
            gem: player.gem || 0
        }); setEditModal({ isOpen: true, player: player });
    }; const handleEditSubmit = async () => {
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
    };

    return (
        <div className="p-6">
            {/* Simple Header */}            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Users className="w-8 h-8 mr-2 text-blue-600" />
                    Quản lý người chơi
                </h1>
                <p className="text-gray-600">Danh sách người chơi trong game</p>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Tổng người chơi</p>
                            <p className="text-xl font-semibold">{stats?.total || players.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Đang hoạt động</p>
                            <p className="text-xl font-semibold">
                                {stats?.active || players.filter(p => p.userStatus === 'ACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Users className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Bị cấm</p>
                            <p className="text-xl font-semibold">
                                {stats?.banned || players.filter(p => p.userStatus === 'BANNED').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>            {/* Error Display */}
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

            {/* Simple Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên người chơi..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Details Display - Above Search */}
            {selectedPlayer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">
                                Chi tiết người chơi: {selectedPlayer.userName || 'N/A'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="space-y-2">
                                    <h5 className="font-medium text-blue-700">Thông tin cơ bản</h5>
                                    <p><strong>📧 Email:</strong> {selectedPlayer.email || 'N/A'}</p>
                                    <p><strong>📅 Ngày đăng ký:</strong> {selectedPlayer.joinDate ? new Date(selectedPlayer.joinDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                    <p><strong>🎮 Trạng thái:</strong> {selectedPlayer.userStatus || 'ACTIVE'}</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-medium text-blue-700">Tiến độ</h5>
                                    <p><strong>⭐ Level:</strong> {selectedPlayer.level || 1}</p>
                                </div>                                <div className="space-y-2">
                                    <h5 className="font-medium text-blue-700">Tài sản</h5>
                                    <p><strong>💰 Coins:</strong> {(selectedPlayer.coin || 0).toLocaleString()}</p>
                                    <p><strong>💎 Diamonds:</strong> {(selectedPlayer.diamond || 0).toLocaleString()}</p>
                                    <p><strong>💜 Gems:</strong> {(selectedPlayer.gem || 0).toLocaleString()}</p>
                                    <p><strong>🐾 Tổng thú cưng:</strong> {selectedPlayer.totalPets || 0}</p>
                                </div>
                            </div>

                            {/* Pets Section */}
                            <div className="mt-6 border-t border-blue-200 pt-4">
                                <h5 className="font-medium text-blue-700 mb-3">🐾 Danh sách thú cưng</h5>
                                {loadingPets ? (
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span>Đang tải danh sách thú cưng...</span>
                                    </div>
                                ) : selectedPlayerPets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">                                        {selectedPlayerPets.map((pet, index) => (
                                        <div key={pet.playerPetId || index} className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">🐾</div>
                                                    <div>
                                                        <h6 className="font-medium text-gray-900">
                                                            {pet.petCustomName || pet.petDefaultName || 'Chưa đặt tên'}
                                                        </h6>
                                                        {pet.adoptedAt && (
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(pet.adoptedAt).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-blue-600">
                                                    Lv.{pet.level || 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">🐾</div>
                                        <p>Người chơi này chưa có thú cưng nào</p>
                                    </div>
                                )}
                            </div>
                        </div>                        <button
                            onClick={() => {
                                setSelectedPlayer(null);
                                setSelectedPlayerPets([]);
                            }}
                            className="ml-4 text-blue-600 hover:text-blue-800 p-1"
                            title="Đóng"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Simple Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Người chơi
                                </th>                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Coin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Diamond
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Gem
                                    </th>                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Password
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">                                {filteredPlayers.map((player) => (
                                <tr key={player.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {player.userName?.charAt(0).toUpperCase() || 'U'}
                                            </div>                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {player.userName || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {player.level || 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <span className="mr-1">💰</span>
                                            <span>{(player.coin || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <span className="mr-1">💎</span>
                                            <span>{(player.diamond || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <span className="mr-1">💜</span>
                                            <span>{(player.gem || 0).toLocaleString()}</span>
                                        </div>
                                    </td>                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <span className="text-gray-400">••••••••</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(player.userStatus || 'ACTIVE')}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleView(player)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(player)}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {player.userStatus === 'BANNED' ? (
                                                <button
                                                    onClick={() => handleUnbanPlayer(player.id)}
                                                    className="text-green-600 hover:text-green-900 p-1"
                                                    title="Bỏ cấm"
                                                >
                                                    ✅
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBanPlayer(player.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Cấm"
                                                >
                                                    🚫
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}                {/* Simple Footer with Pagination */}
                <div className="bg-gray-50 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị {((pagination.currentPage) * pagination.size) + 1} đến {Math.min(((pagination.currentPage) * pagination.size) + filteredPlayers.length, pagination.totalElements)} trong tổng số {pagination.totalElements} người chơi
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center space-x-2">
                            {/* Page Size Selector */}
                            <div className="flex items-center space-x-1 mr-4">
                                <span className="text-sm text-gray-700">Hiển thị:</span>
                                <select
                                    value={pagination.size}
                                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Previous Button */}
                            <button
                                onClick={previousPage}
                                disabled={!pagination.hasPrevious}
                                className={`p-2 rounded-md ${pagination.hasPrevious
                                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                title="Trang trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (pagination.totalPages <= 5) {
                                        pageNumber = i;
                                    } else if (pagination.currentPage <= 2) {
                                        pageNumber = i;
                                    } else if (pagination.currentPage >= pagination.totalPages - 3) {
                                        pageNumber = pagination.totalPages - 5 + i;
                                    } else {
                                        pageNumber = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => goToPage(pageNumber)}
                                            className={`px-3 py-1 rounded-md text-sm ${pageNumber === pagination.currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNumber + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={nextPage}
                                disabled={!pagination.hasNext}
                                className={`p-2 rounded-md ${pagination.hasNext
                                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                title="Trang sau"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Page Info */}
                            <span className="text-sm text-gray-700 ml-4">
                                Trang {pagination.currentPage + 1} / {pagination.totalPages}
                            </span>                        </div>
                    </div>                </div>
            </div>

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
