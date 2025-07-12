package com.mylittlepet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PlayerPet")
public class PlayerPet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PlayerPetID")
    private Integer playerPetId;

    @Column(name = "PlayerID", nullable = false)
    private Integer playerId;

    @Column(name = "PetID", nullable = false)
    private Integer petId;

    @Column(name = "PetCustomName", length = 50)
    private String petCustomName;

    @Column(name = "AdoptedAt")
    private LocalDateTime adoptedAt;

    @Column(name = "Level")
    private Integer level = 1;

    @Column(name = "LastStatusUpdate")
    private LocalDateTime lastStatusUpdate;

    // Foreign key relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", insertable = false, updatable = false)
    private User player;

    // Constructors
    public PlayerPet() {
    }

    public PlayerPet(Integer playerId, Integer petId, String petCustomName) {
        this.playerId = playerId;
        this.petId = petId;
        this.petCustomName = petCustomName;
        this.adoptedAt = LocalDateTime.now();
        this.level = 1;
        this.lastStatusUpdate = LocalDateTime.now();
    }

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        if (this.adoptedAt == null) {
            this.adoptedAt = LocalDateTime.now();
        }
        if (this.lastStatusUpdate == null) {
            this.lastStatusUpdate = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Integer getPlayerPetId() {
        return playerPetId;
    }

    public void setPlayerPetId(Integer playerPetId) {
        this.playerPetId = playerPetId;
    }

    public Integer getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Integer playerId) {
        this.playerId = playerId;
    }

    public Integer getPetId() {
        return petId;
    }

    public void setPetId(Integer petId) {
        this.petId = petId;
    }

    public String getPetCustomName() {
        return petCustomName;
    }

    public void setPetCustomName(String petCustomName) {
        this.petCustomName = petCustomName;
    }

    public LocalDateTime getAdoptedAt() {
        return adoptedAt;
    }

    public void setAdoptedAt(LocalDateTime adoptedAt) {
        this.adoptedAt = adoptedAt;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public LocalDateTime getLastStatusUpdate() {
        return lastStatusUpdate;
    }

    public void setLastStatusUpdate(LocalDateTime lastStatusUpdate) {
        this.lastStatusUpdate = lastStatusUpdate;
    }

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }
}
