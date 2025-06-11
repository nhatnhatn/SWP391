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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Pets", description = "Pet management and care operations for Vietnamese Pet System")
@SecurityRequirement(name = "Bearer Authentication")
public class PetController {

    @Autowired
    private PetService petService;

    @Operation(
        summary = "Get all pets",
        description = "Retrieve all pets including Dogs, Cats, Birds, Fish, and other Vietnamese pets"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pets retrieved successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "400", description = "Bad request")
    })
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
        }    }

    @Operation(
        summary = "Get pet by ID",
        description = "Retrieve a specific pet by its unique identifier"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet found successfully"),
        @ApiResponse(responseCode = "404", description = "Pet not found"),
        @ApiResponse(responseCode = "400", description = "Invalid pet ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        try {
            Optional<PetDTO> pet = petService.getPetById(id);
            return pet.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get pets by owner",
        description = "Retrieve all pets belonging to a specific user/owner"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pets retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid owner ID")
    })
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PetDTO>> getPetsByOwner(@PathVariable Long ownerId) {
        try {
            List<PetDTO> pets = petService.getPetsByOwner(ownerId);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get pets by type",
        description = "Retrieve all pets of a specific type (DRAGON, BIRD, BEAST, ELEMENTAL, etc.)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pets retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid pet type")
    })
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PetDTO>> getPetsByType(@PathVariable Pet.PetType type) {
        try {
            List<PetDTO> pets = petService.getPetsByType(type);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get pets by rarity",
        description = "Retrieve all pets of a specific rarity level (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pets retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rarity type")
    })
    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<PetDTO>> getPetsByRarity(@PathVariable Pet.RarityType rarity) {
        try {
            List<PetDTO> pets = petService.getPetsByRarity(rarity);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Search pets",
        description = "Search pets by keyword (name, type, or abilities)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    @GetMapping("/search")
    public ResponseEntity<List<PetDTO>> searchPets(@RequestParam String keyword) {
        try {
            List<PetDTO> pets = petService.searchPets(keyword);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get available pets",
        description = "Retrieve all pets that are available for adoption or interaction"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available pets retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Error retrieving pets")
    })
    @GetMapping("/available")
    public ResponseEntity<List<PetDTO>> getAvailablePets() {
        try {
            List<PetDTO> pets = petService.getAvailablePets();
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Create new pet",
        description = "Create a new pet in the Vietnamese Pet Management System"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid pet data")
    })
    @PostMapping
    public ResponseEntity<?> createPet(@Valid @RequestBody PetDTO petDTO) {
        try {
            PetDTO createdPet = petService.createPet(petDTO);
            return ResponseEntity.ok(createdPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Update pet",
        description = "Update an existing pet's information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid pet data"),
        @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(@PathVariable Long id, @Valid @RequestBody PetDTO petDTO) {
        try {
            PetDTO updatedPet = petService.updatePet(id, petDTO);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Delete pet",
        description = "Remove a pet from the system permanently"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot delete pet"),
        @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id) {
        try {
            petService.deletePet(id);
            return ResponseEntity.ok(new SuccessResponse("Xóa thú cưng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }    @Operation(
        summary = "Feed pet",
        description = "Feed a pet to increase happiness and reduce hunger"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet fed successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "400", description = "Cannot feed pet - may be full or invalid pet")
    })
    @PostMapping("/{id}/feed")
    public ResponseEntity<?> feedPet(
            @Parameter(description = "Pet ID to feed", required = true)
            @PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.feedPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }    @Operation(
        summary = "Play with pet",
        description = "Play with a pet to increase happiness and energy"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Played with pet successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot play - pet may be tired or invalid pet")
    })
    @PostMapping("/{id}/play")
    public ResponseEntity<?> playWithPet(
            @Parameter(description = "Pet ID to play with", required = true)
            @PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.playWithPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Rest pet",
        description = "Let a pet rest to restore energy and reduce stress"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet rested successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot rest pet - invalid pet or already rested")
    })
    @PostMapping("/{id}/rest")
    public ResponseEntity<?> restPet(
        @Parameter(description = "Pet ID to rest", required = true)
        @PathVariable Long id) {
        try {
            PetDTO updatedPet = petService.restPet(id);
            return ResponseEntity.ok(updatedPet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Heal pet",
        description = "Heal a pet to restore health and cure any ailments"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pet healed successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot heal pet - invalid pet or already healthy")
    })
    @PostMapping("/{id}/heal")
    public ResponseEntity<?> healPet(
        @Parameter(description = "Pet ID to heal", required = true)
        @PathVariable Long id) {
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
