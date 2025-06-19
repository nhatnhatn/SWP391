package com.mylittlepet.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Shop")
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShopID")
    private Integer shopId;

    @Column(name = "Name", nullable = false, length = 100)
    private String name;

    @Column(name = "Type", length = 10)
    private String type;

    @Column(name = "Description", length = 255)
    private String description;

    // One shop can have many products
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ShopProduct> shopProducts;

    // Constructors
    public Shop() {
    }

    public Shop(String name, String type, String description) {
        this.name = name;
        this.type = type;
        this.description = description;
    }

    // Getters and Setters
    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ShopProduct> getShopProducts() {
        return shopProducts;
    }

    public void setShopProducts(List<ShopProduct> shopProducts) {
        this.shopProducts = shopProducts;
    }
}
