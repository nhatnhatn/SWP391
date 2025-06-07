package com.mylittlepet.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiDocumentationController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> apiInfo = new HashMap<>();
        apiInfo.put("name", "My Little Pet API");
        apiInfo.put("version", "1.0.0");
        apiInfo.put("description", "API cho hệ thống quản lý thú cưng ảo");
        apiInfo.put("status", "active");

        Map<String, String> endpoints = new HashMap<>();

        // Auth endpoints
        endpoints.put("POST /api/auth/login", "Đăng nhập");
        endpoints.put("POST /api/auth/register", "Đăng ký tài khoản");
        endpoints.put("POST /api/auth/change-password", "Đổi mật khẩu");
        endpoints.put("POST /api/auth/forgot-password", "Quên mật khẩu");
        endpoints.put("POST /api/auth/reset-password", "Đặt lại mật khẩu");

        // User endpoints
        endpoints.put("GET /api/users", "Lấy danh sách người dùng");
        endpoints.put("GET /api/users/{id}", "Lấy thông tin người dùng theo ID");
        endpoints.put("GET /api/users/username/{username}", "Lấy thông tin người dùng theo tên đăng nhập");
        endpoints.put("GET /api/users/search?keyword=", "Tìm kiếm người dùng");
        endpoints.put("POST /api/users", "Tạo người dùng mới");
        endpoints.put("PUT /api/users/{id}", "Cập nhật thông tin người dùng");
        endpoints.put("DELETE /api/users/{id}", "Xóa người dùng");
        endpoints.put("PUT /api/users/{id}/coins?coinChange=", "Cập nhật xu");
        endpoints.put("PUT /api/users/{id}/experience?experience=", "Thêm kinh nghiệm");

        // Pet endpoints
        endpoints.put("GET /api/pets", "Lấy danh sách thú cưng");
        endpoints.put("GET /api/pets/{id}", "Lấy thông tin thú cưng theo ID");
        endpoints.put("GET /api/pets/owner/{ownerId}", "Lấy thú cưng theo chủ sở hữu");
        endpoints.put("GET /api/pets/type/{type}", "Lấy thú cưng theo loại");
        endpoints.put("GET /api/pets/search?keyword=", "Tìm kiếm thú cưng");
        endpoints.put("POST /api/pets", "Tạo thú cưng mới");
        endpoints.put("PUT /api/pets/{id}", "Cập nhật thông tin thú cưng");
        endpoints.put("DELETE /api/pets/{id}", "Xóa thú cưng");
        endpoints.put("POST /api/pets/{id}/feed", "Cho ăn thú cưng");
        endpoints.put("POST /api/pets/{id}/play", "Chơi với thú cưng");
        endpoints.put("POST /api/pets/{id}/rest", "Để thú cưng nghỉ ngơi");
        endpoints.put("POST /api/pets/{id}/heal", "Chữa bệnh cho thú cưng");

        // Item endpoints
        endpoints.put("GET /api/items", "Lấy danh sách vật phẩm");
        endpoints.put("GET /api/items/{id}", "Lấy thông tin vật phẩm theo ID");
        endpoints.put("GET /api/items/type/{type}", "Lấy vật phẩm theo loại");
        endpoints.put("GET /api/items/shop", "Lấy vật phẩm trong cửa hàng");
        endpoints.put("GET /api/items/inventory/{userId}", "Lấy kho đồ của người dùng");
        endpoints.put("POST /api/items", "Tạo vật phẩm mới");
        endpoints.put("PUT /api/items/{id}", "Cập nhật thông tin vật phẩm");
        endpoints.put("DELETE /api/items/{id}", "Xóa vật phẩm");
        endpoints.put("POST /api/items/{itemId}/purchase?userId=&quantity=", "Mua vật phẩm");
        endpoints.put("POST /api/items/{itemId}/sell?userId=&quantity=", "Bán vật phẩm");
        endpoints.put("POST /api/items/{itemId}/use?userId=", "Sử dụng vật phẩm");

        apiInfo.put("endpoints", endpoints);

        Map<String, String> petTypes = new HashMap<>();
        petTypes.put("DOG", "Chó");
        petTypes.put("CAT", "Mèo");
        petTypes.put("BIRD", "Chim");
        petTypes.put("FISH", "Cá");
        petTypes.put("REPTILE", "Bò sát");
        petTypes.put("RABBIT", "Thỏ");
        petTypes.put("HAMSTER", "Chuột hamster");
        petTypes.put("OTHER", "Khác");

        Map<String, String> rarityTypes = new HashMap<>();
        rarityTypes.put("COMMON", "Thường");
        rarityTypes.put("UNCOMMON", "Không phổ biến");
        rarityTypes.put("RARE", "Hiếm");
        rarityTypes.put("EPIC", "Sử thi");
        rarityTypes.put("LEGENDARY", "Huyền thoại");

        Map<String, String> itemTypes = new HashMap<>();
        itemTypes.put("FOOD", "Thức ăn");
        itemTypes.put("MEDICINE", "Thuốc");
        itemTypes.put("TOY", "Đồ chơi");
        itemTypes.put("ACCESSORY", "Phụ kiện");

        Map<String, Object> enums = new HashMap<>();
        enums.put("petTypes", petTypes);
        enums.put("rarityTypes", rarityTypes);
        enums.put("itemTypes", itemTypes);

        apiInfo.put("enums", enums);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("admin", "admin/admin123");
        credentials.put("demo", "demo/demo123");
        apiInfo.put("testCredentials", credentials);

        return ResponseEntity.ok(apiInfo);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "OK");
        health.put("message", "API đang hoạt động bình thường");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}
