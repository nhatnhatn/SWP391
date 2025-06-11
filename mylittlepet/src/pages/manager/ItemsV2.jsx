import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, DollarSign, ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw, ShoppingCart } from 'lucide-react';
import { useItems } from '../../hooks/useData';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';

const RARITY_TYPES = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

const ITEM_TYPES = {
    FOOD: 'food',
    TOY: 'toy',
    MEDICINE: 'medicine',
    ACCESSORY: 'accessory',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material'
};

export default function ItemsV2() {
    const {
        items,
        loading,
        error,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        refreshItems,
        createItem,
        updateItem,
        deleteItem,
        purchaseItem
    } = useItems();

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    // Toggle expanded state for a specific item
    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm(t('items.confirmDelete'))) {
            try {
                await deleteItem(itemId);
            } catch (err) {
                console.error('Failed to delete item:', err);
            }
        }
    };

    const handlePurchaseItem = async (itemId, quantity = 1) => {
        try {
            await purchaseItem(itemId, quantity);
        } catch (err) {
            console.error('Failed to purchase item:', err);
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
        switch (type?.toLowerCase()) {
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
    };

    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
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
    };

    const getTypeIconBg = (type) => {
        switch (type?.toLowerCase()) {
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

    const uniqueTypes = [...new Set(items.map(item => item.type))];

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{t('items.management')}</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={refreshItems}
                            disabled={loading}
                            className="btn-secondary flex items-center"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="btn-primary flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('items.addItem')}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

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
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters?.rarity || 'all'}
                        onChange={(e) => setFilters({ ...filters, rarity: e.target.value === 'all' ? null : e.target.value })}
                    >
                        <option value="all">{t('pets.allRarities')}</option>
                        {Object.values(RARITY_TYPES).map(rarity => (
                            <option key={rarity} value={rarity}>{t(`rarities.${rarity}`)}</option>
                        ))}
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters?.type || 'all'}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value === 'all' ? null : e.target.value })}
                    >
                        <option value="all">{t('items.allTypes')}</option>
                        {Object.values(ITEM_TYPES).map(type => (
                            <option key={type} value={type}>
                                {getTypeIcon(type)} {t(`itemTypes.${type}`) || type}
                            </option>
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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                            <span className="text-gray-500">{t('common.loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${getTypeIconBg(item.type)}`}>
                                                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(item.type)}`}>
                                                <span className="mr-1">{getTypeIcon(item.type)}</span>
                                                {t(`itemTypes.${item.type?.toLowerCase()}`) || item.type}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3 justify-center">
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
                                                    onClick={() => handlePurchaseItem(item.id, 1)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title={t('items.purchaseItem')}
                                                    disabled={item.quantity === 0}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
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
                                            {expandedItems[item.id] && (
                                                <div className="mt-2 text-left animate-fadeIn">
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                                        {/* Description */}
                                                        <div className="mb-3">
                                                            <span className="block mb-1 font-bold text-xs">{t('common.description')}:</span>
                                                            <p className="text-xs text-gray-700">{item.description}</p>
                                                        </div>

                                                        {item.effects && Object.keys(item.effects).length > 0 && (
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
                            ) : (
                                <tr>
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

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                        {t('common.showing')} {((pagination.currentPage - 1) * pagination.pageSize) + 1} {t('common.to')} {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} {t('common.of')} {pagination.totalElements} {t('common.results')}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.currentPage - 1) })}
                            disabled={pagination.currentPage === 1}
                            className={`p-2 rounded-md ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 ||
                                pageNum === pagination.totalPages ||
                                (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setFilters({ ...filters, page: pageNum })}
                                        className={`px-3 py-1 rounded-md ${pagination.currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                (pageNum === 2 && pagination.currentPage > 3) ||
                                (pageNum === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                            ) {
                                return <span key={i} className="px-1">...</span>;
                            } else {
                                return null;
                            }
                        })}

                        <button
                            onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className={`p-2 rounded-md ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalItems')}</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatNumber(pagination?.totalElements || items.length)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalQuantity')}</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatNumber(items.reduce((sum, item) => sum + (item.quantity || 0), 0))}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('items.totalValue')}</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        ${formatNumber(items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0))}
                    </p>
                </div>
            </div>

            {/* Modal for Add/Edit Item */}
            {showModal && (
                <ItemModal
                    item={selectedItem}
                    onClose={closeModal}
                    onSave={async (itemData) => {
                        try {
                            if (selectedItem) {
                                await updateItem(selectedItem.id, itemData);
                            } else {
                                await createItem(itemData);
                            }
                            closeModal();
                        } catch (err) {
                            console.error('Failed to save item:', err);
                        }
                    }}
                />
            )}
        </div>
    );
}

function ItemModal({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        type: item?.type || 'food',
        rarity: item?.rarity || RARITY_TYPES.COMMON,
        description: item?.description || '',
        price: item?.price || 0,
        quantity: item?.quantity || 1,
        effects: item?.effects || {}
    });

    const [effectKey, setEffectKey] = useState('');
    const [effectValue, setEffectValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const addEffect = () => {
        if (effectKey.trim() && effectValue.trim()) {
            const value = isNaN(effectValue) ? effectValue : Number(effectValue);
            setFormData({
                ...formData,
                effects: { ...formData.effects, [effectKey]: value }
            });
            setEffectKey('');
            setEffectValue('');
        }
    };

    const removeEffect = (key) => {
        const { [key]: removed, ...rest } = formData.effects;
        setFormData({ ...formData, effects: rest });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {Object.values(ITEM_TYPES).map(type => (
                                    <option key={type} value={type}>{t(`itemTypes.${type}`)}</option>
                                ))}
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
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
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
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>

                    <div>
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

                    {/* Effects */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('common.effects')}</h4>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder={t('items.effectName')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={effectKey}
                                onChange={(e) => setEffectKey(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder={t('items.value')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={effectValue}
                                onChange={(e) => setEffectValue(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addEffect}
                                className="btn-secondary"
                            >
                                {t('common.add')}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(formData.effects).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm">
                                        <span className="font-medium capitalize">{key}:</span> {String(value)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeEffect(key)}
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
