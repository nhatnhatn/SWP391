@echo off
REM Script to remove My_Little_Pet_V3 database
REM Update the password below with your actual SQL Server password

echo ========================================
echo My Little Pet V3 Database Removal
echo ========================================
echo.

REM Prompt for password (more secure)
set /p SQL_PASSWORD="Enter SQL Server password for 'sa' user: "

echo Attempting to drop database My_Little_Pet_V3...
echo.

REM First, kill any existing connections to the database
sqlcmd -S localhost -U sa -P %SQL_PASSWORD% -Q "ALTER DATABASE My_Little_Pet_V3 SET SINGLE_USER WITH ROLLBACK IMMEDIATE" 2>nul

REM Drop the database
sqlcmd -S localhost -U sa -P %SQL_PASSWORD% -Q "DROP DATABASE IF EXISTS My_Little_Pet_V3"

if %ERRORLEVEL% equ 0 (
    echo ✓ Database My_Little_Pet_V3 has been successfully removed!
) else (
    echo ✗ Failed to remove database. Please check:
    echo   1. SQL Server is running
    echo   2. Password is correct
    echo   3. You have sufficient permissions
    echo   4. No active connections to the database
)

echo.
pause
