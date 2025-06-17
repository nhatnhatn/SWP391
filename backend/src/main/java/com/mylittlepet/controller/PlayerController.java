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
public class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    } // GET /api/players - Get all players

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllPlayers() {
        List<PlayerDTO> players = playerService.getAllPlayers();
        return ResponseEntity.ok(players);
    }

    // GET /api/players/{id} - Get player by ID
    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Integer id) {
        Optional<PlayerDTO> player = playerService.getPlayerById(id);
        return player.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/players/{id} - Update player
    @PutMapping("/{id}")
    public ResponseEntity<PlayerDTO> updatePlayer(@PathVariable Integer id, @RequestBody PlayerDTO playerDTO) {
        // Set ID from URL path, not from request body
        playerDTO.setId(id);

        PlayerDTO updatedPlayer = playerService.updatePlayer(id, playerDTO);
        if (updatedPlayer != null) {
            return ResponseEntity.ok(updatedPlayer);
        }
        return ResponseEntity.notFound().build();
    }
}
