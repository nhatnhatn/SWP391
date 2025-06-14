package com.mylittlepet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Pet")
public class PetTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PetID")
    private Integer petId;

    // Simple enum test
    public enum PetType {
        DOG,
        CAT,
        RABBIT
    }

    public enum RarityType {
        COMMON,
        RARE
    }

    public enum PetStatus {
        HAPPY,
        TIRED
    }
}
