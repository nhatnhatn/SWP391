# 🐾 Vietnamese Pet Management System

A comprehensive full-stack web application for managing pets, players, and items with Vietnamese localization.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm 7+

### Installation & Startup
```powershell
# Install dependencies
npm run install:all

# Start both servers (recommended)
npm run start:dev

# Or start individually:
npm run start:backend  # Backend only
npm run start:frontend # Frontend only

# Verify system is working
npm run verify
```

### Access URLs
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:8080
- **Login**: admin@mylittlepet.com / admin123

## 📁 Project Structure

```
e:\Assignment\SWP391\
├── mylittlepet/                 # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Auth, Notifications)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API integration layer
│   │   ├── utils/               # Helper functions
│   │   └── constants/           # Vietnamese translations
│   └── package.json
├── mylittlepet_api/             # Spring Boot Backend
├── mock-backend-server.js       # Mock API Server
├── verify-system.js             # System verification script
└── package.json                 # Workspace configuration
```

## 🎮 Features

### 🔐 **Authentication System**
- JWT-based authentication
- Role-based access control
- Vietnamese error messages
- Fallback to local storage

### 👥 **Player Management**
- CRUD operations for players
- Search and pagination
- Player statistics tracking
- Vietnamese player data

### 🐕 **Pet Care System**
- Pet health monitoring
- Interactive care actions (feed, play, rest, heal)
- Pet happiness and energy tracking
- Vietnamese pet names and descriptions

### 🛍️ **Items & Inventory**
- Item management with categories
- Shopping system with purchase/sell
- Inventory tracking
- Vietnamese item descriptions

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start backend server |
| `npm run start:frontend` | Start frontend development server |
| `npm run start:backend` | Start backend server only |
| `npm run start:dev` | Start both servers simultaneously |
| `npm run verify` | Verify system is working correctly |
| `npm run build` | Build frontend for production |
| `npm run install:all` | Install all dependencies |

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js/Express** - Mock API server
- **Spring Boot** - Full Java backend (optional)
- **JWT** - Authentication
- **CORS** - Cross-origin support

### Integration
- **Axios** - HTTP client
- **Custom hooks** - Data management
- **Context API** - State management
- **Vietnamese** - Full localization

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/health` - Health check

### Data Management
- `GET /api/users/paginated` - Get players with pagination
- `GET /api/pets/paginated` - Get pets with pagination  
- `GET /api/items` - Get items
- `POST /api/pets/{id}/feed` - Feed a pet
- `POST /api/pets/{id}/play` - Play with a pet

## 🎨 Vietnamese Localization

The application is fully localized in Vietnamese:
- UI text and labels
- Error messages
- Success notifications
- Data content (pet names, item descriptions)
- Authentication messages

## 🔧 Development

### File Organization
- **Components**: Reusable UI components in `src/components/`
- **Pages**: Page-level components in `src/pages/manager/`
- **Services**: API integration in `src/services/`
- **Contexts**: React contexts in `src/contexts/`
- **Utils**: Helper functions in `src/utils/`

### Key Features
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators
- **Notifications**: Toast notifications for user feedback
- **Caching**: Smart data caching for performance

## 🚨 Troubleshooting

### Common Issues

**Port conflicts:**
```powershell
# Check what's using port 8080
netstat -ano | findstr :8080

# Frontend will auto-select available port (5173, 5174, 5175, etc.)
```

**Dependencies issues:**
```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
npm run install:all
```

**Verification failed:**
```powershell
# Run verification script
npm run verify
```

## 📝 License

MIT License - see LICENSE file for details.

## 👥 Contributors

MyLittlePet Development Team
My little pet
