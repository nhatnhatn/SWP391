package com.mylittlepet.service;

import com.mylittlepet.dto.PetDTO;
import com.mylittlepet.dto.PetSummaryDTO;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.CareHistory;
import com.mylittlepet.repository.PetRepository;
import com.mylittlepet.repository.UserRepository;
import com.mylittlepet.repository.CareHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CareHistoryRepository careHistoryRepository;

    @Autowired
    private UserService userService;

    private final Random random = new Random();

    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<PetDTO> getAllPetsWithPagination(Pageable pageable) {
        return petRepository.findAll(pageable).map(this::convertToDTO);
    }

    public Optional<PetDTO> getPetById(Long id) {
        return petRepository.findById(id).map(this::convertToDTO);
    }

    public List<PetDTO> getPetsByOwner(Long ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PetDTO> getPetsByType(Pet.PetType type) {
        return petRepository.findByType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PetDTO> getPetsByRarity(Pet.RarityType rarity) {
        return petRepository.findByRarity(rarity).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PetDTO> searchPets(String keyword) {
        return petRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PetDTO> getAvailablePets() {
        return petRepository.findByStatus(Pet.PetStatus.HEALTHY).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PetDTO createPet(PetDTO petDTO) {
        User owner = userRepository.findById(petDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ sở hữu"));

        Pet pet = convertToEntity(petDTO);
        pet.setOwner(owner);
        pet.setStatus(Pet.PetStatus.HEALTHY);
        pet.setHappiness(100);
        pet.setEnergy(100);
        pet.setHealth(100);
        pet.setHunger(0);
        pet.setCreatedAt(LocalDateTime.now());
        pet.setUpdatedAt(LocalDateTime.now());

        // Generate random stats based on rarity
        generateRandomStats(pet);

        Pet savedPet = petRepository.save(pet);

        // Update user's pet count
        userService.updateUserStats(owner.getId(),
                petRepository.countByOwnerId(owner.getId()).intValue(),
                owner.getTotalItems());

        // Add experience for getting a new pet
        userService.addExperience(owner.getId(), 50);

        return convertToDTO(savedPet);
    }

    public PetDTO updatePet(Long id, PetDTO petDTO) {
        Pet existingPet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        // Update only non-null fields
        if (petDTO.getName() != null) {
            existingPet.setName(petDTO.getName());
        }

        if (petDTO.getType() != null) {
            existingPet.setType(petDTO.getType());
        }

        if (petDTO.getRarity() != null) {
            existingPet.setRarity(petDTO.getRarity());
        }

        if (petDTO.getStatus() != null) {
            existingPet.setStatus(petDTO.getStatus());
        }

        if (petDTO.getLevel() != null) {
            existingPet.setLevel(petDTO.getLevel());
        }

        if (petDTO.getDescription() != null) {
            existingPet.setDescription(petDTO.getDescription());
        }

        if (petDTO.getImageUrl() != null) {
            existingPet.setImageUrl(petDTO.getImageUrl());
        }

        existingPet.setUpdatedAt(LocalDateTime.now());
        Pet savedPet = petRepository.save(existingPet);
        return convertToDTO(savedPet);
    }

    public void deletePet(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        Long ownerId = pet.getOwner().getId();
        petRepository.delete(pet);

        // Update user's pet count
        userService.updateUserStats(ownerId,
                petRepository.countByOwnerId(ownerId).intValue(),
                pet.getOwner().getTotalItems());
    }

    public PetDTO feedPet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        // Check if owner has enough coins
        User owner = pet.getOwner();
        int feedCost = 10;
        if (owner.getCoins() < feedCost) {
            throw new RuntimeException("Không đủ xu để cho ăn");
        }

        // Update pet stats
        pet.setHunger(Math.max(0, pet.getHunger() - 30));
        pet.setHappiness(Math.min(100, pet.getHappiness() + 10));
        pet.setEnergy(Math.min(100, pet.getEnergy() + 15));
        pet.setUpdatedAt(LocalDateTime.now());

        // Deduct coins from owner
        userService.updateCoins(owner.getId(), -feedCost);

        // Record care history
        recordCareAction(pet, CareHistory.CareType.FEED, "Cho ăn thú cưng");

        Pet savedPet = petRepository.save(pet);
        return convertToDTO(savedPet);
    }

    public PetDTO playWithPet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        if (pet.getEnergy() < 20) {
            throw new RuntimeException("Thú cưng quá mệt để chơi");
        }

        // Update pet stats
        pet.setHappiness(Math.min(100, pet.getHappiness() + 20));
        pet.setEnergy(Math.max(0, pet.getEnergy() - 20));
        pet.setUpdatedAt(LocalDateTime.now());

        // Add experience to owner
        userService.addExperience(pet.getOwner().getId(), 10);

        // Record care history
        recordCareAction(pet, CareHistory.CareType.PLAY, "Chơi với thú cưng");

        Pet savedPet = petRepository.save(pet);
        return convertToDTO(savedPet);
    }

    public PetDTO restPet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        // Update pet stats
        pet.setEnergy(Math.min(100, pet.getEnergy() + 40));
        pet.setHealth(Math.min(100, pet.getHealth() + 10));
        pet.setUpdatedAt(LocalDateTime.now());

        // Record care history
        recordCareAction(pet, CareHistory.CareType.REST, "Để thú cưng nghỉ ngơi");

        Pet savedPet = petRepository.save(pet);
        return convertToDTO(savedPet);
    }

    public PetDTO healPet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thú cưng"));

        // Check if owner has enough coins
        User owner = pet.getOwner();
        int healCost = 20;
        if (owner.getCoins() < healCost) {
            throw new RuntimeException("Không đủ xu để chữa bệnh");
        }

        // Update pet stats
        pet.setHealth(100);
        pet.setStatus(Pet.PetStatus.HEALTHY);
        pet.setUpdatedAt(LocalDateTime.now());

        // Deduct coins from owner
        userService.updateCoins(owner.getId(), -healCost);

        // Record care history
        recordCareAction(pet, CareHistory.CareType.HEAL, "Chữa bệnh cho thú cưng");

        Pet savedPet = petRepository.save(pet);
        return convertToDTO(savedPet);
    }

    private void generateRandomStats(Pet pet) {
        int baseStats = switch (pet.getRarity()) {
            case COMMON -> 50;
            case UNCOMMON -> 70;
            case RARE -> 90;
            case EPIC -> 110;
            case LEGENDARY -> 130;
            case MYTHIC -> 150;
        };

        pet.setAttack(baseStats + random.nextInt(20));
        pet.setDefense(baseStats + random.nextInt(20));
        pet.setSpeed(baseStats + random.nextInt(20));
        pet.setMaxHealth(100 + (baseStats - 50));
        pet.setLevel(1);
    }

    private void recordCareAction(Pet pet, CareHistory.CareType type, String notes) {
        CareHistory care = new CareHistory();
        care.setPet(pet);
        care.setUser(pet.getOwner());
        care.setCareType(type);
        care.setNotes(notes);
        care.setCareDate(LocalDateTime.now());
        careHistoryRepository.save(care);
    }

    private PetDTO convertToDTO(Pet pet) {
        PetDTO dto = new PetDTO();
        dto.setId(pet.getId());
        dto.setName(pet.getName());
        dto.setType(pet.getType());
        dto.setRarity(pet.getRarity());
        dto.setStatus(pet.getStatus());
        dto.setLevel(pet.getLevel());
        dto.setDescription(pet.getDescription());
        dto.setImageUrl(pet.getImageUrl());
        dto.setAttack(pet.getAttack());
        dto.setDefense(pet.getDefense());
        dto.setSpeed(pet.getSpeed());
        dto.setMaxHealth(pet.getMaxHealth());
        dto.setHealth(pet.getHealth());
        dto.setHappiness(pet.getHappiness());
        dto.setEnergy(pet.getEnergy());
        dto.setHunger(pet.getHunger());
        dto.setAbilities(pet.getAbilities());
        dto.setOwnerId(pet.getOwner().getId());
        dto.setOwnerName(pet.getOwner().getUsername());
        dto.setCreatedAt(pet.getCreatedAt());
        dto.setUpdatedAt(pet.getUpdatedAt()); // Create summary DTO
        PetSummaryDTO summary = new PetSummaryDTO();
        summary.setId(pet.getId());
        summary.setName(pet.getName());
        summary.setType(pet.getType().getDisplayName());
        summary.setAge(pet.getLevel()); // Using level as age for summary
        summary.setImageUrl(pet.getImageUrl());
        dto.setSummary(summary);

        return dto;
    }

    private Pet convertToEntity(PetDTO dto) {
        Pet pet = new Pet();
        pet.setId(dto.getId());
        pet.setName(dto.getName());
        pet.setType(dto.getType());
        pet.setRarity(dto.getRarity());
        pet.setStatus(dto.getStatus());
        pet.setLevel(dto.getLevel());
        pet.setDescription(dto.getDescription());
        pet.setImageUrl(dto.getImageUrl());
        pet.setAttack(dto.getAttack());
        pet.setDefense(dto.getDefense());
        pet.setSpeed(dto.getSpeed());
        pet.setMaxHealth(dto.getMaxHealth());
        pet.setHealth(dto.getHealth());
        pet.setHappiness(dto.getHappiness());
        pet.setEnergy(dto.getEnergy());
        pet.setHunger(dto.getHunger());
        pet.setAbilities(dto.getAbilities());
        return pet;
    }
}
