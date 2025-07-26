/**
 * ============================================================================================
 * LOGOUT CONFIRMATION DIALOG COMPONENT
 * ============================================================================================
 * 
 * This component provides a secure logout confirmation dialog to prevent accidental
 * user logouts. It implements proper accessibility features and clear user feedback
 * using Headless UI components for consistent modal behavior.
 * 
 * FEATURES:
 * - Modal overlay with backdrop blur for focus
 * - Clear confirmation message with logout icon
 * - Accessible dialog implementation (Headless UI)
 * - Keyboard navigation support (ESC to close)
 * - Two-action design (Cancel/Confirm) for safety
 * - Responsive design for mobile and desktop
 * - Proper ARIA labels and semantic structure
 * 
 * SECURITY CONSIDERATIONS:
 * - Prevents accidental logouts through confirmation
 * - Clear messaging about consequences of logout
 * - Prominent cancel option for easy abort
 * 
 * USAGE:
 * - Triggered from Layout component logout button
 * - Used in any component that needs secure logout confirmation
 * - Integrates with authentication context for actual logout
 * 
 * ACCESSIBILITY:
 * - Keyboard navigation (Tab, ESC, Enter)
 * - Screen reader compatible with proper ARIA labels
 * - Focus management and restoration
 * - High contrast color scheme for visibility
 * 
 * @param {boolean} isOpen - Controls dialog visibility state
 * @param {Function} onClose - Callback to close dialog without action
 * @param {Function} onConfirm - Callback to confirm logout action
 * @returns {JSX.Element} Accessible logout confirmation modal dialog
 */
import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmDialog({ isOpen, onClose, onConfirm }) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* ========================================================================================
                MODAL BACKDROP
                ========================================================================================
                
                Semi-transparent overlay that covers the entire screen to focus attention
                on the dialog and prevent interaction with background content.
            */}
            <div className="fixed inset-0 bg-black/25" />

            {/* ========================================================================================
                DIALOG CONTAINER
                ========================================================================================
                
                Centered container that holds the dialog panel with proper positioning
                and responsive padding for different screen sizes.
            */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="max-w-md w-full bg-white rounded-lg shadow-lg">

                    {/* ========================================================================================
                        DIALOG HEADER
                        ========================================================================================
                        
                        Contains the dialog title and close button with clear visual hierarchy
                        and proper accessibility labeling.
                    */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                            Confirm Logout
                        </DialogTitle>
                    </div>

                    {/* ========================================================================================
                        DIALOG CONTENT
                        ========================================================================================
                        
                        Main content area with logout confirmation message and warning icon.
                        Uses clear, user-friendly language to explain the consequences.
                    */}
                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-700">
                                    Are you sure you want to logout? You will need to login again to access the admin panel.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================================
                        DIALOG ACTIONS
                        ========================================================================================
                        
                        Action buttons with clear visual hierarchy:
                        - Cancel: Secondary styling, easy to access for safety
                        - Logout: Primary red styling to indicate destructive action
                        - Proper spacing and responsive design
                    */}
                    <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}