package com.mylittlepet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Pet")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PetID")
    private Integer petId;

    @Column(name = "AdminID")
    private Integer adminId;

    @Column(name = "PetType", nullable = false, length = 50)
    private String petType;

    @Column(name = "PetDefaultName", nullable = false, length = 50)
    private String petDefaultName;

    @Column(name = "Description")
    private String description;

    @Column(name = "PetStatus")
    private Integer petStatus = 1;

    // Constructors
    public Pet() {
    }

    public Pet(String petType, String petDefaultName, String description) {
        this.petType = petType;
        this.petDefaultName = petDefaultName;
        this.description = description;
        this.petStatus = 1;
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
