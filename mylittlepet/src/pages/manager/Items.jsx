import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, DollarSign, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';
import { useItems } from '../../hooks/useData';
import { RARITY_TYPES, ITEM_TYPES } from '../../constants/gameConstants';

export default function Items() {
    // Use items hook to fetch data from backend
    const {
        items: backendItems,
        loading,
        error,
        pagination,
        fetchItems,
        searchItems,
        updateItem,
        deleteItem
    } = useItems();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    // Load data from backend when component mounts
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Handle search with backend
    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term.trim()) {
            searchItems(term);
        } else {
            fetchItems();
        }
    };

    // Filter items locally by rarity and type
    const filteredItems = backendItems?.filter(item => {
        const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesRarity && matchesType;
    }) || [];

    // Get unique item types for filter dropdown
    const uniqueTypes = [...new Set((backendItems || []).map(item => item.type))];

    // Pagination data from backend
    const apiTotalPages = pagination?.totalPages || 1;
    const apiCurrentPage = pagination?.page !== undefined ? pagination.page + 1 : 1; // API returns 0-based index

    const handlePageChange = (page) => {
        fetchItems(page - 1); // Convert to 0-based for API
        setExpandedItems({});
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm(t('items.confirmDelete'))) {
            try {
                await deleteItem(itemId);
                // Backend data will be refreshed by fetchItems after delete
            } catch (error) {
                console.error('Failed to delete item:', error);
            }
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

    // Toggle expanded state for a specific item
    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Helper functions for UI display
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

    if (loading && !backendItems?.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !backendItems?.length) {
        return (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
                <p>Error loading items: {error}</p>
                <button
                    onClick={() => fetchItems()}
                    className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
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
                            onChange={handleSearch}
                        />
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={rarityFilter}
                        onChange={(e) => setRarityFilter(e.target.value)}
                    >
                        <option value="all">{t('items.allRarities')}</option>
                        {Object.values(RARITY_TYPES).map(rarity => (
                            <option key={rarity} value={rarity}>{t(`rarities.${rarity.toLowerCase()}`)}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">{t('items.allTypes')}</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{t(`itemTypes.${type.toLowerCase()}`) || type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className={`${getRarityClass(item.rarity)} h-2`}></div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className={`${getTypeIconBg(item.type)} p-2 rounded-lg mr-3`}>
                                            <span className="text-lg">{getTypeIcon(item.type)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <div className="flex items-center mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                                    {t(`itemTypes.${item.type?.toLowerCase()}`) || item.type}
                                                </span>
                                                <span className="mx-2 text-gray-300">•</span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${getRarityColor(item.rarity)}25`, color: getRarityColor(item.rarity) }}>
                                                    {t(`rarities.${item.rarity?.toLowerCase()}`)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('items.price')}</p>
                                        <div className="font-medium flex items-center">
                                            <DollarSign className="h-3.5 w-3.5 text-green-600 mr-1" />
                                            {formatNumber(item.price)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('items.stock')}</p>
                                        <div className="font-medium flex items-center">
                                            <Package className="h-3.5 w-3.5 text-blue-600 mr-1" />
                                            {formatNumber(item.stock)}
                                        </div>
                                    </div>
                                </div>

                                {/* Expand/Collapse button */}
                                <button
                                    onClick={() => toggleExpanded(item.id)}
                                    className="w-full flex justify-center items-center text-gray-500 hover:text-gray-700 py-2 border-t"
                                >
                                    {expandedItems[item.id] ? (
                                        <>
                                            <EyeOff className="h-4 w-4 mr-1" />
                                            {t('common.showLess')}
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4 mr-1" />
                                            {t('common.showMore')}
                                        </>
                                    )}
                                </button>

                                {/* Expanded content */}
                                {expandedItems[item.id] && (
                                    <div className="pt-4 border-t mt-2">
                                        <h4 className="font-medium text-gray-900 mb-2">{t('items.effects')}</h4>
                                        {item.effects && item.effects.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                                                {item.effects.map((effect, index) => (
                                                    <li key={index}>{effect}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-sm mb-4">{t('items.noEffects')}</p>
                                        )}

                                        <h4 className="font-medium text-gray-900 mb-2">{t('items.usageInfo')}</h4>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('items.usageLimit')}</p>
                                                <p className="font-medium">{item.usageLimit || t('items.unlimited')}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('items.cooldown')}</p>
                                                <p className="font-medium">{item.cooldown ? `${item.cooldown}s` : t('items.none')}</p>
                                            </div>
                                        </div>

                                        {item.requirements && (
                                            <>
                                                <h4 className="font-medium text-gray-900 mb-2">{t('items.requirements')}</h4>
                                                <p className="text-sm text-gray-600 mb-4">{item.requirements}</p>
                                            </>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 py-1 px-3 rounded-md flex items-center text-sm"
                                            >
                                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="bg-red-100 text-red-600 hover:bg-red-200 py-1 px-3 rounded-md flex items-center text-sm"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                {t('common.delete')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500 mb-4">{t('items.noItemsFound')}</p>
                        <button
                            onClick={() => openModal()}
                            className="btn-primary inline-flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('items.addItem')}
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredItems.length > 0 && (
                <div className="flex justify-center mb-8">
                    <nav className="flex items-center">
                        <button
                            onClick={() => handlePageChange(apiCurrentPage - 1)}
                            disabled={apiCurrentPage <= 1}
                            className={`px-3 py-1 rounded-l-md border ${apiCurrentPage <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {[...Array(apiTotalPages).keys()].map((page) => {
                            const pageNumber = page + 1;
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`px-3 py-1 border-t border-b ${apiCurrentPage === pageNumber ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(apiCurrentPage + 1)}
                            disabled={apiCurrentPage >= apiTotalPages}
                            className={`px-3 py-1 rounded-r-md border ${apiCurrentPage >= apiTotalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            )}

            {/* Add/Edit Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedItem ? t('items.editItem') : t('items.addItem')}
                        </h2>

                        {/* Item form would go here */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md mr-2"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
                            >
                                {selectedItem ? t('common.save') : t('common.create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
