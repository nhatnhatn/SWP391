package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name = "PlayerInventory")
@IdClass(PlayerInventoryId.class)
public class PlayerInventory {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PlayerID", nullable = false)
    private User player;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ShopProductID", nullable = false)
    private ShopProduct shopProduct;

    @Column(name = "Quantity")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    @Column(name = "AcquiredAt")
    private LocalDateTime acquiredAt = LocalDateTime.now();

    // Constructors
    public PlayerInventory() {
    }

    public PlayerInventory(User player, ShopProduct shopProduct, Integer quantity) {
        this.player = player;
        this.shopProduct = shopProduct;
        this.quantity = quantity;
    }

    // Getters and Setters
    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public ShopProduct getShopProduct() {
        return shopProduct;
    }

    public void setShopProduct(ShopProduct shopProduct) {
        this.shopProduct = shopProduct;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getAcquiredAt() {
        return acquiredAt;
    }

    public void setAcquiredAt(LocalDateTime acquiredAt) {
        this.acquiredAt = acquiredAt;
    }
}
