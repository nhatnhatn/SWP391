import React, { useState } from 'react';
import { Search, Eye, Edit, Users, UserPlus } from 'lucide-react';
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
        searchPlayers,
        banPlayer,
        unbanPlayer,
        stats
    } = useSimplePlayers();

    // Local UI state
    const [showModal, setShowModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.trim()) {
            searchPlayers(term);
        }
    };

    // Handle player actions
    const handleBanPlayer = async (playerId) => {
        try {
            await banPlayer(playerId);
            console.log('Player banned successfully');
        } catch (error) {
            console.error('Failed to ban player:', error);
        }
    };

    const handleUnbanPlayer = async (playerId) => {
        try {
            await unbanPlayer(playerId);
            console.log('Player unbanned successfully');
        } catch (error) {
            console.error('Failed to unban player:', error);
        }
    };

    // Filter players locally for display
    const filteredPlayers = players.filter(player => {
        if (!searchTerm) return true;
        return player.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Basic functions - updated for backend
    const handleView = (player) => {
        setSelectedPlayer(player);
        setShowModal(true);
        alert(`Xem thông tin: ${player.userName}`); // Simple feedback
    };

    const handleEdit = (player) => {
        alert(`Chỉnh sửa: ${player.userName} (Chức năng sẽ làm tuần sau)`);
    };

    const handleDelete = (playerId) => {
        // Simple delete - happy case
        const confirmDelete = window.confirm('Bạn có chắc muốn xóa?');
        if (confirmDelete) {
            // Note: deletePlayer function from hook can be added later
            alert('Chức năng xóa sẽ được hoàn thiện sau!');
        }
    };

    // Simple status badge
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
            {/* Simple Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Users className="w-8 h-8 mr-2 text-blue-600" />
                    Quản lý người chơi (Version sinh viên - Tuần 1)
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
                            <UserPlus className="w-6 h-6 text-green-600" />
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => alert('Thêm người chơi mới (Làm tuần sau)')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Thêm mới
                    </button>
                </div>
            </div>

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
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Người chơi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tài sản
                                    </th>                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ngày đăng ký
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
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {player.userName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {player.userEmail || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Level {player.userLevel || 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="space-y-1">
                                            <div>💰 {(player.userCoins || 0).toLocaleString()}</div>
                                            <div>💎 {(player.userDiamonds || 0).toLocaleString()}</div>
                                            <div>💜 {(player.userGems || 0).toLocaleString()}</div>
                                        </div>
                                    </td>                                    <td className="px-6 py-4">
                                        {getStatusBadge(player.userStatus || 'ACTIVE')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {player.createdAt ? new Date(player.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
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
                )}

                {/* Simple Footer */}
                <div className="bg-gray-50 px-6 py-3">
                    <p className="text-sm text-gray-700">
                        Hiển thị {filteredPlayers.length} / {players.length} người chơi
                    </p>
                </div>
            </div>

            {/* Simple Modal for View Details */}
            {showModal && selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Chi tiết người chơi: {selectedPlayer.username}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {selectedPlayer.email}</p>
                            <p><strong>Level:</strong> {selectedPlayer.level}</p>
                            <p><strong>Coins:</strong> {selectedPlayer.coins.toLocaleString()}</p>
                            <p><strong>Diamonds:</strong> {selectedPlayer.diamonds.toLocaleString()}</p>
                            <p><strong>Gems:</strong> {selectedPlayer.gems.toLocaleString()}</p>
                            <p><strong>Trạng thái:</strong> {selectedPlayer.status}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(selectedPlayer.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayersSimple;
