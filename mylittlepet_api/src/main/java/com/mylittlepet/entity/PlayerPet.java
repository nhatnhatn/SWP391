package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PlayerPet", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "PlayerID", "PetName" })
})
public class PlayerPet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PlayerPetID")
    private Integer playerPetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", nullable = false)
    private User player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PetID", nullable = false)
    private Pet pet;

    @Column(name = "PetName", length = 50)
    @Size(max = 50, message = "Pet name must not exceed 50 characters")
    private String petName;

    @Column(name = "AdoptedAt")
    private LocalDateTime adoptedAt = LocalDateTime.now();

    @Column(name = "Level")
    private Integer level = 0;

    @Column(name = "Status", length = 50)
    private String status;

    @Column(name = "LastStatusUpdate")
    private LocalDateTime lastStatusUpdate = LocalDateTime.now();

    // Relationships
    @OneToMany(mappedBy = "playerPet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CareHistory> careHistory = new ArrayList<>();

    // Constructors
    public PlayerPet() {
    }

    public PlayerPet(User player, Pet pet, String petName) {
        this.player = player;
        this.pet = pet;
        this.petName = petName;
    }

    // Getters and Setters
    public Integer getPlayerPetId() {
        return playerPetId;
    }

    public void setPlayerPetId(Integer playerPetId) {
        this.playerPetId = playerPetId;
    }

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastStatusUpdate() {
        return lastStatusUpdate;
    }

    public void setLastStatusUpdate(LocalDateTime lastStatusUpdate) {
        this.lastStatusUpdate = lastStatusUpdate;
    }

    public List<CareHistory> getCareHistory() {
        return careHistory;
    }

    public void setCareHistory(List<CareHistory> careHistory) {
        this.careHistory = careHistory;
    }
}
