package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "care_history")
@EntityListeners(AuditingEntityListener.class)
public class CareHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;
    @Column(name = "pet_name", nullable = false)
    @NotBlank(message = "Pet name is required")
    private String petName;

    @Enumerated(EnumType.STRING)
    @Column(name = "care_type", nullable = false)
    private CareType careType;

    @Column(nullable = false)
    @NotBlank(message = "Action is required")
    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime date;

    @Column(name = "care_date")
    private LocalDateTime careDate;

    // Constructors
    public CareHistory() {
    }

    public CareHistory(User user, Pet pet, String petName, String action, String details) {
        this.user = user;
        this.pet = pet;
        this.petName = petName;
        this.action = action;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public CareType getCareType() {
        return careType;
    }

    public void setCareType(CareType careType) {
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

    // Enum for care types
    public enum CareType {
        FEED("Feed"),
        PLAY("Play"),
        REST("Rest"),
        HEAL("Heal"),
        CLEAN("Clean"),
        TRAIN("Train");

        private final String displayName;

        CareType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
