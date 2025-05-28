import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { mockPets, RARITY_TYPES, PET_TYPES } from '../../data/mockData';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../../utils/helpers';
import { t } from '../../constants/vietnamese';

export default function Pets() {
    const [pets, setPets] = useState(mockPets);
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [expandedPets, setExpandedPets] = useState({});
    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const petsPerPage = 6;

    const uniqueTypes = [...new Set(pets.map(pet => pet.type))];

    const filteredPets = pets.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = rarityFilter === 'all' || pet.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || pet.type === typeFilter;
        return matchesSearch && matchesRarity && matchesType;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);
    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

    // Handle page changes
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Reset expanded state when changing pages
        setExpandedPets({});
    }; const handleDeletePet = (petId) => {
        if (window.confirm(t('pets.confirmDelete'))) {
            setPets(pets.filter(pet => pet.id !== petId));
        }
    };

    const openModal = (pet = null) => {
        setSelectedPet(pet);
        setShowModal(true);
    }; const closeModal = () => {
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

    return (
        <div>            <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('pets.management')}</h1>
                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('pets.addPet')}
                </button>
            </div>                {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('pets.searchPets')}
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
                    <option value="all">{t('pets.allRarities')}</option>
                    {Object.values(RARITY_TYPES).map(rarity => (
                        <option key={rarity} value={rarity}>{t(`rarities.${rarity}`)}</option>
                    ))}
                </select>

                <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">{t('pets.allTypes')}</option>
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
        </div>

            {/* Replace Grid with Table Layout */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rarity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Level
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Owner
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentPets.length > 0 ? (
                            currentPets.map((pet) => (
                                <tr key={pet.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pet.type}
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex text-xs font-medium px-2 py-1 rounded-full border ${getRarityClass(pet.rarity)}`}
                                            style={{ color: getRarityColor(pet.rarity) }}
                                        >
                                            {t(`rarities.${pet.rarity}`)}
                                        </span>
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pet.level}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getOwnerName(pet.ownerId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => toggleExpanded(pet.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title={expandedPets[pet.id] ? "Hide Details" : "Show Details"}
                                            >
                                                {expandedPets[pet.id] ?
                                                    <EyeOff className="h-4 w-4" /> :
                                                    <Eye className="h-4 w-4" />
                                                }
                                            </button>
                                            <button
                                                onClick={() => openModal(pet)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit Pet"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePet(pet.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete Pet"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Display expanded pet details below */}
                                        {expandedPets[pet.id] && (
                                            <div className="mt-2 text-left animate-fadeIn">
                                                <span className="block mb-1 font-bold">{t('common.stats')}:</span>
                                                <div className="flex space-x-4">
                                                    <span>{t('pets.hp')}: <span className="font-medium">{formatNumber(pet.stats.hp)}</span></span>
                                                    <span>{t('pets.attack')}: <span className="font-medium">{formatNumber(pet.stats.attack)}</span></span>
                                                    <span>{t('pets.defense')}: <span className="font-medium">{formatNumber(pet.stats.defense)}</span></span>
                                                    <span>{t('pets.speed')}: <span className="font-medium">{formatNumber(pet.stats.speed)}</span></span>
                                                </div>                                                <div className="mt-4">
                                                    <span className="block mb-1 font-bold">{t('pets.abilities')}:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {pet.abilities.map((ability, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                                            >
                                                                {ability}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center"> {/* Updated colspan from 7 to 6 */}
                                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pets found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No pets match your current filter criteria.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Pagination Controls */}
            {filteredPets.length > petsPerPage && (
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
            )}

            {/* Modal for Add/Edit Pet */}
            {showModal && (
                <PetModal
                    pet={selectedPet}
                    onClose={closeModal}
                    onSave={(petData) => {
                        if (selectedPet) {
                            // Edit existing pet
                            setPets(pets.map(p =>
                                p.id === selectedPet.id ? { ...p, ...petData } : p
                            ));
                        } else {
                            // Add new pet
                            const newPet = {
                                id: Math.max(...pets.map(p => p.id)) + 1,
                                ...petData,
                            };
                            setPets([...pets, newPet]);
                        }
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}

function PetModal({ pet, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: pet?.name || '',
        type: pet?.type || '',
        rarity: pet?.rarity || RARITY_TYPES.COMMON,
        level: pet?.level || 1,
        stats: {
            hp: pet?.stats?.hp || 100,
            attack: pet?.stats?.attack || 50,
            defense: pet?.stats?.defense || 30,
            speed: pet?.stats?.speed || 40
        },
        abilities: pet?.abilities || []
    });

    const [newAbility, setNewAbility] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const addAbility = () => {
        if (newAbility.trim() && !formData.abilities.includes(newAbility.trim())) {
            setFormData({
                ...formData,
                abilities: [...formData.abilities, newAbility.trim()]
            });
            setNewAbility('');
        }
    };

    const removeAbility = (index) => {
        setFormData({
            ...formData,
            abilities: formData.abilities.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {pet ? t('pets.editPet') : t('pets.addNewPet')}
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
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
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
                            Level
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.ownerId}
                            onChange={(e) => setFormData({ ...formData, ownerId: parseInt(e.target.value) })}
                            required
                        >
                            <option value="">Select Owner</option>
                            {mockPlayers.map(player => (
                                <option key={player.id} value={player.id}>{player.username}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('common.stats')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('pets.hp')}</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.stats.hp}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, hp: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('pets.attack')}</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.stats.attack}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, attack: parseInt(e.target.value) }
                                })}
                            />
                        </div>                            <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('pets.defense')}</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.stats.defense}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, defense: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('pets.speed')}</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.stats.speed}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, speed: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                </div>                    {/* Abilities */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('pets.abilities')}</h4>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder={t('pets.addAbilityPlaceholder')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={newAbility}
                            onChange={(e) => setNewAbility(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAbility())}
                        />
                        <button
                            type="button"
                            onClick={addAbility}
                            className="btn-secondary"
                        >
                            {t('pets.addAbility')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.abilities.map((ability, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                            >
                                {ability}
                                <button
                                    type="button"
                                    onClick={() => removeAbility(index)}
                                    className="ml-1 text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>                    <div className="flex justify-end space-x-3 pt-4">
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
                        {pet ? t('common.update') : t('common.create')}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
}