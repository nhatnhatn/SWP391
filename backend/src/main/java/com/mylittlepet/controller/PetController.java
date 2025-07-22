package com.mylittlepet.controller;

import com.mylittlepet.dto.PetDTO;
import com.mylittlepet.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class PetController {

    @Autowired
    private PetService petService;

    // GET /api/pets - Get all pets
    @GetMapping
    public ResponseEntity<List<PetDTO>> getAllPets() {
        try {
            List<PetDTO> pets = petService.getAllPets();
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/pets/{id} - Get pet by ID
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Integer id) {
        try {
            Optional<PetDTO> pet = petService.getPetById(id);
            if (pet.isPresent()) {
                return ResponseEntity.ok(pet.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/pets/type/{type} - Get pets by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PetDTO>> getPetsByType(@PathVariable String type) {
        try {
            List<PetDTO> pets = petService.getPetsByType(type);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/pets/status/{status} - Get pets by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PetDTO>> getPetsByStatus(@PathVariable Integer status) {
        try {
            List<PetDTO> pets = petService.getPetsByStatus(status);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/pets/search?keyword= - Search pets
    @GetMapping("/search")
    public ResponseEntity<List<PetDTO>> searchPets(@RequestParam String keyword) {
        try {
            List<PetDTO> pets = petService.searchPets(keyword);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/pets - Create new pet
    @PostMapping
    public ResponseEntity<PetDTO> createPet(@RequestBody PetDTO petDTO) {
        try {
            PetDTO createdPet = petService.createPet(petDTO);
            return ResponseEntity.ok(createdPet);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/pets/{id} - Update status pet
    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Integer id, @RequestBody PetDTO petDTO) {
        try {
            PetDTO updatedPet = petService.updatePet(id, petDTO);
            if (updatedPet != null) {
                return ResponseEntity.ok(updatedPet);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/pets/test - Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Pet Management API is working!");
    }
}
