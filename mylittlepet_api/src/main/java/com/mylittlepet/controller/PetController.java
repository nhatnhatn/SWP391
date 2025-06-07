package com.mylittlepet.controller;

import com.mylittlepet.dto.PetDTO;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3000")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping
    public ResponseEntity<List<PetDTO>> getAllPets() {
        try {
            List<PetDTO> pets = petService.getAllPets();
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<PetDTO>> getAllPetsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PetDTO> pets = petService.getAllPetsWithPagination(pageable);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        try {
            Optional<PetDTO> pet = petService.getPetById(id);
            return pet.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PetDTO>> getPetsByOwner(@PathVariable Long ownerId) {
        try {
            List<PetDTO> pets = petService.getPetsByOwner(ownerId);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PetDTO>> getPetsByType(@PathVariable Pet.PetType type) {
        try {
            List<PetDTO> pets = petService.getPetsByType(type);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<PetDTO>> getPetsByRarity(@PathVariable Pet.RarityType rarity) {
        try {
            List<PetDTO> pets = petService.getPetsByRarity(rarity);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PetDTO>> searchPets(@RequestParam String keyword) {
        try {
            List<PetDTO> pets = petService.searchPets(keyword);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<PetDTO>> getAvailablePets() {
        try {
            List<PetDTO> pets = petService.getAvailablePets();
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createPet(@Valid @RequestBody PetDTO petDTO) {
        try {
            PetDTO createdPet = petService.createPet(petDTO);
            return ResponseEntity.ok(createdPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(@PathVariable Long id, @Valid @RequestBody PetDTO petDTO) {
        try {
            PetDTO updatedPet = petService.updatePet(id, petDTO);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id) {
        try {
            petService.deletePet(id);
            return ResponseEntity.ok(new SuccessResponse("Xóa thú cưng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/feed")
    public ResponseEntity<?> feedPet(@PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.feedPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<?> playWithPet(@PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.playWithPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/rest")
    public ResponseEntity<?> restPet(@PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.restPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/heal")
    public ResponseEntity<?> healPet(@PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.healPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Response classes
    public static class ErrorResponse {
        private String message;
        private String status = "error";

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class SuccessResponse {
        private String message;
        private String status = "success";

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
