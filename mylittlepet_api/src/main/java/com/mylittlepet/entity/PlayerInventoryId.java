package com.mylittlepet.entity;

import java.io.Serializable;
import java.util.Objects;

public class PlayerInventoryId implements Serializable {
    private Integer player;
    private Integer shopProduct;

    // Constructors
    public PlayerInventoryId() {
    }

    public PlayerInventoryId(Integer player, Integer shopProduct) {
        this.player = player;
        this.shopProduct = shopProduct;
    }

    // Getters and Setters
    public Integer getPlayer() {
        return player;
    }

    public void setPlayer(Integer player) {
        this.player = player;
    }

    public Integer getShopProduct() {
        return shopProduct;
    }

    public void setShopProduct(Integer shopProduct) {
        this.shopProduct = shopProduct;
    }

    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        PlayerInventoryId that = (PlayerInventoryId) o;
        return Objects.equals(player, that.player) && Objects.equals(shopProduct, that.shopProduct);
    }

    @Override
    public int hashCode() {
        return Objects.hash(player, shopProduct);
    }
}
