package com.mylittlepet.dto;

import com.mylittlepet.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class UserDTO {
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String password;
    private String fullName;
    private String phone;
    private String address;
    private User.UserRole role;
    private Integer experience;
    private Integer coins;
    private Integer level;
    private LocalDateTime registeredAt;
    private LocalDateTime lastLogin;
    private User.UserStatus status;
    private Integer totalPets;
    private Integer totalItems;
    private Integer totalAchievements;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // For detailed view
    private List<PetSummaryDTO> pets;
    private List<CareHistoryDTO> careHistory;
    private List<UserInventoryDTO> inventory;
    private List<AchievementDTO> achievements;
    private List<ActivityLogDTO> activityLogs;
    private List<ReportDTO> reports;
    private List<AdminNoteDTO> adminNotes;
    private List<AdminHistoryDTO> adminHistory;

    // Constructors
    public UserDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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
    }

    public User.UserRole getRole() {
        return role;
    }

    public void setRole(User.UserRole role) {
        this.role = role;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public Integer getCoins() {
        return coins;
    }

    public void setCoins(Integer coins) {
        this.coins = coins;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public User.UserStatus getStatus() {
        return status;
    }

    public void setStatus(User.UserStatus status) {
        this.status = status;
    }

    public Integer getTotalPets() {
        return totalPets;
    }

    public void setTotalPets(Integer totalPets) {
        this.totalPets = totalPets;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getTotalAchievements() {
        return totalAchievements;
    }

    public void setTotalAchievements(Integer totalAchievements) {
        this.totalAchievements = totalAchievements;
    }

    public List<PetSummaryDTO> getPets() {
        return pets;
    }

    public void setPets(List<PetSummaryDTO> pets) {
        this.pets = pets;
    }

    public List<CareHistoryDTO> getCareHistory() {
        return careHistory;
    }

    public void setCareHistory(List<CareHistoryDTO> careHistory) {
        this.careHistory = careHistory;
    }

    public List<UserInventoryDTO> getInventory() {
        return inventory;
    }

    public void setInventory(List<UserInventoryDTO> inventory) {
        this.inventory = inventory;
    }

    public List<AchievementDTO> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDTO> achievements) {
        this.achievements = achievements;
    }

    public List<ActivityLogDTO> getActivityLogs() {
        return activityLogs;
    }

    public void setActivityLogs(List<ActivityLogDTO> activityLogs) {
        this.activityLogs = activityLogs;
    }

    public List<ReportDTO> getReports() {
        return reports;
    }

    public void setReports(List<ReportDTO> reports) {
        this.reports = reports;
    }

    public List<AdminNoteDTO> getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(List<AdminNoteDTO> adminNotes) {
        this.adminNotes = adminNotes;
    }

    public List<AdminHistoryDTO> getAdminHistory() {
        return adminHistory;
    }

    public void setAdminHistory(List<AdminHistoryDTO> adminHistory) {
        this.adminHistory = adminHistory;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
