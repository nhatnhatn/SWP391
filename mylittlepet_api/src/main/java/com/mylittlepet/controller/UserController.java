package com.mylittlepet.controller;

import com.mylittlepet.dto.UserDTO;
import com.mylittlepet.entity.User;
import com.mylittlepet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Users", description = "User management operations")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserService userService;

    @Operation(
        summary = "Get all users",
        description = "Retrieve a list of all users in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "400", description = "Bad request")
    })
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get users with pagination",
        description = "Retrieve users with page and size parameters for better performance"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paginated users retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid pagination parameters")
    })
    @GetMapping("/paginated")
    public ResponseEntity<Page<UserDTO>> getAllUsersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserDTO> users = userService.getAllUsersWithPagination(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get user by ID",
        description = "Retrieve a specific user by their unique identifier"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "400", description = "Invalid user ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        try {
            Optional<UserDTO> user = userService.getUserById(id);
            return user.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get user by email",
        description = "Retrieve a user by their email address"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found successfully"),
        @ApiResponse(responseCode = "404", description = "User with email not found"),
        @ApiResponse(responseCode = "400", description = "Invalid email format")
    })
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        try {
            Optional<UserDTO> user = userService.getUserByEmail(email);
            return user.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get user by username",
        description = "Retrieve a user by their username"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found successfully"),
        @ApiResponse(responseCode = "404", description = "User with username not found"),
        @ApiResponse(responseCode = "400", description = "Invalid username")
    })
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        try {
            Optional<UserDTO> user = userService.getUserByUsername(username);
            return user.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Search users",
        description = "Search users by keyword (username, email, or full name)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String keyword) {
        try {
            List<UserDTO> users = userService.searchUsers(keyword);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get users by status",
        description = "Retrieve users filtered by their account status (ACTIVE, INACTIVE, BANNED)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status parameter")
    })
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserDTO>> getUsersByStatus(@PathVariable User.UserStatus status) {
        try {
            List<UserDTO> users = userService.getUsersByStatus(status);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Create new user",
        description = "Create a new user account for the Vietnamese Pet Management System"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data or email/username already exists")
    })
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Update user",
        description = "Update an existing user's information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Delete user",
        description = "Remove a user from the system permanently"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot delete user"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new SuccessResponse("Xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Update user statistics",
        description = "Update user's pet count and item count statistics"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User statistics updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid parameters"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/stats")
    public ResponseEntity<?> updateUserStats(@PathVariable Long id,
            @RequestParam int petCount,
            @RequestParam int itemCount) {
        try {
            UserDTO updatedUser = userService.updateUserStats(id, petCount, itemCount);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Add user experience",
        description = "Add experience points to user for leveling up in the pet management system"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experience added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid experience amount"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/experience")
    public ResponseEntity<?> addExperience(@PathVariable Long id, @RequestParam int experience) {
        try {
            UserDTO updatedUser = userService.addExperience(id, experience);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Update user coins",
        description = "Add or subtract coins from user's balance for purchasing items and pet care"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Coins updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid coin amount or insufficient balance"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/coins")
    public ResponseEntity<?> updateCoins(@PathVariable Long id, @RequestParam int coinChange) {
        try {
            UserDTO updatedUser = userService.updateCoins(id, coinChange);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Response classes
    public static class ErrorResponse {
        private String message;
        private String status = "error";

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class SuccessResponse {
        private String message;
        private String status = "success";

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
