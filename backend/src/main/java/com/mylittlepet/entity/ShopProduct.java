package com.mylittlepet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ShopProduct")
public class ShopProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShopProductID")
    private Integer shopProductId;

    @Column(name = "ShopID", nullable = false)
    private Integer shopId;

    @Column(name = "PetID", nullable = true)
    private Integer petID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AdminID", nullable = false)
    private User admin;

    @Column(name = "Name", nullable = false, length = 100)
    private String name;

    @Column(name = "Type", nullable = false, length = 20)
    private String type;

    @Column(name = "Description", length = 255)
    private String description;

    @Column(name = "ImageUrl", length = 255)
    private String imageUrl;

    @Column(name = "Price", nullable = false)
    private Integer price;

    @Column(name = "CurrencyType", nullable = false, length = 20)
    private String currencyType;

    @Column(name = "Quantity")
    private Integer quantity;

    @Column(name = "Status")    private Integer status = 1;

    // Constructors
    public ShopProduct() {
    }

    public ShopProduct(Integer shopId, Integer petID, User admin, String name, String type, String description,
            String imageUrl, Integer price, String currencyType, Integer quantity, Integer status) {
        this.shopId = shopId;
        this.petID = petID;
        this.admin = admin;
        this.name = name;
        this.type = type;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.currencyType = currencyType;
        this.quantity = quantity;
        this.status = status;
    }

    // Getters and Setters
    public Integer getShopProductId() {
        return shopProductId;
    }

    public void setShopProductId(Integer shopProductId) {
        this.shopProductId = shopProductId;
    }

    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    public Integer getPetID() {
        return petID;
    }

    public void setPetID(Integer petID) {
        this.petID = petID;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
