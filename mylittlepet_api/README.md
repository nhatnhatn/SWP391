# My Little Pet API - Spring Boot Backend

Hệ thống API backend cho ứng dụng quản lý thú cưng ảo bằng Spring Boot với hỗ trợ tiếng Việt.

## 🚀 Tính năng

- **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ
- **Quản lý thú cưng**: CRUD operations cho thú cưng với các hoạt động chăm sóc
- **Hệ thống vật phẩm**: Cửa hàng, kho đồ, mua/bán/sử dụng vật phẩm
- **Xác thực JWT**: Bảo mật với JSON Web Tokens
- **Phân quyền**: Admin và User roles
- **Database MySQL**: Persistent storage với JPA/Hibernate
- **Tiếng Việt**: Đầy đủ hỗ trợ Vietnamese localization

## 📋 Yêu cầu hệ thống

- Java 17 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+
- IDE: IntelliJ IDEA, Eclipse, hoặc VS Code

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd mylittlepet_api
```

### 2. Cấu hình database
Tạo database MySQL:
```sql
CREATE DATABASE mylittlepet_db;
CREATE USER 'mylittlepet'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON mylittlepet_db.* TO 'mylittlepet'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Cấu hình application.properties
Cập nhật file `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/mylittlepet_db
spring.datasource.username=mylittlepet
spring.datasource.password=password123

# JWT Configuration
jwt.secret=mySecretKey123456789012345678901234567890
jwt.expiration=86400000
```

### 4. Build và chạy ứng dụng
```bash
mvn clean install
mvn spring-boot:run
```

Hoặc:
```bash
mvn clean package
java -jar target/mylittlepet-api-1.0.0.jar
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Xác thực
API sử dụng JWT tokens. Thêm header:
```
Authorization: Bearer <token>
```

### Endpoints chính

#### 🔐 Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/change-password` - Đổi mật khẩu

#### 👥 Users
- `GET /api/users` - Danh sách người dùng
- `GET /api/users/{id}` - Chi tiết người dùng
- `PUT /api/users/{id}` - Cập nhật người dùng
- `PUT /api/users/{id}/coins` - Cập nhật xu
- `PUT /api/users/{id}/experience` - Thêm kinh nghiệm

#### 🐕 Pets
- `GET /api/pets` - Danh sách thú cưng
- `GET /api/pets/owner/{ownerId}` - Thú cưng của người dùng
- `POST /api/pets` - Tạo thú cưng mới
- `POST /api/pets/{id}/feed` - Cho ăn
- `POST /api/pets/{id}/play` - Chơi cùng
- `POST /api/pets/{id}/heal` - Chữa bệnh

#### 🎒 Items
- `GET /api/items/shop` - Cửa hàng
- `GET /api/items/inventory/{userId}` - Kho đồ
- `POST /api/items/{itemId}/purchase` - Mua vật phẩm
- `POST /api/items/{itemId}/sell` - Bán vật phẩm
- `POST /api/items/{itemId}/use` - Sử dụng vật phẩm

## 🧪 Dữ liệu test

Hệ thống tự động tạo dữ liệu mẫu khi khởi động:

### Tài khoản demo:
- **Admin**: `admin` / `admin123`
- **User**: `demo` / `demo123`

### Loại thú cưng:
- Chó (DOG)
- Mèo (CAT) 
- Chim (BIRD)
- Cá (FISH)
- Bò sát (REPTILE)
- Thỏ (RABBIT)
- Chuột hamster (HAMSTER)

### Độ hiếm:
- Thường (COMMON)
- Không phổ biến (UNCOMMON)
- Hiếm (RARE)
- Sử thi (EPIC)
- Huyền thoại (LEGENDARY)

## 🏗️ Kiến trúc

```
src/main/java/com/mylittlepet/
├── config/          # Cấu hình Spring
├── controller/      # REST Controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA Entities
├── repository/     # Data Repositories
├── service/        # Business Logic
└── MyLittlePetApplication.java
```

## 🔧 Cấu hình

### CORS
Đã cấu hình cho frontend React:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Security
- JWT authentication
- Role-based access control
- Password encryption với BCrypt

### Database
- MySQL với JPA/Hibernate
- Automatic table creation
- Sample data seeding

## 🐛 Troubleshooting

### Database connection issues:
1. Kiểm tra MySQL service đang chạy
2. Xác nhận database và user đã được tạo
3. Kiểm tra connection string trong application.properties

### Port conflicts:
- API mặc định chạy trên port 8080
- Có thể thay đổi trong application.properties: `server.port=8081`

### JWT issues:
- Kiểm tra JWT secret key đủ dài (tối thiểu 32 chars)
- Verify token expiration time

## 📞 Hỗ trợ

Để biết thêm thông tin về API endpoints, truy cập:
```
GET http://localhost:8080/api
```

Health check:
```
GET http://localhost:8080/api/health
```

## 🚀 Production Deployment

### Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://production-db:3306/mylittlepet_db
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export JWT_SECRET=your-production-secret-key
export SPRING_PROFILES_ACTIVE=production
```

### Docker
```dockerfile
FROM openjdk:17-jdk-alpine
COPY target/mylittlepet-api-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 📈 Monitoring

- Spring Boot Actuator endpoints
- Application logs
- Database performance metrics
- API response times
