package com.mylittlepet.dto;

public class PetSummaryDTO {
    private Long id;
    private String name;
    private String type;
    private Integer age;
    private String imageUrl;

    // Default constructor
    public PetSummaryDTO() {
    }

    // Constructor
    public PetSummaryDTO(Long id, String name, String type, Integer age, String imageUrl) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.age = age;
        this.imageUrl = imageUrl;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
