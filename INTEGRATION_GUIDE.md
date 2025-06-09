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

### Frontend (React)
- **Location**: `e:\Assignment\SWP391\mylittlepet\`
- **Port**: `3000`
- **API Client**: Custom service layer
- **State Management**: React hooks + context

## 📁 New Integration Files Created

### 1. API Service Layer
```
src/services/
├── api.js                 # HTTP client for backend communication
└── dataService.js         # Business logic layer with data transformation
```

### 2. React Hooks
```
src/hooks/
└── useData.js             # Custom hooks for data management
```

### 3. Updated Authentication
```
src/contexts/
└── AuthContextV2.jsx      # Enhanced auth with backend integration
```

### 4. Environment Configuration
```
.env.development           # Development API settings
.env.production           # Production API settings
```

### 5. Example Updated Component
```
src/pages/manager/
└── PlayersV2.jsx         # Players component with backend integration
```

## 🚀 Step-by-Step Integration Process

### Step 1: Start Backend Server

```bash
cd e:\Assignment\SWP391\mylittlepet_api
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### Step 2: Update Frontend Dependencies

```bash
cd e:\Assignment\SWP391\mylittlepet
npm install
```

### Step 3: Replace Authentication Context

Update your main App.jsx to use the new authentication:

```jsx
// Old import
// import { AuthProvider } from './contexts/AuthContext';

// New import
import { AuthProvider } from './contexts/AuthContextV2';
```

### Step 4: Update Components to Use New Data Service

Replace mock data imports with the new data service:

```jsx
// Old way
import { mockPlayers } from '../../data/mockData';
const [players, setPlayers] = useState(mockPlayers);

// New way
import { usePlayers } from '../../hooks/useData';
const { players, loading, error, fetchPlayers } = usePlayers();
```

### Step 5: Test Integration

1. **Login Flow**:
   - Try backend authentication first
   - Falls back to local auth if backend unavailable
   - JWT tokens stored automatically

2. **Data Loading**:
   - Real-time data from MySQL database
   - Automatic caching with 5-minute timeout
   - Error handling with fallback data

3. **CRUD Operations**:
   - Create, read, update, delete operations
   - Vietnamese error messages
   - Optimistic updates with rollback

## 🔧 Configuration Options

### Environment Variables

```bash
# Development (.env.development)
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_CACHE=true

# Production (.env.production)
REACT_APP_API_URL=https://api.mylittlepet.com/api
REACT_APP_ENABLE_MOCK_DATA=false
```

### API Service Configuration

```javascript
// Customize timeout and retry settings
const apiService = new ApiService({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 30000,
    retries: 3
});
```

## 📊 Data Flow Examples

### 1. Player Management Flow

```
Frontend Component → usePlayer Hook → DataService → API Service → Spring Boot → MySQL
                                                                        ↓
Frontend UI ← Transformed Data ← Data Transformation ← JSON Response ← JPA Entities
```

### 2. Pet Care Action Flow

```
User Action (Feed Pet) → usePets.feedPet() → dataService.feedPet() → apiService.feedPet()
                                                                           ↓
Backend PetController.feedPet() → PetService.feedPet() → Update Database
                                                              ↓
Return Updated Pet Data → Transform to DTO → JSON Response → Update Frontend State
```

### 3. Authentication Flow

```
Login Form → AuthContext.login() → apiService.login() → AuthController.login()
                                                              ↓
JWT Token Generation ← AuthService.login() ← User Validation ← Database Check
            ↓
Store Token + User Data → Update UI State → Enable Protected Routes
```

## 🎯 Integration Benefits

### 1. **Real-time Data**
- Live data from MySQL database
- Vietnamese sample data automatically seeded
- No more mock data limitations

### 2. **Robust Error Handling**
- Graceful fallback to cached/mock data
- Vietnamese error messages
- Network failure resilience

### 3. **Performance Optimization**
- Intelligent caching system
- Pagination for large datasets
- Optimistic UI updates

### 4. **Security**
- JWT-based authentication
- Role-based access control
- CORS protection

### 5. **Vietnamese Localization**
- Backend returns Vietnamese content
- Error messages in Vietnamese
- Proper date/time formatting

## 🧪 Testing Integration

### 1. Test Backend Connectivity

```javascript
// Check if backend is running
import apiService from './services/api';

apiService.healthCheck()
    .then(() => console.log('✅ Backend connected'))
    .catch(() => console.log('❌ Backend unavailable'));
```

### 2. Test Authentication

```javascript
// Test login flow
const { login } = useAuth();

const testLogin = async () => {
    try {
        const result = await login('admin@mylittlepet.com', 'admin123');
        if (result.success) {
            console.log('✅ Authentication successful');
        }
    } catch (error) {
        console.log('❌ Authentication failed:', error.message);
    }
};
```

### 3. Test Data Operations

```javascript
// Test data loading
const { players, loading, error } = usePlayers();

useEffect(() => {
    if (!loading && !error && players.length > 0) {
        console.log('✅ Players loaded:', players.length);
    } else if (error) {
        console.log('❌ Error loading players:', error);
    }
}, [players, loading, error]);
```

## 🔄 Migration Strategy

### Phase 1: Parallel Implementation
1. Keep existing mock data system
2. Add new backend integration
3. Use feature flags to switch between systems

### Phase 2: Gradual Migration
1. Migrate one component at a time
2. Test thoroughly before moving to next component
3. Keep fallback mechanisms

### Phase 3: Full Migration
1. Remove mock data dependencies
2. Remove feature flags
3. Optimize performance

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Backend CORS is configured for http://localhost:3000
   # Make sure frontend runs on correct port
   npm start
   ```

2. **Authentication Issues**
   ```javascript
   // Clear invalid tokens
   localStorage.removeItem('authToken');
   localStorage.removeItem('adminUser');
   ```

3. **Database Connection**
   ```bash
   # Check MySQL is running and database exists
   mysql -u root -p
   USE mylittlepet_db;
   SHOW TABLES;
   ```

4. **API Endpoints**
   ```bash
   # Test backend endpoints directly
   curl http://localhost:8080/api/health
   curl http://localhost:8080/api/docs
   ```

## 📈 Performance Monitoring

### Frontend Metrics
- API response times
- Cache hit rates
- Error rates
- User interaction latency

### Backend Metrics
- Database query performance
- JWT token validation time
- Memory usage
- Request throughput

## 🎉 Next Steps

1. **Testing**: Add comprehensive integration tests
2. **Monitoring**: Implement error tracking and analytics
3. **Optimization**: Add performance monitoring
4. **Deployment**: Set up production environment
5. **Documentation**: Create user guide for Vietnamese features

---

**Integration Status**: ✅ Complete
**Backend-Frontend Communication**: ✅ Functional
**Vietnamese Localization**: ✅ Implemented
**Authentication**: ✅ JWT-based
**Data Operations**: ✅ Full CRUD support
**Error Handling**: ✅ Robust fallbacks
