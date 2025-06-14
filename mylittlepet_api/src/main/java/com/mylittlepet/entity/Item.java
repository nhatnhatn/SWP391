package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "ShopProduct")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShopProductID")
    private Integer itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ShopID", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AdminID", nullable = false)
    private User admin;

    @NotBlank
    @Size(max = 100)
    @Column(name = "Name", nullable = false)
    private String name;
    @Enumerated(EnumType.STRING)
    @Column(name = "Type", nullable = false)
    private ItemType type;

    @Size(max = 255)
    @Column(name = "Description")
    private String description;

    @Size(max = 255)
    @Column(name = "ImageUrl")
    private String imageUrl;

    @NotNull
    @Column(name = "Price", nullable = false)
    private Integer price;

    @NotBlank
    @Size(max = 20)
    @Column(name = "CurrencyType", nullable = false)
    private String currencyType;

    @Column(name = "Quality")
    private Integer quality = 100;

    @Enumerated(EnumType.STRING)
    @Column(name = "Rarity")
    private RarityType rarity;

    @Column(name = "SellPrice")
    private Integer sellPrice;

    @Column(name = "IsInShop")
    private Boolean isInShop = true;

    @Column(name = "Stats", columnDefinition = "TEXT")
    private String stats; // JSON string for stats

    @Column(name = "Effects", columnDefinition = "TEXT")
    private String effects; // JSON string for effects

    @Column(name = "CreatedAt")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "UpdatedAt")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    // Constructors
    public Item() {
    }

    public Item(String name, ItemType type, String description, String imageUrl,
            Integer price, String currencyType, Integer quality) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.currencyType = currencyType;
        this.quality = quality;
    }

    // Getters and Setters
    public Integer getItemId() {
        return itemId;
    }

    public void setItemId(Integer itemId) {
        this.itemId = itemId;
    }

    public Shop getShop() {
        return shop;
    }

    public void setShop(Shop shop) {
        this.shop = shop;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
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

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getCurrencyType() {
        return currencyType;
    }

    public void setCurrencyType(String currencyType) {
        this.currencyType = currencyType;
    }

    public Integer getQuality() {
        return quality;
    }

    public void setQuality(Integer quality) {
        this.quality = quality;
    }

    public RarityType getRarity() {
        return rarity;
    }

    public void setRarity(RarityType rarity) {
        this.rarity = rarity;
    }

    public Integer getSellPrice() {
        return sellPrice;
    }

    public void setSellPrice(Integer sellPrice) {
        this.sellPrice = sellPrice;
    }

    public Boolean getIsInShop() {
        return isInShop;
    }

    public void setIsInShop(Boolean isInShop) {
        this.isInShop = isInShop;
    }

    public String getStats() {
        return stats;
    }

    public void setStats(String stats) {
        this.stats = stats;
    }

    public String getEffects() {
        return effects;
    }

    public void setEffects(String effects) {
        this.effects = effects;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return itemId != null ? itemId.longValue() : null;
    }

    public void setId(Long id) {
        this.itemId = id != null ? id.intValue() : null;
    }

    // Helper methods for Map/String conversions
    public void setStats(java.util.Map<String, String> statsMap) {
        if (statsMap != null && !statsMap.isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                this.stats = mapper.writeValueAsString(statsMap);
            } catch (Exception e) {
                this.stats = "{}";
            }
        } else {
            this.stats = null;
        }
    }

    public java.util.Map<String, String> getStatsMap() {
        if (stats == null || stats.trim().isEmpty()) {
            return new java.util.HashMap<>();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(stats,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {
                    });
        } catch (Exception e) {
            return new java.util.HashMap<>();
        }
    }

    public void setEffects(java.util.Map<String, Integer> effectsMap) {
        if (effectsMap != null && !effectsMap.isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                this.effects = mapper.writeValueAsString(effectsMap);
            } catch (Exception e) {
                this.effects = "{}";
            }
        } else {
            this.effects = null;
        }
    }

    public java.util.Map<String, Integer> getEffectsMap() {
        if (effects == null || effects.trim().isEmpty()) {
            return new java.util.HashMap<>();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(effects,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Integer>>() {
                    });
        } catch (Exception e) {
            return new java.util.HashMap<>();
        }
    }

    @Override
    public String toString() {
        return "Item{" +
                "itemId=" + itemId +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", currencyType='" + currencyType + '\'' +
                ", quality=" + quality +
                '}';
    }

    // Enum definitions
    public enum ItemType {
        FOOD,
        TOY,
        ACCESSORY,
        MEDICINE,
        DECORATION,
        CONSUMABLE,
        EQUIPMENT,
        PREMIUM,
        BASIC,
        SPECIAL
    }

    public enum RarityType {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY,
        MYTHIC
    }
}
