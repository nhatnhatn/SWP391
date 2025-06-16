import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';
import { usePets } from '../../hooks/useData';
import { RARITY_TYPES, PET_TYPES } from '../../constants/gameConstants';

export default function Pets() {
    // Use pets hook to fetch data from backend
    const {
        pets: backendPets,
        loading,
        error,
        pagination,
        fetchPets,
        searchPets,
        updatePet,
        deletePet
    } = usePets();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [expandedPets, setExpandedPets] = useState({});

    // Load data from backend when component mounts
    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    // Handle search with backend
    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term.trim()) {
            searchPets(term);
        } else {
            fetchPets();
        }
    };

    // Filter pets locally by rarity and type
    const filteredPets = backendPets?.filter(pet => {
        const matchesRarity = rarityFilter === 'all' || pet.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || pet.type === typeFilter;
        return matchesRarity && matchesType;
    }) || [];

    // Get unique pet types for filter dropdown
    const uniqueTypes = [...new Set((backendPets || []).map(pet => pet.type))];

    // Pagination data from backend
    const apiTotalPages = pagination?.totalPages || 1;
    const apiCurrentPage = pagination?.page !== undefined ? pagination.page + 1 : 1; // API returns 0-based index

    const handlePageChange = (page) => {
        fetchPets(page - 1); // Convert to 0-based for API
        setExpandedPets({});
    };

    const handleDeletePet = async (petId) => {
        if (window.confirm(t('pets.confirmDelete'))) {
            try {
                await deletePet(petId);
                // Backend data will be refreshed by fetchPets after delete
            } catch (error) {
                console.error('Failed to delete pet:', error);
            }
        }
    };

    const openModal = (pet = null) => {
        setSelectedPet(pet);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPet(null);
    };

    // Toggle expanded state for a specific pet
    const toggleExpanded = (petId) => {
        setExpandedPets(prev => ({
            ...prev,
            [petId]: !prev[petId]
        }));
    };

    if (loading && !backendPets?.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !backendPets?.length) {
        return (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
                <p>Error loading pets: {error}</p>
                <button
                    onClick={() => fetchPets()}
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
                    <h1 className="text-2xl font-bold text-gray-900">{t('pets.management')}</h1>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('pets.addPet')}
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('pets.searchPets')}
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
                        <option value="all">{t('pets.allRarities')}</option>
                        {Object.values(RARITY_TYPES).map(rarity => (
                            <option key={rarity} value={rarity}>{t(`rarities.${rarity.toLowerCase()}`)}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">{t('pets.allTypes')}</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{t(`petTypes.${type.toLowerCase()}`) || type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredPets.length > 0 ? (
                    filteredPets.map(pet => (
                        <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className={`${getRarityClass(pet.rarity)} h-2`}></div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                                        <p className="text-sm text-gray-600">{t(`petTypes.${pet.type.toLowerCase()}`) || pet.type}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${getRarityColor(pet.rarity)}25`, color: getRarityColor(pet.rarity) }}>
                                        {t(`rarities.${pet.rarity.toLowerCase()}`)}
                                    </span>
                                </div>

                                <div className="flex items-center mb-4">
                                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${(pet.health / pet.maxHealth) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">{pet.health}/{pet.maxHealth}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('pets.level')}</p>
                                        <p className="font-medium">{pet.level}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('pets.happiness')}</p>
                                        <p className="font-medium">{pet.happiness}/100</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('pets.energy')}</p>
                                        <p className="font-medium">{pet.energy}/100</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-500">{t('pets.hunger')}</p>
                                        <p className="font-medium">{pet.hunger}/100</p>
                                    </div>
                                </div>

                                {/* Expand/Collapse button */}
                                <button
                                    onClick={() => toggleExpanded(pet.id)}
                                    className="w-full flex justify-center items-center text-gray-500 hover:text-gray-700 py-2 border-t"
                                >
                                    {expandedPets[pet.id] ? (
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
                                {expandedPets[pet.id] && (
                                    <div className="pt-4 border-t mt-2">
                                        <h4 className="font-medium text-gray-900 mb-2">{t('pets.stats')}</h4>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('pets.attack')}</p>
                                                <p className="font-medium">{pet.attack}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('pets.defense')}</p>
                                                <p className="font-medium">{pet.defense}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('pets.speed')}</p>
                                                <p className="font-medium">{pet.speed}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">{t('pets.intelligence')}</p>
                                                <p className="font-medium">{pet.intelligence}</p>
                                            </div>
                                        </div>

                                        <h4 className="font-medium text-gray-900 mb-2">{t('pets.description')}</h4>
                                        <p className="text-gray-600 text-sm mb-4">{pet.description}</p>

                                        <h4 className="font-medium text-gray-900 mb-2">{t('pets.abilities')}</h4>
                                        {pet.abilities && pet.abilities.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                                                {pet.abilities.map((ability, index) => (
                                                    <li key={index}>{ability}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-sm mb-4">{t('pets.noAbilities')}</p>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <button
                                                onClick={() => openModal(pet)}
                                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 py-1 px-3 rounded-md flex items-center text-sm"
                                            >
                                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePet(pet.id)}
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
                        <p className="text-gray-500 mb-4">{t('pets.noPetsFound')}</p>
                        <button
                            onClick={() => openModal()}
                            className="btn-primary inline-flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('pets.addPet')}
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredPets.length > 0 && (
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

            {/* Add/Edit Pet Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedPet ? t('pets.editPet') : t('pets.addPet')}
                        </h2>

                        {/* Pet form would go here */}
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
                                {selectedPet ? t('common.save') : t('common.create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
