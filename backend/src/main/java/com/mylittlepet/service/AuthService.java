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
        try { // Check if passwords match
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
            } // Create new user
            User user = new User(
                    "ADMIN", // role
                    request.getUsername(), // userName
                    request.getEmail(), // email
                    request.getPassword()); // password

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
        try { // Find admin user by email (exclude players)
            Optional<User> userOptional = userRepository.findAdminByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                return new LoginResponse(false, "Email not found or not authorized for admin access");
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
