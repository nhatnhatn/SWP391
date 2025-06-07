package com.mylittlepet.repository;

import com.mylittlepet.entity.Pet;
import com.mylittlepet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwner(User owner);

    Page<Pet> findByOwner(User owner, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.type) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Pet> findByNameContainingIgnoreCaseOrTypeContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);

    Page<Pet> findByType(Pet.PetType type, Pageable pageable);

    Page<Pet> findByRarity(Pet.RarityType rarity, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE p.type = :type AND p.rarity = :rarity")
    Page<Pet> findByTypeAndRarity(
            @Param("type") Pet.PetType type,
            @Param("rarity") Pet.RarityType rarity,
            Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.type) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:type IS NULL OR p.type = :type) AND " +
            "(:rarity IS NULL OR p.rarity = :rarity)")
    Page<Pet> findPetsWithFilters(
            @Param("search") String search,
            @Param("type") Pet.PetType type,
            @Param("rarity") Pet.RarityType rarity,
            Pageable pageable);

    long countByOwner(User owner);
}
