# My Little Pet - Admin Management System

A full-stack pet management system built with Spring Boot backend and React frontend.

## 🏗️ Project Structure

```
SWP391/
├── backend/              # Spring Boot API server
│   ├── src/
│   │   ├── main/java/com/mylittlepet/
│   │   │   ├── controller/    # REST API controllers
│   │   │   ├── service/       # Business logic
│   │   │   ├── entity/        # Database entities
│   │   │   ├── repository/    # Data access layer
│   │   │   ├── dto/          # Data transfer objects
│   │   │   ├── config/       # Configuration classes
│   │   │   └── util/         # Utility classes
│   │   └── resources/
│   │       ├── application.properties  # Database config
│   │       └── database_setup.sql     # Database schema
│   └── pom.xml          # Maven dependencies
├── mylittlepet/         # React frontend application  
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts (Auth, etc.)
│   │   ├── services/    # API service layer
│   │   ├── constants/   # Constants and translations
│   │   ├── data/        # Mock data
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Utility functions
│   ├── public/          # Static assets
│   └── package.json     # Node.js dependencies
├── database/            # Database setup files
│   ├── My_Little_Pet_V3.sql    # Database schema
│   └── sample_data.sql         # Sample data
└── .vscode/            # VS Code configuration
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher  
- SQL Server
- Maven 3.6 or higher

### Backend Setup (Spring Boot)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure database in `application.properties`:**
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=My_Little_Pet_V3;trustServerCertificate=true
   spring.datasource.username=sa
   spring.datasource.password=12345
   ```

3. **Build and run:**
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

   Or build jar and run:
   ```bash
   mvn package -DskipTests
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

**Backend will be available at:** `http://localhost:8080`

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd mylittlepet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

**Frontend will be available at:** `http://localhost:5173` or `http://localhost:5174`

### Database Setup

1. **Create database:**
   ```sql
   CREATE DATABASE My_Little_Pet_V3;
   ```

2. **Run schema script:**
   ```bash
   # Execute database/My_Little_Pet_V3.sql in SQL Server Management Studio
   ```

3. **Load sample data:**
   ```bash
   # Execute database/sample_data.sql in SQL Server Management Studio
   ```

## 🔑 Default Login Credentials

- **Email:** `a@gmail.com`
- **Password:** `Abc12345678`

## 🛠️ Development

### API Endpoints

- **Authentication:** `/api/auth/login`, `/api/auth/register`
- **Debug:** `/api/debug/users`, `/api/debug/user/{email}`

### Technology Stack

**Backend:**
- Spring Boot 3.2.0
- Spring Data JPA
- SQL Server
- Maven

**Frontend:**
- React 19.1.0
- Vite 6.3.5
- Tailwind CSS 3.4.17
- React Router 7.6.0

## 📝 Notes

- The application uses SQL Server as the database
- CORS is configured for local development ports
- Debug logging is enabled for authentication flows
- The project structure is clean and follows best practices

## 🧹 Recent Cleanup

Removed unnecessary files:
- ❌ Mock backend server files
- ❌ Old API documentation  
- ❌ System verification scripts
- ❌ Unused workspace configuration files

## 🎯 Features

- Admin authentication system
- Player management interface
- Pet management system
- Item inventory system
- Responsive UI with Tailwind CSS
- Vietnamese language support
