package com.mylittlepet.repository;

import com.mylittlepet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Integer> {

        List<Pet> findByPetType(String petType);

        @Query("SELECT p FROM Pet p WHERE p.admin.id = :adminId")
        List<Pet> findByAdminId(@Param("adminId") Integer adminId);

        @Query("SELECT p FROM Pet p WHERE p.petType = :petType AND p.admin.id = :adminId")
        List<Pet> findByPetTypeAndAdminId(@Param("petType") String petType, @Param("adminId") Integer adminId);

        @Query("SELECT p FROM Pet p ORDER BY p.createdDate DESC")
        List<Pet> findAllOrderByCreatedDateDesc();
}
