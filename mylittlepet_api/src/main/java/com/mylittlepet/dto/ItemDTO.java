package com.mylittlepet.dto;

import com.mylittlepet.entity.Item.ItemType;
import com.mylittlepet.entity.Item.RarityType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.Map;

public class ItemDTO {
    private Long id;

    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Item type is required")
    private ItemType type;

    @NotNull(message = "Item rarity is required")
    private RarityType rarity;
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String imageUrl;

    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    private Double price;

    private Double sellPrice;

    private Boolean isInShop;

    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantity;
    private Map<String, String> stats;
    private Map<String, Integer> effects;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime obtainedAt;

    // Constructors
    public ItemDTO() {
    }

    public ItemDTO(Long id, String name, ItemType type, RarityType rarity,
            String description, Double price, Integer quantity,
            Map<String, String> stats, Map<String, Integer> effects,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.stats = stats;
        this.effects = effects;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public RarityType getRarity() {
        return rarity;
    }

    public void setRarity(RarityType rarity) {
        this.rarity = rarity;
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getSellPrice() {
        return sellPrice;
    }

    public void setSellPrice(Double sellPrice) {
        this.sellPrice = sellPrice;
    }

    public Boolean getIsInShop() {
        return isInShop;
    }

    public void setIsInShop(Boolean isInShop) {
        this.isInShop = isInShop;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Map<String, String> getStats() {
        return stats;
    }

    public void setStats(Map<String, String> stats) {
        this.stats = stats;
    }

    public Map<String, Integer> getEffects() {
        return effects;
    }

    public void setEffects(Map<String, Integer> effects) {
        this.effects = effects;
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

    public LocalDateTime getObtainedAt() {
        return obtainedAt;
    }

    public void setObtainedAt(LocalDateTime obtainedAt) {
        this.obtainedAt = obtainedAt;
    }
}
