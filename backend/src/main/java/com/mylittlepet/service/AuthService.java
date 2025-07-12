package com.mylittlepet.service;

import com.mylittlepet.dto.*;
import com.mylittlepet.entity.PasswordResetToken;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.PasswordResetTokenRepository;
import com.mylittlepet.repository.UserRepository;
import com.mylittlepet.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public RegisterResponse register(RegisterRequest request) {
        try {
            // Check if passwords match
            if (!request.isPasswordMatching()) {
                return new RegisterResponse(false, "Passwords do not match");
            }

            // Check if username is null or empty (after trim)
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return new RegisterResponse(false, "Username cannot be empty");
            }

            // Check if username already exists
            if (userRepository.existsByUserName(request.getUsername())) {
                return new RegisterResponse(false, "Username already exists");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return new RegisterResponse(false, "Email already exists");
            }

            // Create new user with encoded password
            User user = new User(
                    "ADMIN", // role
                    request.getUsername(), // userName
                    request.getEmail(), // email
                    passwordEncoder.encode(request.getPassword())); // encoded password

            // Save user
            User savedUser = userRepository.save(user);

            // Create admin info
            AdminInfo adminInfo = new AdminInfo(
                    savedUser.getId().longValue(),
                    savedUser.getUserName(),
                    savedUser.getEmail(),
                    savedUser.getRole());

            return new RegisterResponse(true, "Registration successful", adminInfo);

        } catch (Exception e) {
            return new RegisterResponse(false, "Registration failed: " + e.getMessage());
        }
    }

    public LoginResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtTokenProvider.generateToken(authentication);

            // Find user for admin info
            Optional<User> userOptional = userRepository.findAdminByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                return new LoginResponse(false, "Email not found or not authorized for admin access");
            }
            User user = userOptional.get();

            // Create admin info
            AdminInfo adminInfo = new AdminInfo(
                    user.getId().longValue(),
                    user.getUserName(),
                    user.getEmail(),
                    user.getRole());

            return new LoginResponse(true, "Login successful", jwt, adminInfo);

        } catch (Exception e) {
            return new LoginResponse(false, "Login failed: " + e.getMessage());
        }
    }

    public ApiResponse requestPasswordReset(PasswordResetRequest request) {
        try {
            // Check if user exists
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                // Return success even if user doesn't exist for security reasons
                return new ApiResponse(true, "If the email exists, a password reset link has been sent.");
            }

            User user = userOptional.get();

            // Delete any existing reset tokens for this email
            passwordResetTokenRepository.deleteByEmail(request.getEmail());

            // Generate reset token
            String resetToken = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusHours(1); // Token expires in 1 hour

            // Save reset token
            PasswordResetToken passwordResetToken = new PasswordResetToken(
                    resetToken,
                    request.getEmail(),
                    expiryDate);
            passwordResetTokenRepository.save(passwordResetToken);

            // In a real application, you would send an email here
            // For now, we'll just return success
            return new ApiResponse(true, "Password reset token generated successfully. Token: " + resetToken);

        } catch (Exception e) {
            return new ApiResponse(false, "Password reset request failed: " + e.getMessage());
        }
    }

    public ApiResponse resetPassword(PasswordResetConfirmRequest request) {
        try {
            // Check if passwords match
            if (!request.isPasswordMatching()) {
                return new ApiResponse(false, "Passwords do not match");
            }

            // Find the reset token
            Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(request.getToken());
            if (tokenOptional.isEmpty()) {
                return new ApiResponse(false, "Invalid or expired reset token");
            }

            PasswordResetToken resetToken = tokenOptional.get();

            // Check if token is expired or used
            if (resetToken.isExpired() || resetToken.isUsed()) {
                return new ApiResponse(false, "Invalid or expired reset token");
            }

            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(resetToken.getEmail());
            if (userOptional.isEmpty()) {
                return new ApiResponse(false, "User not found");
            }

            User user = userOptional.get();

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            // Mark token as used
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);

            return new ApiResponse(true, "Password reset successful");

        } catch (Exception e) {
            return new ApiResponse(false, "Password reset failed: " + e.getMessage());
        }
    }
}
