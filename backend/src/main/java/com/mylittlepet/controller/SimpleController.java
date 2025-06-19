package com.mylittlepet.controller;

import com.mylittlepet.dto.PlayerDTO;
import com.mylittlepet.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class SimpleController {

    @Autowired
    private PlayerService playerService;

    // GET /api/players - Get all players
    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllPlayers() {
        try {
            List<PlayerDTO> players = playerService.getAllPlayers();
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/players/{id} - Get player by ID
    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Integer id) {
        try {
            Optional<PlayerDTO> player = playerService.getPlayerById(id);
            if (player.isPresent()) {
                return ResponseEntity.ok(player.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/players/email/{email} - Get player by email
    @GetMapping("/email/{email}")
    public ResponseEntity<PlayerDTO> getPlayerByEmail(@PathVariable String email) {
        try {
            Optional<PlayerDTO> player = playerService.getPlayerByEmail(email);
            if (player.isPresent()) {
                return ResponseEntity.ok(player.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/players/username/{username} - Get player by username
    @GetMapping("/username/{username}")
    public ResponseEntity<PlayerDTO> getPlayerByUserName(@PathVariable String username) {
        try {
            Optional<PlayerDTO> player = playerService.getPlayerByUserName(username);
            if (player.isPresent()) {
                return ResponseEntity.ok(player.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/players/status/{status} - Get players by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PlayerDTO>> getPlayersByStatus(@PathVariable String status) {
        try {
            List<PlayerDTO> players = playerService.getPlayersByStatus(status);
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/players - Create new player
    @PostMapping
    public ResponseEntity<PlayerDTO> createPlayer(@RequestBody PlayerDTO playerDTO) {
        try {
            PlayerDTO createdPlayer = playerService.createPlayer(playerDTO);
            return ResponseEntity.ok(createdPlayer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/players/{id} - Update player
    @PutMapping("/{id}")
    public ResponseEntity<PlayerDTO> updatePlayer(@PathVariable Integer id, @RequestBody PlayerDTO playerDTO) {
        try {
            PlayerDTO updatedPlayer = playerService.updatePlayer(id, playerDTO);
            if (updatedPlayer != null) {
                return ResponseEntity.ok(updatedPlayer);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // DELETE /api/players/{id} - Delete player (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Integer id) {
        try {
            boolean deleted = playerService.deletePlayer(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/players/{id}/ban - Ban player
    @PutMapping("/{id}/ban")
    public ResponseEntity<PlayerDTO> banPlayer(@PathVariable Integer id) {
        try {
            Optional<PlayerDTO> currentPlayer = playerService.getPlayerById(id);
            if (currentPlayer.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PlayerDTO playerToUpdate = currentPlayer.get();
            playerToUpdate.setUserStatus("BANNED");

            PlayerDTO updatedPlayer = playerService.updatePlayer(id, playerToUpdate);
            if (updatedPlayer != null) {
                return ResponseEntity.ok(updatedPlayer);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/players/{id}/unban - Unban player
    @PutMapping("/{id}/unban")
    public ResponseEntity<PlayerDTO> unbanPlayer(@PathVariable Integer id) {
        try {
            Optional<PlayerDTO> currentPlayer = playerService.getPlayerById(id);
            if (currentPlayer.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PlayerDTO playerToUpdate = currentPlayer.get();
            playerToUpdate.setUserStatus("ACTIVE");

            PlayerDTO updatedPlayer = playerService.updatePlayer(id, playerToUpdate);
            if (updatedPlayer != null) {
                return ResponseEntity.ok(updatedPlayer);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/players/test - Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Player Management API is working!");
    }
}
