package com.mylittlepet.dto;

import com.mylittlepet.entity.Pet;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class PetDTO {
    private Long id;

    @NotBlank(message = "Pet name is required")
    @Size(min = 1, max = 100, message = "Pet name must be between 1 and 100 characters")
    private String name;

    @NotNull(message = "Pet type is required")
    private Pet.PetType type;
    @NotNull(message = "Rarity is required")
    private Pet.RarityType rarity;

    @Min(value = 1, message = "Level must be at least 1")
    private Integer level;

    private Pet.PetStatus status;

    private String description;

    private String imageUrl;

    // Pet stats
    private Integer attack;
    private Integer defense;
    private Integer speed;
    private Integer maxHealth;
    private Integer health;
    private Integer happiness;
    private Integer energy;
    private Integer hunger;

    private Long ownerId;
    private String ownerUsername;

    @Min(value = 1, message = "HP must be at least 1")
    private Integer hp;

    private List<String> abilities;
    private List<CareHistoryDTO> careHistory;
    private PetSummaryDTO summary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PetDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Pet.PetType getType() {
        return type;
    }

    public void setType(Pet.PetType type) {
        this.type = type;
    }

    public Pet.RarityType getRarity() {
        return rarity;
    }

    public void setRarity(Pet.RarityType rarity) {
        this.rarity = rarity;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Pet.PetStatus getStatus() {
        return status;
    }

    public void setStatus(Pet.PetStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getAttack() {
        return attack;
    }

    public void setAttack(Integer attack) {
        this.attack = attack;
    }

    public Integer getDefense() {
        return defense;
    }

    public void setDefense(Integer defense) {
        this.defense = defense;
    }

    public Integer getSpeed() {
        return speed;
    }

    public void setSpeed(Integer speed) {
        this.speed = speed;
    }

    public Integer getMaxHealth() {
        return maxHealth;
    }

    public void setMaxHealth(Integer maxHealth) {
        this.maxHealth = maxHealth;
    }

    public Integer getHealth() {
        return health;
    }

    public void setHealth(Integer health) {
        this.health = health;
    }

    public Integer getHappiness() {
        return happiness;
    }

    public void setHappiness(Integer happiness) {
        this.happiness = happiness;
    }

    public Integer getEnergy() {
        return energy;
    }

    public void setEnergy(Integer energy) {
        this.energy = energy;
    }

    public Integer getHunger() {
        return hunger;
    }

    public void setHunger(Integer hunger) {
        this.hunger = hunger;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public void setOwnerName(String ownerName) {
        this.ownerUsername = ownerName;
    }

    public Integer getHp() {
        return hp;
    }

    public void setHp(Integer hp) {
        this.hp = hp;
    }

    public List<String> getAbilities() {
        return abilities;
    }

    public void setAbilities(List<String> abilities) {
        this.abilities = abilities;
    }

    public List<CareHistoryDTO> getCareHistory() {
        return careHistory;
    }

    public void setCareHistory(List<CareHistoryDTO> careHistory) {
        this.careHistory = careHistory;
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

    public PetSummaryDTO getSummary() {
        return summary;
    }

    public void setSummary(PetSummaryDTO summary) {
        this.summary = summary;
    }
}
