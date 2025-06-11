package com.mylittlepet.dto.examples;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Example DTOs for Swagger documentation
 * These provide clear examples for the Vietnamese Pet Management System
 */
public class SwaggerExamples {

    @Schema(description = "Authentication request example for Vietnamese Pet System")
    public static class LoginExample {
        @Schema(description = "User email", example = "admin@mylittlepet.com")
        public String email;
        
        @Schema(description = "User password", example = "admin123")
        public String password;
    }

    @Schema(description = "Registration request example")
    public static class RegisterExample {
        @Schema(description = "User email", example = "user@mylittlepet.com")
        public String email;
        
        @Schema(description = "User password", example = "password123")
        public String password;
        
        @Schema(description = "User full name", example = "Nguyễn Văn A")
        public String name;
    }

    @Schema(description = "Pet creation example for Vietnamese pets")
    public static class PetExample {
        @Schema(description = "Pet name", example = "Buddy")
        public String name;
        
        @Schema(description = "Pet type", example = "Dog", allowableValues = {"Dog", "Cat", "Bird", "Fish", "Reptile", "Rabbit", "Hamster", "Other"})
        public String type;
        
        @Schema(description = "Pet rarity", example = "Common", allowableValues = {"Common", "Uncommon", "Rare", "Epic", "Legendary"})
        public String rarity;
        
        @Schema(description = "Owner ID", example = "1")
        public Long ownerId;
        
        @Schema(description = "Pet happiness level (0-100)", example = "85", minimum = "0", maximum = "100")
        public Integer happiness;
        
        @Schema(description = "Pet health level (0-100)", example = "90", minimum = "0", maximum = "100")
        public Integer health;
        
        @Schema(description = "Pet energy level (0-100)", example = "75", minimum = "0", maximum = "100")
        public Integer energy;
        
        @Schema(description = "Pet hunger level (0-100)", example = "60", minimum = "0", maximum = "100")
        public Integer hunger;
    }

    @Schema(description = "Item example for Vietnamese Pet Shop")
    public static class ItemExample {
        @Schema(description = "Item name in Vietnamese", example = "Bánh mì thịt")
        public String name;
        
        @Schema(description = "Item description", example = "Thức ăn ngon cho thú cưng")
        public String description;
        
        @Schema(description = "Item type with emoji", example = "Food", allowableValues = {"Food", "Medicine", "Toy", "Accessory"})
        public String type;
        
        @Schema(description = "Item rarity", example = "Common", allowableValues = {"Common", "Uncommon", "Rare", "Epic", "Legendary"})
        public String rarity;
        
        @Schema(description = "Item price in coins", example = "50")
        public Integer price;
        
        @Schema(description = "Available quantity", example = "10")
        public Integer quantity;
        
        @Schema(description = "Item effects on pet stats")
        public ItemEffects effects;
    }

    @Schema(description = "Item effects on pet statistics")
    public static class ItemEffects {
        @Schema(description = "Happiness increase", example = "10")
        public Integer happiness;
        
        @Schema(description = "Health increase", example = "5")
        public Integer health;
        
        @Schema(description = "Energy increase", example = "15")
        public Integer energy;
        
        @Schema(description = "Hunger decrease", example = "20")
        public Integer hunger;
    }

    @Schema(description = "User profile example")
    public static class UserExample {
        @Schema(description = "User ID", example = "1")
        public Long id;
        
        @Schema(description = "User email", example = "admin@mylittlepet.com")
        public String email;
        
        @Schema(description = "User full name", example = "Quản trị viên")
        public String name;
        
        @Schema(description = "User role", example = "admin", allowableValues = {"admin", "user", "manager"})
        public String role;
        
        @Schema(description = "User coins balance", example = "1000")
        public Integer coins;
        
        @Schema(description = "User experience points", example = "500")
        public Integer experience;
        
        @Schema(description = "User level", example = "5")
        public Integer level;
    }

    @Schema(description = "API error response")
    public static class ErrorResponseExample {
        @Schema(description = "Error status", example = "error")
        public String status;
        
        @Schema(description = "Error message in Vietnamese", example = "Không tìm thấy thú cưng")
        public String message;
    }

    @Schema(description = "API success response")
    public static class SuccessResponseExample {
        @Schema(description = "Success status", example = "success")
        public String status;
        
        @Schema(description = "Success message in Vietnamese", example = "Thao tác thành công")
        public String message;
    }
}
