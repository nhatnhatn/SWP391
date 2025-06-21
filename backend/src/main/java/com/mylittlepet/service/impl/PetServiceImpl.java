package com.mylittlepet.service.impl;

import com.mylittlepet.dto.PetDTO;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.repository.PetRepository;
import com.mylittlepet.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;

    @Autowired
    public PetServiceImpl(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    @Override
    public List<PetDTO> getAllPets() {
        return petRepository.findAllPets().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PetDTO> getPetById(Integer petId) {
        return petRepository.findPetById(petId)
                .map(this::convertToDTO);
    }

    @Override
    public List<PetDTO> getPetsByType(String petType) {
        return petRepository.findPetsByType(petType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetDTO> getPetsByStatus(Integer status) {
        return petRepository.findPetsByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetDTO> searchPets(String keyword) {
        return petRepository.searchPets(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PetDTO createPet(PetDTO petDTO) {
        try {
            Pet pet = new Pet();
            pet.setPetType(petDTO.getPetType());
            pet.setPetDefaultName(petDTO.getPetDefaultName());
            pet.setDescription(petDTO.getDescription());
            pet.setPetStatus(petDTO.getPetStatus() != null ? petDTO.getPetStatus() : 1);
            pet.setAdminId(petDTO.getAdminId());

            Pet savedPet = petRepository.save(pet);
            return convertToDTO(savedPet);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create pet: " + e.getMessage());
        }
    }

    @Override
    public PetDTO updatePet(Integer petId, PetDTO petDTO) {
        try {
            // Check if pet exists
            Optional<Pet> existingPet = petRepository.findPetById(petId);
            if (existingPet.isEmpty()) {
                throw new RuntimeException("Pet not found");
            }

            Pet pet = existingPet.get();

            // Update fields
            String petType = petDTO.getPetType() != null ? petDTO.getPetType() : pet.getPetType();
            String petDefaultName = petDTO.getPetDefaultName() != null ? petDTO.getPetDefaultName()
                    : pet.getPetDefaultName();
            String description = petDTO.getDescription() != null ? petDTO.getDescription() : pet.getDescription();
            Integer petStatus = petDTO.getPetStatus() != null ? petDTO.getPetStatus() : pet.getPetStatus();

            int updatedRows = petRepository.updatePet(petId, petType, petDefaultName, description, petStatus);

            if (updatedRows > 0) {
                return petRepository.findPetById(petId)
                        .map(this::convertToDTO)
                        .orElse(null);
            } else {
                throw new RuntimeException("Update failed");
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to update pet: " + e.getMessage());
        }
    }

    @Override
    public boolean deletePet(Integer petId) {
        try {
            int updatedRows = petRepository.deletePet(petId);
            return updatedRows > 0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete pet: " + e.getMessage());
        }
    }

    // Convert Pet entity to PetDTO
    private PetDTO convertToDTO(Pet pet) {
        if (pet == null) {
            return null;
        }

        PetDTO dto = new PetDTO();
        dto.setPetId(pet.getPetId());
        dto.setAdminId(pet.getAdminId());
        dto.setPetType(pet.getPetType());
        dto.setPetDefaultName(pet.getPetDefaultName());
        dto.setDescription(pet.getDescription());
        dto.setPetStatus(pet.getPetStatus());
        return dto;
    }
}
