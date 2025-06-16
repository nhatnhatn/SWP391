@echo off
echo Cleaning up fake/mock data files and code...

echo.
echo Removing mock data file...
del /q "d:\GITHUB\SWP391\mylittlepet\src\data\mockData.js"

echo.
echo Renaming updated component files...
move /y "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\PlayersV2.jsx" "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\Players.jsx"
move /y "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\PetsV2.jsx" "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\Pets.jsx"
move /y "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\ItemsV2.jsx" "d:\GITHUB\SWP391\mylittlepet\src\pages\manager\Items.jsx"
move /y "d:\GITHUB\SWP391\mylittlepet\src\contexts\AuthContextV2Clean.jsx" "d:\GITHUB\SWP391\mylittlepet\src\contexts\AuthContextV2.jsx"

echo.
echo Removing the old AuthContext.jsx file (replaced by AuthContextV2.jsx)...
del /q "d:\GITHUB\SWP391\mylittlepet\src\contexts\AuthContext.jsx"

echo.
echo Clean-up completed successfully!
echo.
echo Please update your imports in App.jsx and other components to use the new files.
echo.
pause
