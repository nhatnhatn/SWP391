import React from 'react';

const ClearSessionButton = () => {
    const clearSession = () => {
        // Clear all auth-related localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('lastActivity');

        // Reload page to trigger fresh auth check
        window.location.reload();

        console.log('🧹 Session cleared and page reloaded');
    };

    return (
        <button
            onClick={clearSession}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            title="Clear session and reload page"
        >
            🧹 Clear Session
        </button>
    );
};

export default ClearSessionButton;
