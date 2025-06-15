package com.mylittlepet.entity;

import java.io.Serializable;
import java.util.Objects;

public class GameRecordId implements Serializable {
    private Integer player;
    private Integer minigame;

    // Constructors
    public GameRecordId() {
    }

    public GameRecordId(Integer player, Integer minigame) {
        this.player = player;
        this.minigame = minigame;
    }

    // Getters and Setters
    public Integer getPlayer() {
        return player;
    }

    public void setPlayer(Integer player) {
        this.player = player;
    }

    public Integer getMinigame() {
        return minigame;
    }

    public void setMinigame(Integer minigame) {
        this.minigame = minigame;
    }

    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        GameRecordId that = (GameRecordId) o;
        return Objects.equals(player, that.player) && Objects.equals(minigame, that.minigame);
    }

    @Override
    public int hashCode() {
        return Objects.hash(player, minigame);
    }
}
