# MyLittlePet - Cleanup Instructions

This document provides instructions for cleaning up all fake/mock data from the MyLittlePet application and switching to the backend API.

## Summary of Changes

We've created updated versions of all components that used mock data:

1. Created a proper constants file: `src/constants/gameConstants.js`
2. Created updated component versions:
   - `src/pages/manager/PlayersV2.jsx`
   - `src/pages/manager/PetsV2.jsx`
   - `src/pages/manager/ItemsV2.jsx`
   - `src/contexts/AuthContextV2Clean.jsx`
3. Removed fake/mock data from services and authentication

## Cleanup Steps

1. Run the cleanup script to remove old files and rename new ones:
   ```
   d:\GITHUB\SWP391\clean-fake-data.bat
   ```

2. This script will:
   - Delete the mock data file (`src/data/mockData.js`)
   - Rename the updated component files to replace the old ones
   - Remove the old AuthContext.jsx file

3. The updated components now use the backend API exclusively, with no fallback to mock data.

## Additional Information

- The `AuthContextV2.jsx` file is now the only authentication context in the application
- All data is fetched from the backend API using the `dataService.js` and `api.js` services
- Constants have been moved from `mockData.js` to `gameConstants.js`

If you encounter any issues after the cleanup, ensure that:
1. The backend API is running and accessible
2. The API endpoints match the ones expected by the frontend

## Key Files Modified

- `/src/constants/gameConstants.js` (new)
- `/src/pages/manager/Players.jsx`
- `/src/pages/manager/Pets.jsx`
- `/src/pages/manager/Items.jsx`
- `/src/contexts/AuthContextV2.jsx`
- `/src/utils/helpers.js`
- `/src/services/dataService.js`
