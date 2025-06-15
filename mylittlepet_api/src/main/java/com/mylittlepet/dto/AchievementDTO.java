package com.mylittlepet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class AchievementDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String title;
    private String description;
    private String badge;
    private Integer points;
    private Boolean isUnlocked;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime unlockedAt;

    // Constructors
    public AchievementDTO() {
    }

    public AchievementDTO(Long id, Long userId, String userName, String title,
            String description, String badge, Integer points,
            Boolean isUnlocked, LocalDateTime unlockedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.title = title;
        this.description = description;
        this.badge = badge;
        this.points = points;
        this.isUnlocked = isUnlocked;
        this.unlockedAt = unlockedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Boolean getIsUnlocked() {
        return isUnlocked;
    }

    public void setIsUnlocked(Boolean isUnlocked) {
        this.isUnlocked = isUnlocked;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}
