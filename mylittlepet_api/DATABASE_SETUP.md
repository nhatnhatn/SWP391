# Database Setup Guide for My Little Pet V3

This document provides a complete guide for setting up the SQL Server database for the My Little Pet application.

## Prerequisites

- SQL Server 2017 or later
- SQL Server Management Studio (SSMS) or Azure Data Studio (optional)
- Java 11 or later
- Maven 3.6 or later

## Database Configuration

### 1. SQL Server Setup

Ensure SQL Server is running and accessible with the following configuration:
- Server: `localhost:1433`
- Authentication: SQL Server Authentication
- Username: `sa`
- Password: Update in `application.properties`

### 2. Database Structure

The database `My_Little_Pet_V3` contains the following main tables:

#### Core Tables
- **User**: User accounts (players, managers, admins)
- **Pet**: Pet types available in the system
- **PlayerPet**: Individual pets owned by players
- **Item**: Items available in the game
- **Shop**: Shop configurations
- **ShopProduct**: Items available in shops

#### Game Mechanics Tables
- **PlayerInventory**: Items owned by players
- **CareActivity**: Types of pet care activities
- **CareHistory**: History of pet care actions
- **Minigame**: Available mini-games
- **GameRecord**: Player game scores and records

#### System Tables
- **ActivityLog**: System activity logging
- **AdminHistory**: Admin actions history
- **AdminNote**: Admin notes about users
- **Report**: User reports and moderation
- **PlayerAchievement**: Player achievements

## Setup Options

### Option 1: Automatic Setup (Recommended)

1. **Run the setup script:**
   ```bash
   ./setup_database.bat
   ```

2. **Follow the prompts:**
   - The script will create the database
   - Run the schema creation
   - Optionally insert sample data

### Option 2: Manual Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE My_Little_Pet_V3;
   ```

2. **Run the schema script:**
   ```bash
   sqlcmd -S localhost -U sa -P yourpassword -d My_Little_Pet_V3 -i "src/main/resources/database/MyLittlePet_v3.sql"
   ```

3. **Insert sample data (optional):**
   ```bash
   sqlcmd -S localhost -U sa -P yourpassword -d My_Little_Pet_V3 -i "src/main/resources/database/sample_data.sql"
   ```

### Option 3: Spring Boot Auto-Initialization

1. **Update application.properties:**
   Uncomment these lines:
   ```properties
   spring.sql.init.mode=always
   spring.sql.init.schema-locations=classpath:database/MyLittlePet_v3.sql
   spring.sql.init.data-locations=classpath:database/sample_data.sql
   spring.sql.init.continue-on-error=false
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

## Configuration

### Update Database Password

1. **Update application.properties:**
   ```properties
   spring.datasource.password=your_actual_password
   ```

2. **If using the setup script, update it too:**
   Replace `yourpassword` with your actual SQL Server password.

### Connection String Options

For different SQL Server configurations:

```properties
# Local SQL Server with Windows Authentication
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=My_Little_Pet_V3;integratedSecurity=true;trustServerCertificate=true

# Remote SQL Server
spring.datasource.url=jdbc:sqlserver://your-server:1433;databaseName=My_Little_Pet_V3;trustServerCertificate=true

# SQL Server with encryption
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=My_Little_Pet_V3;encrypt=true;trustServerCertificate=false
```

## Default Sample Data

If you choose to insert sample data, the following accounts will be created:

| Username | Email | Role | Password (hashed) |
|----------|-------|------|-------------------|
| admin | admin@mylittlepet.com | Admin | (see sample_data.sql) |
| manager | manager@mylittlepet.com | Manager | (see sample_data.sql) |
| player1 | player1@example.com | Player | (see sample_data.sql) |
| player2 | player2@example.com | Player | (see sample_data.sql) |
| testuser | test@example.com | Player | (see sample_data.sql) |

*Note: All sample passwords are hashed. For testing, you may need to register new accounts or update passwords.*

## Database Schema Details

### Key Relationships

1. **User → PlayerPet**: One-to-many (users can have multiple pets)
2. **Pet → PlayerPet**: One-to-many (pet types can be owned by multiple players)
3. **User → PlayerInventory**: One-to-many (users can have multiple items)
4. **PlayerPet → CareHistory**: One-to-many (pets have care history)
5. **Shop → ShopProduct**: One-to-many (shops can sell multiple items)

### Constraints and Validations

- Health, Happiness, Hunger, Energy: 0-100 range
- Coins, Experience: Non-negative values
- User roles: Player, Admin, Manager only
- Item types: Food, Medicine, Toy, Accessory, Special
- Report status: Pending, InProgress, Resolved, Rejected

## Troubleshooting

### Common Issues

1. **Connection Failed:**
   - Check if SQL Server is running
   - Verify SQL Server Authentication is enabled
   - Check firewall settings for port 1433

2. **Login Failed:**
   - Verify username and password
   - Check if the user has appropriate permissions
   - Try connecting with SSMS first

3. **Database Already Exists:**
   - Drop and recreate: `DROP DATABASE My_Little_Pet_V3`
   - Or use existing database and run schema script

4. **Schema Creation Failed:**
   - Check if tables already exist
   - Verify user has CREATE permissions
   - Review error messages for specific issues

### Verification

To verify the setup worked correctly:

1. **Check tables exist:**
   ```sql
   USE My_Little_Pet_V3;
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
   ```

2. **Check sample data:**
   ```sql
   SELECT COUNT(*) as UserCount FROM [User];
   SELECT COUNT(*) as PetCount FROM Pet;
   SELECT COUNT(*) as ItemCount FROM Item;
   ```

3. **Test application connection:**
   ```bash
   mvn spring-boot:run
   ```
   Look for successful database connection logs.

## Support

If you encounter issues:

1. Check the application logs for detailed error messages
2. Verify SQL Server configuration and connectivity
3. Ensure all required dependencies are in `pom.xml`
4. Review the entity classes to ensure they match the database schema

## Files

- `src/main/resources/database/MyLittlePet_v3.sql` - Database schema
- `src/main/resources/database/sample_data.sql` - Sample data
- `src/main/resources/application.properties` - Spring Boot configuration
- `setup_database.bat` - Automated setup script
- `DATABASE_SETUP.md` - This documentation
