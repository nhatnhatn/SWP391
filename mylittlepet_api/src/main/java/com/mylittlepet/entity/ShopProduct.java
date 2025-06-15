package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ShopProduct")
public class ShopProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShopProductID")
    private Integer shopProductId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ShopID", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AdminID", nullable = false)
    private User admin;

    @Column(name = "Name", nullable = false, length = 100)
    @NotBlank(message = "Product name is required")
    @Size(min = 1, max = 100, message = "Product name must be between 1 and 100 characters")
    private String name;

    @Column(name = "Type", nullable = false, length = 20)
    @NotBlank(message = "Product type is required")
    private String type;

    @Column(name = "Description", length = 255)
    private String description;

    @Column(name = "ImageUrl", length = 255)
    private String imageUrl;

    @Column(name = "Price", nullable = false)
    @Min(value = 0, message = "Price must be non-negative")
    private Integer price;

    @Column(name = "CurrencyType", nullable = false, length = 20)
    @NotBlank(message = "Currency type is required")
    private String currencyType;

    @Column(name = "Quality")
    private Integer quality = 100;

    // Relationships
    @OneToMany(mappedBy = "shopProduct", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PlayerInventory> playerInventories = new ArrayList<>();

    // Constructors
    public ShopProduct() {
    }

    public ShopProduct(Shop shop, User admin, String name, String type, String description,
            String imageUrl, Integer price, String currencyType) {
        this.shop = shop;
        this.admin = admin;
        this.name = name;
        this.type = type;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.currencyType = currencyType;
    }

    // Getters and Setters
    public Integer getShopProductId() {
        return shopProductId;
    }

    public void setShopProductId(Integer shopProductId) {
        this.shopProductId = shopProductId;
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

    public List<PlayerInventory> getPlayerInventories() {
        return playerInventories;
    }

    public void setPlayerInventories(List<PlayerInventory> playerInventories) {
        this.playerInventories = playerInventories;
    }
}
