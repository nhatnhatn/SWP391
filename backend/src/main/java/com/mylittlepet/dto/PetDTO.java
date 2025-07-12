package com.mylittlepet.dto;

public class PetDTO {
    private Integer petId;
    private Integer adminId;
    private String petType;
    private String petDefaultName;
    private String description;
    private Integer petStatus;

    // Constructors
    public PetDTO() {
    }

    public PetDTO(Integer petId, Integer adminId, String petType, String petDefaultName,
            String description, Integer petStatus) {
        this.petId = petId;
        this.adminId = adminId;
        this.petType = petType;
        this.petDefaultName = petDefaultName;
        this.description = description;
        this.petStatus = petStatus;
    }

    // Getters and Setters
    public Integer getPetId() {
        return petId;
    }

    public void setPetId(Integer petId) {
        this.petId = petId;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
    }

    public String getPetType() {
        return petType;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public String getPetDefaultName() {
        return petDefaultName;
    }

    public void setPetDefaultName(String petDefaultName) {
        this.petDefaultName = petDefaultName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPetStatus() {
        return petStatus;
    }

    public void setPetStatus(Integer petStatus) {
        this.petStatus = petStatus;
    }
}
