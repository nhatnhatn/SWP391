package com.mylittlepet.controller;

import com.mylittlepet.service.AuthService;
import com.mylittlepet.service.AuthService.*;
import com.mylittlepet.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Operation(
        summary = "User Login",
        description = "Authenticate user with email and password, returns JWT token"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(mediaType = "application/json", 
            schema = @Schema(implementation = AuthService.AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid credentials",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
        @Parameter(description = "Login credentials", required = true)
        @Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }    @Operation(
        summary = "User Registration", 
        description = "Register a new user account"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Registration successful",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = AuthService.AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Registration failed",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
        @Parameter(description = "Registration details", required = true)
        @Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }    @Operation(
        summary = "Change Password",
        description = "Change user password (requires authentication)",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
        @Parameter(description = "Bearer JWT token", required = true)
        @RequestHeader("Authorization") String token,
        @Parameter(description = "Password change request", required = true)
        @Valid @RequestBody ChangePasswordRequest request) {
        try {
            // Extract user ID from token (implementation depends on JWT service)
            Long userId = extractUserIdFromToken(token);
            authService.changePassword(userId, request);
            return ResponseEntity.ok(new SuccessResponse("Đổi mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Forgot Password",
        description = "Send temporary password to user's email"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Temporary password sent successfully"),
        @ApiResponse(responseCode = "400", description = "Email not found or invalid"),
        @ApiResponse(responseCode = "500", description = "Failed to send email")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
        @Parameter(description = "User email address", required = true)
        @RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok(new SuccessResponse("Mật khẩu tạm thời đã được gửi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @Operation(
        summary = "Reset Password",
        description = "Reset password using temporary password or reset token"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid token or password requirements not met"),
        @ApiResponse(responseCode = "401", description = "Reset token expired or invalid")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
        @Parameter(description = "Password reset request", required = true)
        @Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(new SuccessResponse("Đặt lại mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    private Long extractUserIdFromToken(String token) {
        // Remove "Bearer " prefix if present
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtService.getUserIdFromToken(token);
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
