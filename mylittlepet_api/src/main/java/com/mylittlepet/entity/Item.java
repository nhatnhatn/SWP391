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

    @NotBlank
    @Size(max = 20)
    @Column(name = "Type", nullable = false)
    private String type;

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

    // Constructors
    public Item() {
    }

    public Item(String name, String type, String description, String imageUrl,
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
}
