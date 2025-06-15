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
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

            if (userOptional.isEmpty()) {
                return new LoginResponse(false, "Email not found");
            }

            User user = userOptional.get();

            // Check password (plain text comparison for development)
            if (!user.getPassword().equals(request.getPassword())) {
                return new LoginResponse(false, "Invalid password");
            }

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
