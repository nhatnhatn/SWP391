package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@EntityListeners(AuditingEntityListener.class)
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Pet name is required")
    @Size(min = 1, max = 100, message = "Pet name must be between 1 and 100 characters")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RarityType rarity;

    @Column(nullable = false)
    @Min(value = 1, message = "Level must be at least 1")
    private Integer level = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    @Column(nullable = false)
    @Min(value = 1, message = "HP must be at least 1")
    private Integer hp = 100;

    // Pet status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetStatus status = PetStatus.HEALTHY;

    // Pet description and image
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    // Pet stats
    @Column(nullable = false)
    private Integer attack = 50;

    @Column(nullable = false)
    private Integer defense = 50;

    @Column(nullable = false)
    private Integer speed = 50;

    @Column(name = "max_health", nullable = false)
    private Integer maxHealth = 100;

    @Column(nullable = false)
    private Integer health = 100;

    @Column(nullable = false)
    private Integer happiness = 100;

    @Column(nullable = false)
    private Integer energy = 100;

    @Column(nullable = false)
    private Integer hunger = 0;

    @ElementCollection
    @CollectionTable(name = "pet_abilities", joinColumns = @JoinColumn(name = "pet_id"))
    @Column(name = "ability")
    private List<String> abilities = new ArrayList<>();

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CareHistory> careHistory = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Pet() {
    }

    public Pet(String name, PetType type, RarityType rarity, Integer level, User owner) {
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.level = level;
        this.owner = owner;
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

    public PetType getType() {
        return type;
    }

    public void setType(PetType type) {
        this.type = type;
    }

    public RarityType getRarity() {
        return rarity;
    }

    public void setRarity(RarityType rarity) {
        this.rarity = rarity;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
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

    public List<CareHistory> getCareHistory() {
        return careHistory;
    }

    public void setCareHistory(List<CareHistory> careHistory) {
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

    public PetStatus getStatus() {
        return status;
    }

    public void setStatus(PetStatus status) {
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

    // Enums
    public enum PetStatus {
        HEALTHY("Healthy"),
        SICK("Sick"),
        TIRED("Tired"),
        HUNGRY("Hungry"),
        HAPPY("Happy"),
        SAD("Sad");

        private final String displayName;

        PetStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum PetType {
        DRAGON("Dragon"),
        BIRD("Bird"),
        BEAST("Beast"),
        ELEMENTAL("Elemental"),
        FAIRY("Fairy"),
        REPTILE("Reptile"),
        MAGICAL("Magical"),
        SPIRIT("Spirit"),
        GOLEM("Golem");

        private final String displayName;

        PetType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum RarityType {
        COMMON("common"),
        UNCOMMON("uncommon"),
        RARE("rare"),
        EPIC("epic"),
        LEGENDARY("legendary"),
        MYTHIC("mythic");

        private final String value;

        RarityType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
