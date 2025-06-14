package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Minigame")
public class Minigame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MinigameID")
    private Integer minigameId;

    @Column(name = "Name", nullable = false, length = 100)
    @NotBlank(message = "Minigame name is required")
    @Size(min = 1, max = 100, message = "Minigame name must be between 1 and 100 characters")
    private String name;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    // Relationships
    @OneToMany(mappedBy = "minigame", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GameRecord> gameRecords = new ArrayList<>();

    // Constructors
    public Minigame() {
    }

    public Minigame(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public Integer getMinigameId() {
        return minigameId;
    }

    public void setMinigameId(Integer minigameId) {
        this.minigameId = minigameId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<GameRecord> getGameRecords() {
        return gameRecords;
    }

    public void setGameRecords(List<GameRecord> gameRecords) {
        this.gameRecords = gameRecords;
    }
}
