package com.mylittlepet.dto;

import java.time.LocalDateTime;

public class PlayerPetDTO {
    private Integer playerPetId;
    private String petCustomName;
    private Integer level;
    private LocalDateTime adoptedAt;

    // Pet default name từ bảng Pet
    private String petDefaultName;

    // Constructors
    public PlayerPetDTO() {
    }

    // Getters and Setters
    public Integer getPlayerPetId() {
        return playerPetId;
    }

    public void setPlayerPetId(Integer playerPetId) {
        this.playerPetId = playerPetId;
    }

    public String getPetCustomName() {
        return petCustomName;
    }

    public void setPetCustomName(String petCustomName) {
        this.petCustomName = petCustomName;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public LocalDateTime getAdoptedAt() {
        return adoptedAt;
    }

    public void setAdoptedAt(LocalDateTime adoptedAt) {
        this.adoptedAt = adoptedAt;
    }

    public String getPetDefaultName() {
        return petDefaultName;
    }

    public void setPetDefaultName(String petDefaultName) {
        this.petDefaultName = petDefaultName;
    }
}
