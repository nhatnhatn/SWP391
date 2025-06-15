package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name = "[User]") // Using brackets because User is a reserved word in SQL Server
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userId;

    @Column(name = "Username", nullable = false, unique = true, length = 50)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Column(name = "Email", nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Column(name = "PasswordHash", nullable = false, length = 255)
    @NotBlank(message = "Password is required")
    private String passwordHash;

    @Column(name = "Role", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.Player;

    @Column(name = "Coins", nullable = false)
    @Min(value = 0, message = "Coins cannot be negative")
    private Integer coins = 0;

    @Column(name = "Experience", nullable = false)
    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience = 0;

    @Column(name = "Level", nullable = false)
    @Min(value = 1, message = "Level must be at least 1")
    private Integer level = 1;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    @Column(name = "CreatedDate", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LastLoginDate")
    private LocalDateTime lastLoginDate;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Address", length = 255)
    private String address;

    // Constructors
    public User() {
    }

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public User(String username, String email, String passwordHash, UserRole role) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Integer getCoins() {
        return coins;
    }

    public void setCoins(Integer coins) {
        this.coins = coins;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastLoginDate() {
        return lastLoginDate;
    }

    public void setLastLoginDate(LocalDateTime lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    } // Legacy methods for compatibility with existing code

    public Integer getId() {
        return userId;
    }

    public void setId(Integer id) {
        this.userId = id;
    }

    public String getPassword() {
        return passwordHash;
    }

    public void setPassword(String password) {
        this.passwordHash = password;
    }

    public String getFullName() {
        return username; // Using username as full name for now
    }

    public void setFullName(String fullName) {
        // Optional: could store in separate field if needed
    }

    public UserStatus getStatus() {
        return isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    }

    public void setStatus(UserStatus status) {
        this.isActive = (status == UserStatus.ACTIVE);
    }

    public Integer getTotalPets() {
        return 0; // Placeholder - could be calculated from relationships
    }

    public void setTotalPets(Integer totalPets) {
        // Placeholder for compatibility
    }

    public Integer getTotalItems() {
        return 0; // Placeholder - could be calculated from relationships
    }

    public void setTotalItems(Integer totalItems) {
        // Placeholder for compatibility
    }

    public LocalDateTime getCreatedAt() {
        return createdDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdDate = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return createdDate; // Using created date as placeholder
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        // Placeholder for compatibility
    }

    public LocalDateTime getLastLogin() {
        return lastLoginDate;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLoginDate = lastLogin;
    }

    // Utility methods
    public void addCoins(Integer amount) {
        this.coins += amount;
    }

    public boolean subtractCoins(Integer amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    public void addExperience(Integer exp) {
        this.experience += exp;
        // Simple level calculation (every 100 exp = 1 level)
        int newLevel = (this.experience / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
    }

    public boolean isAdmin() {
        return role == UserRole.Admin;
    }

    public boolean isManager() {
        return role == UserRole.Manager || role == UserRole.Admin;
    }

    public boolean isPlayer() {
        return role == UserRole.Player;
    }

    // toString, equals, and hashCode
    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", coins=" + coins +
                ", experience=" + experience +
                ", level=" + level +
                ", isActive=" + isActive +
                ", createdDate=" + createdDate +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof User))
            return false;
        User user = (User) o;
        return userId != null && userId.equals(user.userId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    } // User Role Enum

    public enum UserRole {
        Player, Manager, Admin, USER, ADMIN // Added legacy values for compatibility
    } // User Status Enum

    public enum UserStatus {
        ACTIVE, INACTIVE, BANNED, PENDING, DELETED
    }
}
