/**
 * Central export file for all custom hooks
 * This file provides a single point of import for all hooks used in the application
 * 
 * Usage:
 * import { useSimplePets, useSimplePlayers, useNotificationManager } from '../hooks';
 */

// Data management hooks
export { useSimplePets } from './useSimplePets';
export { useSimplePlayers } from './useSimplePlayers';
export { useSimpleShopProducts } from './useSimpleShopProducts';

// UI and utility hooks
export { useNotificationManager } from './useNotificationManager';

// Default export for convenience
export default {
    useSimplePets: () => import('./useSimplePets').then(m => m.useSimplePets),
    useSimplePlayers: () => import('./useSimplePlayers').then(m => m.useSimplePlayers),
    useSimpleShopProducts: () => import('./useSimpleShopProducts').then(m => m.useSimpleShopProducts),
    useNotificationManager: () => import('./useNotificationManager').then(m => m.useNotificationManager)
};
