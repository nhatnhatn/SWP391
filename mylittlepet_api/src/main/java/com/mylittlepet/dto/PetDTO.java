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
    
    private Long ownerId;
    private String ownerUsername;
    
    @Min(value = 1, message = "HP must be at least 1")
    private Integer hp;
    
    private List<String> abilities;
    private List<CareHistoryDTO> careHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PetDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Pet.PetType getType() { return type; }
    public void setType(Pet.PetType type) { this.type = type; }

    public Pet.RarityType getRarity() { return rarity; }
    public void setRarity(Pet.RarityType rarity) { this.rarity = rarity; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }

    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }

    public List<String> getAbilities() { return abilities; }
    public void setAbilities(List<String> abilities) { this.abilities = abilities; }

    public List<CareHistoryDTO> getCareHistory() { return careHistory; }
    public void setCareHistory(List<CareHistoryDTO> careHistory) { this.careHistory = careHistory; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

// Summary DTO for embedded use
class PetSummaryDTO {
    private Long id;
    private String name;
    private Pet.PetType type;
    private Integer level;
    private Pet.RarityType rarity;

    // Constructors
    public PetSummaryDTO() {}

    public PetSummaryDTO(Long id, String name, Pet.PetType type, Integer level, Pet.RarityType rarity) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.level = level;
        this.rarity = rarity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Pet.PetType getType() { return type; }
    public void setType(Pet.PetType type) { this.type = type; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Pet.RarityType getRarity() { return rarity; }
    public void setRarity(Pet.RarityType rarity) { this.rarity = rarity; }
}
