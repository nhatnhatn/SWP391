/**
 * ============================================================================================
 * CUSTOM HOOKS CENTRAL EXPORT FILE
 * ============================================================================================
 * 
 * This file provides a centralized export point for all custom hooks used throughout
 * the application. It enables clean, organized imports and better code organization.
 * 
 * Benefits:
 * - Single import source for multiple hooks
 * - Cleaner import statements in components
 * - Better code organization and discoverability
 * - Easier refactoring and maintenance
 * 
 * Usage Examples:
 * import { useSimplePets, useNotificationManager } from '../hooks';
 * import { useSimpleShopProducts } from '../hooks';
 */

// ============================================================================================
// DATA MANAGEMENT HOOKS
// ============================================================================================
// These hooks handle CRUD operations and data state management for different entities

/**
 * Pet Management Hook
 * Handles pet CRUD operations, filtering, searching, and status management
 * Used in: PetManagement.jsx, ShopProductManagement.jsx
 */
export { useSimplePets } from './useSimplePets';

/**
 * Player Management Hook  
 * Handles player CRUD operations, pagination, banning, and statistics
 * Used in: PlayersSimple.jsx
 */
export { useSimplePlayers } from './useSimplePlayers';

/**
 * Shop Product Management Hook
 * Handles shop product CRUD operations, filtering, and shop management
 * Used in: ShopProductManagement.jsx, PetManagement.jsx
 */
export { useSimpleShopProducts } from './useSimpleShopProducts';

// ============================================================================================
// UI AND UTILITY HOOKS
// ============================================================================================
// These hooks provide reusable UI functionality and utilities

/**
 * Notification Management Hook
 * Provides centralized notification system with toast displays and operation handling
 * Used in: ShopProductManagement.jsx, PetManagement.jsx, PlayersSimple.jsx
 */
export { useNotificationManager } from './useNotificationManager';
