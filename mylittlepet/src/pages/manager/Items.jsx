import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, DollarSign, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { mockItems, RARITY_TYPES } from '../../data/mockData';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';

export default function Items() {
    const [items, setItems] = useState(mockItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Toggle expanded state for a specific item
    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const uniqueTypes = [...new Set(items.map(item => item.type))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesRarity && matchesType;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Handle page changes
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Reset expanded state when changing pages
        setExpandedItems({});
    }; const handleDeleteItem = (itemId) => {
        if (window.confirm(t('items.confirmDelete'))) {
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
    };    const getTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'food':
                return '🍞';
            case 'toy':
                return '🧸';
            case 'medicine':
                return '💊';
            case 'accessory':
                return '💍';
            case 'consumable':
                return '🧪';
            case 'material':
                return '⚗️';
            default:
                return '📦';
        }
    };    const getTypeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'food':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'toy':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            case 'medicine':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'accessory':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'consumable':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'material':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };    const getTypeIconBg = (type) => {
        switch (type.toLowerCase()) {
            case 'food':
                return 'bg-yellow-200';
            case 'toy':
                return 'bg-pink-200';
            case 'medicine':
                return 'bg-green-200';
            case 'accessory':
                return 'bg-purple-200';
            case 'consumable':
                return 'bg-blue-200';
            case 'material':
                return 'bg-gray-200';
            default:
                return 'bg-gray-200';
        }
    };

    return (
        <div>            <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('items.management')}</h1>
                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('items.addItem')}
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('items.searchItems')}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>                    <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                >
                    <option value="all">{t('pets.allRarities')}</option>
                    {Object.values(RARITY_TYPES).map(rarity => (
                        <option key={rarity} value={rarity}>{t(`rarities.${rarity}`)}</option>
                    ))}
                </select>                <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">{t('items.allTypes')}</option>
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>
                            {getTypeIcon(type)} {t(`itemTypes.${type.toLowerCase()}`) || type}
                        </option>
                    ))}
                </select>
            </div>
        </div>

            {/* Items Table - modify to use currentItems instead of filteredItems */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('items.item')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.type')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.rarity')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.price')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.quantity')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${getTypeIconBg(item.type)}`}>
                                                <span className="text-xl">{getTypeIcon(item.type)}</span>
                                            </div>                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            </div>
                                        </div>
                                    </td><td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(item.type)}`}>
                                                <span className="mr-1">{getTypeIcon(item.type)}</span>
                                                {t(`itemTypes.${item.type.toLowerCase()}`) || item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRarityClass(item.rarity)}`}
                                                style={{ color: getRarityColor(item.rarity) }}
                                            >
                                                {t(`rarities.${item.rarity}`)}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">                                            <div className="flex space-x-3 justify-center">
                                            <button
                                                onClick={() => toggleExpanded(item.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title={expandedItems[item.id] ? t('common.hideDetails') : t('common.showDetails')}
                                            >
                                                {expandedItems[item.id] ?
                                                    <EyeOff className="h-4 w-4" /> :
                                                    <Eye className="h-4 w-4" />
                                                }
                                            </button>
                                            <button
                                                onClick={() => openModal(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title={t('items.editItem')}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                            {/* Display expanded item details */}
                                            {expandedItems[item.id] && (<div className="mt-2 text-left animate-fadeIn">
                                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                                    {/* Description */}
                                                    <div className="mb-3">
                                                        <span className="block mb-1 font-bold text-xs">{t('common.description')}:</span>
                                                        <p className="text-xs text-gray-700">{item.description}</p>
                                                    </div>

                                                    <div>
                                                        <span className="block mb-1 font-bold text-xs">{t('common.stats')}:</span>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {Object.entries(item.stats).map(([key, value]) => (
                                                                <div key={key} className="text-xs">
                                                                    <span className="capitalize font-medium">{key}:</span>{" "}
                                                                    <span>{typeof value === 'boolean' ? (value ? t('common.yes') : t('common.no')) : value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {item.effects && (
                                                        <div className="mt-2">
                                                            <span className="block mb-1 font-bold text-xs">{t('common.effects')}:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(item.effects).map(([key, value]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                                                    >
                                                                        {key}: +{value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('items.noItemsFound')}</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {t('items.noItemsFoundMessage')}
                                    </p>
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Pagination Controls */}
            {filteredItems.length > itemsPerPage && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show limited page buttons with ellipsis for many pages
                        if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={i}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        } else if (
                            (pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                            return <span key={i} className="px-1">...</span>;
                        } else {
                            return null;
                        }
                    })}

                    <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}            {/* Summary Cards - keep these after pagination */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalItems')}</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatNumber(items.length)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalQuantity')}</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatNumber(items.reduce((sum, item) => sum + item.quantity, 0))}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalValue')}</h3>
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

function ItemModal({ item, onClose, onSave }) {    const [formData, setFormData] = useState({
        name: item?.name || '',
        type: item?.type || 'Food',
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">                <h3 className="text-lg font-medium text-gray-900 mb-4">
                {item ? t('items.editItem') : t('items.addNewItem')}
            </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.name')}
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
                                {t('common.type')}
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}                            >
                                <option value="Food">{t('itemTypes.food')}</option>
                                <option value="Toy">{t('itemTypes.toy')}</option>
                                <option value="Medicine">{t('itemTypes.medicine')}</option>
                                <option value="Accessory">{t('itemTypes.accessory')}</option>
                                <option value="Consumable">{t('itemTypes.consumable')}</option>
                                <option value="Material">{t('itemTypes.material')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.rarity')}
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.rarity}
                                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                            >
                                {Object.values(RARITY_TYPES).map(rarity => (
                                    <option key={rarity} value={rarity}>{t(`rarities.${rarity}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.price')}
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
                                {t('common.quantity')}
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
                    </div>                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('common.description')}
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('common.stats')}</h4>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder={t('items.statName')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statKey}
                                onChange={(e) => setStatKey(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder={t('items.value')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statValue}
                                onChange={(e) => setStatValue(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addStat}
                                className="btn-secondary"
                            >                                {t('common.add')}
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
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {item ? t('common.update') : t('common.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
