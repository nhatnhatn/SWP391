package com.mylittlepet.service;

import com.mylittlepet.dto.*;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public RegisterResponse register(RegisterRequest request) {
        try {
            // Check if passwords match
            if (!request.isPasswordMatching()) {
                return new RegisterResponse(false, "Passwords do not match");
            }

            // Validate username format (only letters, numbers, underscore)
            if (!request.getUsername().matches("^[a-zA-Z0-9_]+$")) {
                return new RegisterResponse(false, "Username can only contain letters, numbers, and underscores");
            }

            // Check if username already exists
            if (userRepository.existsByUserName(request.getUsername())) {
                return new RegisterResponse(false, "Username already exists");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return new RegisterResponse(false, "Email already exists");
            } // Create new user
            User user = new User(
                    request.getUsername(),
                    request.getPassword(), // Store plain password for development
                    request.getEmail());

            // Save user
            User savedUser = userRepository.save(user); // Create admin info
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
            System.out.println("🔍 DEBUG: Login attempt for email: " + request.getEmail());
            System.out.println("🔍 DEBUG: Login attempt for password: " + request.getPassword());

            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

            System.out.println("🔍 DEBUG: User found: " + !userOptional.isEmpty());

            if (userOptional.isEmpty()) {
                System.out.println("❌ DEBUG: Email not found in database");
                return new LoginResponse(false, "Email not found");
            }
            User user = userOptional.get();

            System.out.println("🔍 DEBUG: Retrieved user email: " + user.getEmail());
            System.out.println("🔍 DEBUG: Retrieved user password: " + user.getPassword());
            System.out.println("🔍 DEBUG: Input password: " + request.getPassword());

            // Check password (plain text comparison for development)
            if (!user.getPassword().equals(request.getPassword())) {
                System.out.println("❌ DEBUG: Password mismatch!");
                return new LoginResponse(false, "Invalid password");
            }

            System.out.println("✅ DEBUG: Login successful for user: " + user.getUserName());

            // Create admin info
            AdminInfo adminInfo = new AdminInfo(
                    user.getId().longValue(),
                    user.getUserName(),
                    user.getEmail(),
                    user.getRole());

            return new LoginResponse(true, "Login successful", adminInfo);

        } catch (Exception e) {
            return new LoginResponse(false, "Login failed: " + e.getMessage());
        }
    }
}
