# Frontend-Backend Integration Guide
## My Little Pet Vietnamese Management System

This guide demonstrates how the React frontend integrates with the Spring Boot backend to replace mock data with real API calls.

## 🔗 Integration Architecture

### Backend (Spring Boot)
- **Location**: `e:\Assignment\SWP391\mylittlepet_api\`
- **Port**: `8080`
- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT tokens
- **Database**: MySQL with Vietnamese sample data

### Frontend (React + Vite)
- **Location**: `e:\Assignment\SWP391\mylittlepet\`
- **Port**: `5173` (Vite development server)
- **API Client**: Custom service layer
- **State Management**: React hooks + context

## 📁 Integration Files Overview

### Core Integration Layer
```
src/services/
├── api.js                 # HTTP client for backend communication
└── dataService.js         # Business logic layer with data transformation

src/hooks/
└── useData.js             # Custom hooks (usePlayers, usePets, useItems)

src/contexts/
└── AuthContextV2.jsx      # Enhanced auth with backend integration
```

### Updated Components (Backend Integrated)
```
src/pages/manager/
├── PlayersV2.jsx         # Players management with backend integration
├── PetsV2.jsx            # Pets management with pet care actions
└── ItemsV2.jsx           # Items management with shop functionality
```

### Configuration Files
```
.env.development           # Development API settings
.env.production           # Production API settings
```

## 🚀 Quick Start

### 1. Start Backend (Spring Boot)
```bash
cd e:\Assignment\SWP391\mylittlepet_api
mvn spring-boot:run
```

### 2. Start Frontend (React + Vite)
```bash
cd e:\Assignment\SWP391\mylittlepet
npm run dev
```

### 3. Open Application
Navigate to: `http://localhost:5173`

## 🧪 Testing the Integration

### Automated Integration Tests

We've included a comprehensive test script to verify the integration:

```bash
cd e:\Assignment\SWP391
node test-integration.js
```

This script tests:
- ✅ Backend API health and endpoints
- ✅ Authentication system
- ✅ CORS configuration
- ✅ Frontend loading
- ✅ Data flow between frontend and backend

### Manual Testing Checklist

#### 1. Authentication Flow
- [ ] Navigate to login page (`/login`)
- [ ] Try invalid credentials (should show error)
- [ ] Login with valid credentials (check `Application.java` for demo users)
- [ ] Verify JWT token is stored and used for requests
- [ ] Test automatic logout on token expiry

#### 2. Players Management
- [ ] Navigate to Players page (`/players`)
- [ ] Verify real data loads from backend
- [ ] Test search functionality with Vietnamese text
- [ ] Test pagination controls
- [ ] Test player status filtering
- [ ] Verify player details expansion works

#### 3. Pets Management  
- [ ] Navigate to Pets page (`/pets`)
- [ ] Verify pets load with proper Vietnamese pet types
- [ ] Test pet care actions (feed, play, rest, heal)
- [ ] Test creating new pets
- [ ] Test editing existing pets
- [ ] Verify pet stats and abilities are displayed correctly

#### 4. Items Management
- [ ] Navigate to Items page (`/items`)
- [ ] Verify items load with Vietnamese item types
- [ ] Test item purchase functionality
- [ ] Test creating new items with effects
- [ ] Test editing existing items
- [ ] Verify shop functionality works correctly

#### 5. Error Handling
- [ ] Disconnect backend and verify graceful fallback
- [ ] Test network error scenarios
- [ ] Verify Vietnamese error messages are displayed
- [ ] Test loading states and skeleton screens

## 🔧 Technical Implementation Details

### API Integration Pattern

The integration follows a 3-layer architecture:

```javascript
// 1. HTTP Client Layer (api.js)
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 2. Data Service Layer (dataService.js)
export const playerService = {
  async getPlayers(params) {
    const response = await apiClient.get('/users', { params });
    return transformPlayersResponse(response.data);
  }
};

// 3. React Hook Layer (useData.js)
export const usePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... implementation
};
```

### Authentication Integration

The authentication system tries backend first, then falls back to local storage:

```javascript
const login = async (email, password) => {
  try {
    // Try backend authentication
    const response = await authService.login(email, password);
    if (response.token) {
      setUser(response.user);
      setToken(response.token);
      return response;
    }
  } catch (error) {
    // Fallback to local authentication
    return localAuthFallback(email, password);
  }
};
```

### Data Transformation

Vietnamese data is properly transformed between backend DTOs and frontend models:

