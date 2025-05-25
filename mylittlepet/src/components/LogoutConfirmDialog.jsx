import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmDialog({ isOpen, onClose, onConfirm }) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/25" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="max-w-md w-full bg-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                            Confirm Logout
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-700">
                                    Are you sure you want to log out of the admin dashboard?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}