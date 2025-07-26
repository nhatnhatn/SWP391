package com.mylittlepet.controller;

import com.mylittlepet.dto.ApiResponse;
import com.mylittlepet.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * SessionController handles admin session management including:
 * - Session timeout monitoring
 * - Token refresh
 * - Session status checks
 * - Auto-logout warnings
 */
@RestController
@RequestMapping("/api/session")
public class SessionController {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Get current session status including remaining time
     * 
     * @param request HTTP request containing JWT token
     * @return Session status with remaining time and warning flag
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSessionStatus(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No valid token found"));
            }

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid or expired token"));
            }

            long remainingTimeInMs = jwtTokenProvider.getRemainingTimeInMs(token);
            boolean isAboutToExpire = jwtTokenProvider.isTokenAboutToExpire(token);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("remainingTimeInMs", remainingTimeInMs);
            response.put("remainingTimeInMinutes", remainingTimeInMs / (1000 * 60));
            response.put("isAboutToExpire", isAboutToExpire);
            response.put("message",
                    isAboutToExpire ? "Session will expire soon. Please refresh or you will be logged out."
                            : "Session is active");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Failed to get session status: " + e.getMessage()));
        }
    }

    /**
     * Refresh the current session token
     * 
     * @param request HTTP request containing JWT token
     * @return New refreshed token with extended expiration
     */
    @PostMapping("/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> refreshSession(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No valid token found"));
            }

            String newToken = jwtTokenProvider.refreshToken(token);
            if (newToken == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Failed to refresh token"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", newToken);
            response.put("message", "Session refreshed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Failed to refresh session: " + e.getMessage()));
        }
    }

    /**
     * Manually logout and invalidate session
     * 
     * @param request HTTP request containing JWT token
     * @return Logout confirmation
     */
    @PostMapping("/logout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        try {
            // In a more sophisticated implementation, you could maintain a blacklist
            // of invalidated tokens or use Redis to track active sessions

            return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Logout failed: " + e.getMessage()));
        }
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Create standardized error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
