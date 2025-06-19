package com.mylittlepet.repository;

import com.mylittlepet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Integer> {

    // Find all pets
    @Query("SELECT p FROM Pet p ORDER BY p.petId DESC")
    List<Pet> findAllPets();

    // Find pet by ID
    @Query("SELECT p FROM Pet p WHERE p.petId = :petId")
    Optional<Pet> findPetById(@Param("petId") Integer petId);

    // Find pets by type
    @Query("SELECT p FROM Pet p WHERE p.petType = :petType ORDER BY p.petId DESC")
    List<Pet> findPetsByType(@Param("petType") String petType);

    // Find pets by status
    @Query("SELECT p FROM Pet p WHERE p.petStatus = :status ORDER BY p.petId DESC")
    List<Pet> findPetsByStatus(@Param("status") Integer status);

    // Search pets by name or type
    @Query("SELECT p FROM Pet p WHERE p.petDefaultName LIKE %:keyword% OR p.petType LIKE %:keyword% ORDER BY p.petId DESC")
    List<Pet> searchPets(@Param("keyword") String keyword);

    // Update pet information
    @Modifying
    @Transactional
    @Query("UPDATE Pet p SET p.petType = :petType, p.petDefaultName = :petDefaultName, " +
            "p.description = :description, p.petStatus = :petStatus WHERE p.petId = :petId")
    int updatePet(@Param("petId") Integer petId, @Param("petType") String petType,
            @Param("petDefaultName") String petDefaultName, @Param("description") String description,
            @Param("petStatus") Integer petStatus);

    // Delete pet (update status to 0)
    @Modifying
    @Transactional
    @Query("UPDATE Pet p SET p.petStatus = 0 WHERE p.petId = :petId")
    int deletePet(@Param("petId") Integer petId);
}
