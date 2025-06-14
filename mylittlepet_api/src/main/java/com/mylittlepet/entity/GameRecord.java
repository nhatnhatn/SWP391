package com.mylittlepet.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "GameRecord")
@IdClass(GameRecordId.class)
public class GameRecord {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", nullable = false)
    private User player;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MinigameID", nullable = false)
    private Minigame minigame;

    @Column(name = "PlayedAt")
    private LocalDateTime playedAt = LocalDateTime.now();

    @Column(name = "Score")
    private Integer score;

    // Constructors
    public GameRecord() {
    }

    public GameRecord(User player, Minigame minigame, Integer score) {
        this.player = player;
        this.minigame = minigame;
        this.score = score;
    }

    // Getters and Setters
    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Minigame getMinigame() {
        return minigame;
    }

    public void setMinigame(Minigame minigame) {
        this.minigame = minigame;
    }

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
