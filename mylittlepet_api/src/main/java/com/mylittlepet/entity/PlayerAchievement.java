package com.mylittlepet.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PlayerAchievement")
@IdClass(PlayerAchievementId.class)
public class PlayerAchievement {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", nullable = false)
    private User player;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AchievementID", nullable = false)
    private Achievement achievement;

    @Column(name = "EarnedAt")
    private LocalDateTime earnedAt = LocalDateTime.now();

    // Constructors
    public PlayerAchievement() {
    }

    public PlayerAchievement(User player, Achievement achievement) {
        this.player = player;
        this.achievement = achievement;
    }

    // Getters and Setters
    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Achievement getAchievement() {
        return achievement;
    }

    public void setAchievement(Achievement achievement) {
        this.achievement = achievement;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }
}
