import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, DollarSign } from 'lucide-react';
import { mockItems, RARITY_TYPES } from '../../data/mockData';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';

export default function Items() {
    const [items, setItems] = useState(mockItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const uniqueTypes = [...new Set(items.map(item => item.type))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesRarity && matchesType;
    });

    const handleDeleteItem = (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== itemId));
        }
    };

    const openModal = (item = null) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const getTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'weapon':
                return '⚔️';
            case 'armor':
                return '🛡️';
            case 'consumable':
                return '🧪';
            case 'food':
                return '🍞';
            default:
                return '📦';
        }
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={rarityFilter}
                        onChange={(e) => setRarityFilter(e.target.value)}
                    >
                        <option value="all">All Rarities</option>
                        {Object.values(RARITY_TYPES).map(rarity => (
                            <option key={rarity} value={rarity}>{capitalize(rarity)}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rarity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-2xl mr-3">{getTypeIcon(item.type)}</div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRarityClass(item.rarity)}`}
                                            style={{ color: getRarityColor(item.rarity) }}
                                        >
                                            {capitalize(item.rarity)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            {formatNumber(item.price)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatNumber(item.quantity)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="max-w-xs">
                                            {Object.entries(item.stats).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-xs">
                                                    <span className="capitalize">{key}:</span>
                                                    <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No items match your current filter criteria.
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Items</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatNumber(items.length)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Quantity</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatNumber(items.reduce((sum, item) => sum + item.quantity, 0))}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Value</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        ${formatNumber(items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </p>
                </div>
            </div>

            {/* Modal for Add/Edit Item */}
            {showModal && (
                <ItemModal
                    item={selectedItem}
                    onClose={closeModal}
                    onSave={(itemData) => {
                        if (selectedItem) {
                            // Edit existing item
                            setItems(items.map(i =>
                                i.id === selectedItem.id ? { ...i, ...itemData } : i
                            ));
                        } else {
                            // Add new item
                            const newItem = {
                                id: Math.max(...items.map(i => i.id)) + 1,
                                ...itemData,
                            };
                            setItems([...items, newItem]);
                        }
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}

function ItemModal({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        type: item?.type || 'Weapon',
        rarity: item?.rarity || RARITY_TYPES.COMMON,
        description: item?.description || '',
        price: item?.price || 0,
        quantity: item?.quantity || 1,
        stats: item?.stats || {}
    });

    const [statKey, setStatKey] = useState('');
    const [statValue, setStatValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const addStat = () => {
        if (statKey.trim() && statValue.trim()) {
            const value = isNaN(statValue) ? statValue : Number(statValue);
            setFormData({
                ...formData,
                stats: { ...formData.stats, [statKey]: value }
            });
            setStatKey('');
            setStatValue('');
        }
    };

    const removeStat = (key) => {
        const { [key]: removed, ...rest } = formData.stats;
        setFormData({ ...formData, stats: rest });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {item ? 'Edit Item' : 'Add New Item'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Weapon">Weapon</option>
                                <option value="Armor">Armor</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Food">Food</option>
                                <option value="Accessory">Accessory</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rarity
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.rarity}
                                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                            >
                                {Object.values(RARITY_TYPES).map(rarity => (
                                    <option key={rarity} value={rarity}>{capitalize(rarity)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Stats */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Stats</h4>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Stat name..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statKey}
                                onChange={(e) => setStatKey(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Value..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statValue}
                                onChange={(e) => setStatValue(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addStat}
                                className="btn-secondary"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(formData.stats).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm">
                                        <span className="font-medium capitalize">{key}:</span> {String(value)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeStat(key)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {item ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
