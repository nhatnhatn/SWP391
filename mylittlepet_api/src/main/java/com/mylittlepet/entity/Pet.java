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

    // Enums
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
