package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "CareActivity")
public class CareActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ActivityID")
    private Integer activityId;

    @NotBlank
    @Size(max = 50)
    @Column(name = "ActivityType", nullable = false)
    private String activityType;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    // Constructors
    public CareActivity() {
    }

    public CareActivity(String activityType, String description) {
        this.activityType = activityType;
        this.description = description;
    }

    // Getters and Setters
    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "CareActivity{" +
                "activityId=" + activityId +
                ", activityType='" + activityType + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
