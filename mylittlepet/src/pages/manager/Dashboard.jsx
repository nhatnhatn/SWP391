import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Users, Heart, Package, TrendingUp } from 'lucide-react';
import { mockAnalytics, mockPlayers, mockPets, mockItems, RARITY_COLORS } from '../../data/mockData';
import { formatNumber } from '../../utils/helpers';

export default function Dashboard() {
    const totalPlayers = mockPlayers.length;
    const activePlayers = mockPlayers.filter(p => p.status === 'active').length;
    const totalPets = mockPets.length;
    const totalItems = mockItems.length;

    const stats = [
        {
            name: 'Total Players',
            value: totalPlayers,
            change: '+12%',
            changeType: 'positive',
            icon: Users,
        },
        {
            name: 'Active Players',
            value: activePlayers,
            change: '+8%',
            changeType: 'positive',
            icon: TrendingUp,
        },
        {
            name: 'Total Pets',
            value: totalPets,
            change: '+15%',
            changeType: 'positive',
            icon: Heart,
        },
        {
            name: 'Total Items',
            value: totalItems,
            change: '+5%',
            changeType: 'positive',
            icon: Package,
        },
    ];

    const rarityColors = Object.values(RARITY_COLORS);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to the game administration dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Icon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatNumber(stat.value)}
                                                </div>
                                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {stat.change}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Player Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Player Growth Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={mockAnalytics.playerGrowth}>
                            <defs>
                                <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="players"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorPlayers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Daily Active Users */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Active Users</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockAnalytics.dailyActiveUsers}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            <YAxis />
                            <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Rarity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Item Rarity Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={mockAnalytics.rarityDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name} ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {mockAnalytics.rarityDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={rarityColors[index % rarityColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Rarity Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Rarity Breakdown</h3>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rarity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockAnalytics.rarityDistribution.map((item, index) => (
                                    <tr key={item.rarity}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className="h-3 w-3 rounded-full mr-3"
                                                    style={{ backgroundColor: rarityColors[index] }}
                                                />
                                                <span className="text-sm font-medium text-gray-900">{item.rarity}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatNumber(item.count)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.percentage}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
