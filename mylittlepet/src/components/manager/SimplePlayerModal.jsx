// Simple Player Modal Component
// Happy case implementation for Player Create/Edit form

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Coins, Diamond, Gem, Trophy } from 'lucide-react';

const SimplePlayerModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    player, 
    isCreating 
}) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        level: 1,
        coin: 0,
        diamond: 0,
        gem: 0,
        userStatus: 'ACTIVE'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form data when modal opens
    useEffect(() => {
        if (player && !isCreating) {
            setFormData({
                userName: player.userName || '',
                email: player.email || '',
                password: '', // Don't populate password for edit
                level: player.level || 1,
                coin: player.coin || 0,
                diamond: player.diamond || 0,
                gem: player.gem || 0,
                userStatus: player.userStatus || 'ACTIVE'
            });
        } else {
            // Reset form for create
            setFormData({
                userName: '',
                email: '',
                password: '',
                level: 1,
                coin: 0,
                diamond: 0,
                gem: 0,
                userStatus: 'ACTIVE'
            });
        }
        setErrors({});
    }, [player, isCreating, isOpen]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseInt(value) || 0 : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.userName.trim()) {
            newErrors.userName = 'Username is required';
        } else if (formData.userName.trim().length < 3) {
            newErrors.userName = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (isCreating && !formData.password.trim()) {
            newErrors.password = 'Password is required for new players';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.level < 1) {
            newErrors.level = 'Level must be at least 1';
        }

        if (formData.coin < 0) {
            newErrors.coin = 'Coin cannot be negative';
        }

        if (formData.diamond < 0) {
            newErrors.diamond = 'Diamond cannot be negative';
        }

        if (formData.gem < 0) {
            newErrors.gem = 'Gem cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Prepare data to send
            const dataToSend = { ...formData };
            
            // Don't send password if empty (for edit)
            if (!isCreating && !dataToSend.password.trim()) {
                delete dataToSend.password;
            }

            await onSave(dataToSend);
        } catch (error) {
            console.error('Error saving player:', error);
            setErrors({ submit: 'Failed to save player. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isCreating ? 'Create New Player' : 'Edit Player'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* General Error */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 inline mr-1" />
                            Username
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.userName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter username"
                        />
                        {errors.userName && (
                            <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Password {!isCreating && '(leave empty to keep current)'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder={isCreating ? "Enter password" : "Enter new password"}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            Level
                        </label>
                        <input
                            type="number"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            min="1"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.level ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.level && (
                            <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                        )}
                    </div>

                    {/* Currency Section */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Coin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Coins className="w-4 h-4 inline mr-1" />
                                Coin
                            </label>
                            <input
                                type="number"
                                name="coin"
                                value={formData.coin}
                                onChange={handleChange}
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.coin ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.coin && (
                                <p className="text-red-500 text-sm mt-1">{errors.coin}</p>
                            )}
                        </div>

                        {/* Diamond */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Diamond className="w-4 h-4 inline mr-1" />
                                Diamond
                            </label>
                            <input
                                type="number"
                                name="diamond"
                                value={formData.diamond}
                                onChange={handleChange}
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.diamond ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.diamond && (
                                <p className="text-red-500 text-sm mt-1">{errors.diamond}</p>
                            )}
                        </div>

                        {/* Gem */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Gem className="w-4 h-4 inline mr-1" />
                                Gem
                            </label>
                            <input
                                type="number"
                                name="gem"
                                value={formData.gem}
                                onChange={handleChange}
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.gem ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.gem && (
                                <p className="text-red-500 text-sm mt-1">{errors.gem}</p>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="userStatus"
                            value={formData.userStatus}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="BANNED">Banned</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isCreating ? 'Create' : 'Update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimplePlayerModal;
