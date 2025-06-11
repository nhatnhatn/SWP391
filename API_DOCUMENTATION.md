# My Little Pet API Documentation

## Overview
- **Base URL**: `http://localhost:8080/api`
- **Database**: MySQL on port 3306
- **Framework**: Spring Boot
- **CORS**: Enabled for `http://localhost:5173` and `http://localhost:3000`

## Quick Health Check
- **GET** `/api/health` - Health check endpoint
- **GET** `/api` - API information and endpoint list

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/login` | User login | `{ "username": "string", "password": "string" }` |
| POST | `/register` | User registration | `{ "username": "string", "email": "string", "password": "string" }` |
| POST | `/change-password` | Change password | `{ "oldPassword": "string", "newPassword": "string" }` |
| POST | `/forgot-password` | Forgot password | Query param: `?email=user@example.com` |
| POST | `/reset-password` | Reset password | `{ "token": "string", "newPassword": "string" }` |

**Headers Required for Protected Endpoints:**
```
Authorization: Bearer <JWT_TOKEN>
```

## User Management Endpoints (`/api/users`)

### Get Users
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | Get all users | - |
| GET | `/paginated` | Get users with pagination | `?page=0&size=10` |
| GET | `/{id}` | Get user by ID | Path: `id` |
| GET | `/email/{email}` | Get user by email | Path: `email` |
| GET | `/username/{username}` | Get user by username | Path: `username` |
| GET | `/search` | Search users | Query: `?keyword=searchterm` |
| GET | `/status/{status}` | Get users by status | Path: `status` (ACTIVE, INACTIVE, BANNED) |

### Modify Users
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/` | Create new user | `UserDTO` object |
| PUT | `/{id}` | Update user | `UserDTO` object |
| DELETE | `/{id}` | Delete user | - |
| PUT | `/{id}/stats` | Update user stats | Query: `?petCount=5&itemCount=10` |
| PUT | `/{id}/experience` | Add experience | Query: `?experience=100` |
| PUT | `/{id}/coins` | Update coins | Query: `?coinChange=50` (can be negative) |

## Pet Management Endpoints (`/api/pets`)

### Get Pets
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | Get all pets | - |
| GET | `/paginated` | Get pets with pagination | `?page=0&size=10` |
| GET | `/{id}` | Get pet by ID | Path: `id` |
| GET | `/owner/{ownerId}` | Get pets by owner | Path: `ownerId` |
| GET | `/type/{type}` | Get pets by type | Path: `type` (DOG, CAT, BIRD, FISH, etc.) |
| GET | `/rarity/{rarity}` | Get pets by rarity | Path: `rarity` (COMMON, RARE, EPIC, etc.) |
| GET | `/search` | Search pets | Query: `?keyword=searchterm` |
| GET | `/available` | Get available pets | - |

### Modify Pets
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/` | Create new pet | `PetDTO` object |
| PUT | `/{id}` | Update pet | `PetDTO` object |
| DELETE | `/{id}` | Delete pet | - |

### Pet Actions
| Method | Endpoint | Description | Effect |
|--------|----------|-------------|--------|
| POST | `/{id}/feed` | Feed pet | Increases hunger/happiness |
| POST | `/{id}/play` | Play with pet | Increases happiness/energy |
| POST | `/{id}/rest` | Let pet rest | Restores energy |
| POST | `/{id}/heal` | Heal pet | Restores health |

## Item Management Endpoints (`/api/items`)

### Get Items
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | Get all items | - |
| GET | `/paginated` | Get items with pagination | `?page=0&size=10` |
| GET | `/{id}` | Get item by ID | Path: `id` |
| GET | `/type/{type}` | Get items by type | Path: `type` (FOOD, MEDICINE, TOY, ACCESSORY) |
| GET | `/rarity/{rarity}` | Get items by rarity | Path: `rarity` (COMMON, RARE, EPIC, etc.) |
| GET | `/search` | Search items | Query: `?keyword=searchterm` |
| GET | `/shop` | Get shop items | - |
| GET | `/inventory/{userId}` | Get user inventory | Path: `userId` |

### Modify Items
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/` | Create new item | `ItemDTO` object |
| PUT | `/{id}` | Update item | `ItemDTO` object |
| DELETE | `/{id}` | Delete item | - |

### Item Transactions
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/{itemId}/purchase` | Purchase item | Query: `?userId=1&quantity=2` |
| POST | `/{itemId}/sell` | Sell item | Query: `?userId=1&quantity=1` |
| POST | `/{itemId}/use` | Use item | Query: `?userId=1` |

## Data Types & Enums

### Pet Types
- `DOG` - Chó
- `CAT` - Mèo  
- `BIRD` - Chim
- `FISH` - Cá
- `REPTILE` - Bò sát
- `RABBIT` - Thỏ
- `HAMSTER` - Chuột hamster
- `OTHER` - Khác

### Item Types
- `FOOD` - Thức ăn (🍞)
- `MEDICINE` - Thuốc (💊)
- `TOY` - Đồ chơi (🧸)
- `ACCESSORY` - Phụ kiện

### Rarity Types
- `COMMON` - Thường
- `UNCOMMON` - Không phổ biến
- `RARE` - Hiếm
- `EPIC` - Sử thi
- `LEGENDARY` - Huyền thoại

### User Status
- `ACTIVE` - Hoạt động
- `INACTIVE` - Không hoạt động
- `BANNED` - Bị cấm

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 50,
  "totalPages": 5
}
```

## Test Credentials
- **Admin**: `admin` / `admin123`
- **Demo**: `demo` / `demo123`

## Development Notes

### Database Configuration
- MySQL database: `mylittlepet`
- Auto-creates database if not exists
- Hibernate DDL: `update` mode
- SQL logging enabled

### Security
- JWT token authentication
- Token expiration: 24 hours (86400000ms)
- CORS enabled for frontend development ports

### Important API Response Structure
The API returns data in this format for items:
```json
{
  "data": [...],          // This is the actual items array
  "pagination": { ... }   // Pagination info
}
```

**Note**: Your frontend `useData.js` and `dataService.js` have been updated to handle this correct structure (`response.data.data` instead of `response.content`).

## Running the Backend
1. Ensure MySQL is running on port 3306
2. Database `mylittlepet` will be auto-created
3. Start the Spring Boot application
4. API will be available at `http://localhost:8080/api`

## Integration with Frontend
Your React frontend (`mylittlepet/`) is already configured to connect to this API through:
- `src/services/api.js` - Axios configuration
- `src/services/dataService.js` - API service methods
- `src/hooks/useData.js` - React hooks for data fetching

The frontend properly handles the API response structure and displays Vietnamese translations for item types and rarities.
