@echo off
REM Database Setup Script for My Little Pet V3
REM This script creates the SQL Server database and runs the schema

echo ========================================
echo My Little Pet V3 Database Setup
echo ========================================
echo.

REM Check if SQL Server is accessible
echo Checking SQL Server connection...
sqlcmd -S localhost -U sa -P yourpassword -Q "SELECT @@VERSION" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cannot connect to SQL Server!
    echo Please make sure:
    echo 1. SQL Server is running
    echo 2. The password is correct (default: yourpassword)
    echo 3. SQL Server Authentication is enabled
    echo.
    pause
    exit /b 1
)

echo ✓ SQL Server connection successful!
echo.

REM Create database
echo Creating database My_Little_Pet_V3...
sqlcmd -S localhost -U sa -P yourpassword -Q "CREATE DATABASE My_Little_Pet_V3"
if %ERRORLEVEL% neq 0 (
    echo WARNING: Database creation failed (may already exist)
    echo Continuing with schema setup...
) else (
    echo ✓ Database created successfully!
)
echo.

REM Run schema script
echo Running database schema...
sqlcmd -S localhost -U sa -P yourpassword -d My_Little_Pet_V3 -i "src/main/resources/database/MyLittlePet_v3.sql"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Schema creation failed!
    pause
    exit /b 1
)
echo ✓ Schema created successfully!
echo.

REM Ask if user wants to insert sample data
set /p SAMPLE_DATA="Do you want to insert sample data? (y/n): "
if /i "%SAMPLE_DATA%"=="y" (
    echo Running sample data script...
    sqlcmd -S localhost -U sa -P yourpassword -d My_Little_Pet_V3 -i "src/main/resources/database/sample_data.sql"
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Sample data insertion failed!
        pause
        exit /b 1
    )
    echo ✓ Sample data inserted successfully!
) else (
    echo Skipping sample data insertion.
)

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Database Name: My_Little_Pet_V3
echo Server: localhost:1433
echo Username: sa
echo.
echo You can now:
echo 1. Update the password in application.properties
echo 2. Run the Spring Boot application
echo 3. Access the API at http://localhost:8080
echo.
pause