```javascript
const transformPetResponse = (backendPet) => ({
  id: backendPet.id,
  name: backendPet.name,
  type: backendPet.petType,
  level: backendPet.level,
  happiness: backendPet.happiness,
  health: backendPet.health,
  energy: backendPet.energy,
  // Transform Vietnamese pet care abilities
  abilities: backendPet.abilities?.map(transformAbility) || []
});
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### ❌ Backend Connection Failed
**Symptoms**: "Network Error" or "Connection refused"
**Solutions**:
1. Verify backend is running on port 8080
2. Check if MySQL database is running
3. Verify CORS configuration allows frontend origin
4. Check `.env.development` has correct API URL

#### ❌ Authentication Issues
**Symptoms**: "Unauthorized" errors or infinite login loops
**Solutions**:
1. Clear browser local storage and cookies
2. Verify JWT token format and expiry
3. Check backend authentication endpoints
4. Verify user exists in database

#### ❌ Vietnamese Text Display Issues
**Symptoms**: Broken characters or missing translations
**Solutions**:
1. Verify UTF-8 encoding in all files
2. Check `vietnamese.js` contains all required translations
3. Verify database collation supports Vietnamese characters
4. Check API response encoding

#### ❌ CORS Errors
**Symptoms**: "Access to fetch blocked by CORS policy"
**Solutions**:
1. Add frontend URL to backend CORS configuration
2. Verify `@CrossOrigin` annotations on controllers
3. Check security configuration allows preflight requests

#### ❌ Build/Compilation Errors
**Symptoms**: Import/export errors or TypeScript issues
**Solutions**:
1. Verify all file paths are correct
2. Check imports use correct file extensions
3. Clear node_modules and reinstall: `npm ci`
4. Verify all dependencies are installed

### Environment Setup Issues

#### Backend Requirements
- Java 11+ installed
- Maven 3.6+ installed
- MySQL 8.0+ running
- Port 8080 available

#### Frontend Requirements  
- Node.js 16+ installed
- npm 7+ installed
- Port 5173 available (Vite default)

### Development Tips

#### Hot Reload Issues
If changes aren't reflecting:
1. Restart Vite development server
2. Clear browser cache (Ctrl+Shift+R)
3. Check for syntax errors in console

#### API Testing
Use tools like Postman or curl to test backend endpoints:
```bash
# Test users endpoint
curl -X GET http://localhost:8080/api/users

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mylittlepet.com","password":"admin123"}'
```

#### Database Issues
If data isn't loading:
1. Check MySQL connection settings in `application.properties`
2. Verify database and tables exist
3. Check if sample data was seeded properly
4. Look for foreign key constraint issues

## 📊 Performance Optimization

### Caching Strategy
The integration includes intelligent caching:
- 5-minute cache timeout for static data
- Automatic cache invalidation on mutations
- Optimistic updates for better UX

### Pagination
All list views support server-side pagination:
- Configurable page sizes
- Efficient data loading
- Search and filter preservation

### Error Recovery
Robust error handling includes:
- Automatic retry on network failures
- Graceful degradation to cached data
- User-friendly Vietnamese error messages

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes**:
   ```bash
   cd mylittlepet_api
   mvn spring-boot:run
   # Backend auto-reloads on Java file changes
   ```

2. **Frontend Changes**:
   ```bash
   cd mylittlepet
   npm run dev
   # Vite provides instant hot module replacement
   ```

3. **Database Changes**:
   - Update entity classes
   - Run migrations or restart with `spring.jpa.hibernate.ddl-auto=create-drop`
   - Verify sample data is seeded correctly

### Testing Changes

1. Run the integration test script
2. Manually test affected functionality
3. Check browser console for errors
4. Verify Vietnamese localization works correctly

## 📝 Next Steps

### Production Deployment
1. Build frontend for production: `npm run build`
2. Configure production API URLs
3. Set up proper database with persistent data
4. Configure reverse proxy (nginx) for serving
5. Set up SSL certificates for HTTPS

### Additional Features
- Real-time updates with WebSockets
- Advanced search and filtering
- Export/import functionality
- Advanced pet care simulation
- Achievement system integration

## 🆘 Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Check backend logs for errors
4. Test API endpoints directly
5. Verify environment configuration

---

**Integration Status**: ✅ Complete
**Components Integrated**: Players, Pets, Items
**Authentication**: JWT + Local Fallback
**Database**: MySQL with Vietnamese Sample Data
**Testing**: Automated + Manual Test Suites Available
