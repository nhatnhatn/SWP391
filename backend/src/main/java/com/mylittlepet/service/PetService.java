package com.mylittlepet.service;

import com.mylittlepet.dto.PetDTO;
import java.util.List;
import java.util.Optional;

public interface PetService {

    // Get all pets
    List<PetDTO> getAllPets();

    // Get pet by ID
    Optional<PetDTO> getPetById(Integer petId);

    // Get pets by type
    List<PetDTO> getPetsByType(String petType);

    // Get pets by status
    List<PetDTO> getPetsByStatus(Integer status);

    // Search pets
    List<PetDTO> searchPets(String keyword);

    // Create new pet
    PetDTO createPet(PetDTO petDTO);

    // Update pet
    PetDTO updatePet(Integer petId, PetDTO petDTO);

    // Delete pet (soft delete by changing status)
    boolean deletePet(Integer petId);
}
