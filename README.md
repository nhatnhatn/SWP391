# My Little Pet - Admin Management System

A frontend pet management system built with React and Vite.

## 🏗️ Project Structure

```
SWP391/
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
- Node.js 18 or higher
- npm or yarn

### Application Setup (React + Vite)

1. **Navigate to project directory:**
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

**Application will be available at:** `http://localhost:5173` or `http://localhost:5174`

## 🔑 Default Login Credentials

- **Email:** `admin@mylittlepet.com`
- **Password:** `Admin123!`

## 🛠️ Development

### Technology Stack

**Frontend:**
- React 19.1.0
- Vite 6.3.5
- Tailwind CSS 3.4.17
- React Router 7.6.0

## 📝 Notes

- This is a frontend-only application using mock data
- The project structure is clean and follows best practices
- No database or backend setup required

## 🧹 Recent Cleanup

Removed unnecessary files and components:
- ❌ Spring Boot backend code
- ❌ Database configuration
- ❌ API documentation
- ❌ Backend build scripts
- ✅ Added mock data service layer

## 🎯 Features

- Admin authentication system
- Player management interface
- Pet management system
- Item inventory system
- Responsive UI with Tailwind CSS
- Vietnamese language support
