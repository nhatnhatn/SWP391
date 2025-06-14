package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name = "CareHistory")
public class CareHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CareHistoryID")
    private Integer careHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerPetID", nullable = false)
    private PlayerPet playerPet;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ActivityID", nullable = false)
    private CareActivity careActivity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", nullable = false)
    private User player;
    @Column(name = "PerformedAt", nullable = false)
    private LocalDateTime performedAt = LocalDateTime.now();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemUsedID")
    private Item itemUsed;

    @Column(name = "CoinsSpent")
    @Min(value = 0, message = "Coins spent cannot be negative")
    private Integer coinsSpent = 0;

    @Column(name = "ExperienceGained")
    @Min(value = 0, message = "Experience gained cannot be negative")
    private Integer experienceGained = 0;

    // Constructors
    public CareHistory() {
    }

    public CareHistory(PlayerPet playerPet, CareActivity careActivity) {
        this.playerPet = playerPet;
        this.careActivity = careActivity;
    }

    public CareHistory(PlayerPet playerPet, CareActivity careActivity, Item itemUsed, Integer coinsSpent,
            Integer experienceGained) {
        this.playerPet = playerPet;
        this.careActivity = careActivity;
        this.itemUsed = itemUsed;
        this.coinsSpent = coinsSpent;
        this.experienceGained = experienceGained;
    }

    // Getters and Setters
    public Integer getCareHistoryId() {
        return careHistoryId;
    }

    public void setCareHistoryId(Integer careHistoryId) {
        this.careHistoryId = careHistoryId;
    }

    public PlayerPet getPlayerPet() {
        return playerPet;
    }

    public void setPlayerPet(PlayerPet playerPet) {
        this.playerPet = playerPet;
    }

    public CareActivity getCareActivity() {
        return careActivity;
    }

    public void setCareActivity(CareActivity careActivity) {
        this.careActivity = careActivity;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Item getItemUsed() {
        return itemUsed;
    }

    public void setItemUsed(Item itemUsed) {
        this.itemUsed = itemUsed;
    }

    public Integer getCoinsSpent() {
        return coinsSpent;
    }

    public void setCoinsSpent(Integer coinsSpent) {
        this.coinsSpent = coinsSpent;
    }

    public Integer getExperienceGained() {
        return experienceGained;
    }

    public void setExperienceGained(Integer experienceGained) {
        this.experienceGained = experienceGained;
    }

    @Override
    public String toString() {
        return "CareHistory{" +
                "careHistoryId=" + careHistoryId +
                ", performedAt=" + performedAt +
                ", coinsSpent=" + coinsSpent +
                ", experienceGained=" + experienceGained +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof CareHistory))
            return false;
        CareHistory that = (CareHistory) o;
        return careHistoryId != null && careHistoryId.equals(that.careHistoryId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // Enum definition
    public enum CareType {
        FEEDING,
        PLAYING,
        CLEANING,
        MEDICINE,
        TRAINING,
        EXERCISE,
        GROOMING,
        RESTING,
        SOCIALIZING,
        CHECKUP
    }
}
