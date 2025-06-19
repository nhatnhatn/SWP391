package com.mylittlepet.dto;

public class ShopDTO {
    private Integer shopId;
    private String name;
    private String type;
    private String description;

    // Constructors
    public ShopDTO() {
    }

    public ShopDTO(Integer shopId, String name, String type, String description) {
        this.shopId = shopId;
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

    @Override
    public String toString() {
        return "ShopDTO{" +
                "shopId=" + shopId +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
