package com.mylittlepet.dto;

public class ShopProductDTO {
    private Integer shopProductId;
    private Integer shopId;
    private String shopName;
    private Integer adminId;
    private String adminName;
    private String name;
    private String type;
    private String description;
    private String imageUrl;
    private Integer price;
    private String currencyType;
    private Integer quality; // Số lượng sản phẩm (quantity)
    private Integer status;

    // Constructors
    public ShopProductDTO() {
    }

    public ShopProductDTO(Integer shopProductId, Integer shopId, String shopName, Integer adminId, String adminName,
            String name, String type, String description, String imageUrl, Integer price,
            String currencyType, Integer quality, Integer status) {
        this.shopProductId = shopProductId;
        this.shopId = shopId;
        this.shopName = shopName;
        this.adminId = adminId;
        this.adminName = adminName;
        this.name = name;
        this.type = type;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.currencyType = currencyType;
        this.quality = quality;
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

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
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

    // Số lượng sản phẩm (quantity)
    public Integer getQuality() {
        return quality;
    }

    public void setQuality(Integer quality) {
        this.quality = quality;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "ShopProductDTO{" +
                "shopProductId=" + shopProductId +
                ", shopId=" + shopId +
                ", shopName='" + shopName + '\'' +
                ", adminId=" + adminId +
                ", adminName='" + adminName + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", price=" + price +
                ", currencyType='" + currencyType + '\'' +
                ", quality=" + quality +
                ", status=" + status +
                '}';
    }
}