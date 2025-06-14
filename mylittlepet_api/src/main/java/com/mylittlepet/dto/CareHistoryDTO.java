package com.mylittlepet.dto;

import com.mylittlepet.entity.CareHistory;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class CareHistoryDTO {
    private Long id;
    private Long petId;
    private String petName;
    private Long userId;
    private String userName;
    private CareHistory.CareType careType;
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime careDate;

    // Constructors
    public CareHistoryDTO() {
    }

    public CareHistoryDTO(Long id, Long petId, String petName, Long userId, String userName,
            CareHistory.CareType careType, String notes, LocalDateTime careDate) {
        this.id = id;
        this.petId = petId;
        this.petName = petName;
        this.userId = userId;
        this.userName = userName;
        this.careType = careType;
        this.notes = notes;
        this.careDate = careDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
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

    public CareHistory.CareType getCareType() {
        return careType;
    }

    public void setCareType(CareHistory.CareType careType) {
        this.careType = careType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCareDate() {
        return careDate;
    }

    public void setCareDate(LocalDateTime careDate) {
        this.careDate = careDate;
    }
}
