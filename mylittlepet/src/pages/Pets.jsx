import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Heart } from 'lucide-react';
import { mockPets, mockPlayers, RARITY_TYPES } from '../data/mockData';
import { getRarityColor, getRarityClass, capitalize, formatNumber } from '../utils/helpers';

export default function Pets() {
    const [pets, setPets] = useState(mockPets);
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const uniqueTypes = [...new Set(pets.map(pet => pet.type))];

    const filteredPets = pets.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = rarityFilter === 'all' || pet.rarity === rarityFilter;
        const matchesType = typeFilter === 'all' || pet.type === typeFilter;
        return matchesSearch && matchesRarity && matchesType;
    });

    const handleDeletePet = (petId) => {
        if (window.confirm('Are you sure you want to delete this pet?')) {
            setPets(pets.filter(pet => pet.id !== petId));
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

    const getOwnerName = (ownerId) => {
        const owner = mockPlayers.find(player => player.id === ownerId);
        return owner ? owner.username : 'Unknown';
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Pets Management</h1>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Pet
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search pets..."
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

            {/* Pets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{pet.name}</h3>
                                <div className="flex space-x-1">
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
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Type:</span>
                                    <span className="text-sm font-medium text-gray-900">{pet.type}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Level:</span>
                                    <span className="text-sm font-medium text-gray-900">{pet.level}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Rarity:</span>
                                    <span
                                        className={`text-sm font-medium px-2 py-1 rounded-full border ${getRarityClass(pet.rarity)}`}
                                        style={{ color: getRarityColor(pet.rarity) }}
                                    >
                                        {capitalize(pet.rarity)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Owner:</span>
                                    <span className="text-sm font-medium text-gray-900">{getOwnerName(pet.ownerId)}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Stats</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">HP:</span>
                                        <span className="font-medium">{formatNumber(pet.stats.hp)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ATK:</span>
                                        <span className="font-medium">{formatNumber(pet.stats.attack)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">DEF:</span>
                                        <span className="font-medium">{formatNumber(pet.stats.defense)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">SPD:</span>
                                        <span className="font-medium">{formatNumber(pet.stats.speed)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Abilities */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Abilities</h4>
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
                    </div>
                ))}
            </div>

            {filteredPets.length === 0 && (
                <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pets found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No pets match your current filter criteria.
                    </p>
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
        ownerId: pet?.ownerId || '',
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {pet ? 'Edit Pet' : 'Add New Pet'}
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Stats</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">HP</label>
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
                                <label className="block text-xs text-gray-500 mb-1">Attack</label>
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
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Defense</label>
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
                                <label className="block text-xs text-gray-500 mb-1">Speed</label>
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
                    </div>

                    {/* Abilities */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Abilities</h4>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Add ability..."
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
                                Add
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
                            {pet ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}