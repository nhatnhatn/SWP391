package com.mylittlepet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class UserInventoryDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long itemId;
    private String itemName;
    private Integer quantity;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime obtainedAt;

    // Constructors
    public UserInventoryDTO() {
    }

    public UserInventoryDTO(Long id, Long userId, String userName, Long itemId,
            String itemName, Integer quantity, LocalDateTime obtainedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantity = quantity;
        this.obtainedAt = obtainedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getObtainedAt() {
        return obtainedAt;
    }

    public void setObtainedAt(LocalDateTime obtainedAt) {
        this.obtainedAt = obtainedAt;
    }
}
