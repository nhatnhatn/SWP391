package com.mylittlepet.entity;

import java.io.Serializable;
import java.util.Objects;

public class PlayerAchievementId implements Serializable {
    private Integer player;
    private Integer achievement;

    // Constructors
    public PlayerAchievementId() {
    }

    public PlayerAchievementId(Integer player, Integer achievement) {
        this.player = player;
        this.achievement = achievement;
    }

    // Getters and Setters
    public Integer getPlayer() {
        return player;
    }

    public void setPlayer(Integer player) {
        this.player = player;
    }

    public Integer getAchievement() {
        return achievement;
    }

    public void setAchievement(Integer achievement) {
        this.achievement = achievement;
    }

    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        PlayerAchievementId that = (PlayerAchievementId) o;
        return Objects.equals(player, that.player) && Objects.equals(achievement, that.achievement);
    }

    @Override
    public int hashCode() {
        return Objects.hash(player, achievement);
    }
}
