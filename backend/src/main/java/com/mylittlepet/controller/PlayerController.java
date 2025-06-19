package com.mylittlepet.controller;

/*
// COMMENTED OUT - Will be replaced by SimpleController for Player Management
// This file is kept for reference but disabled to avoid compilation errors

import com.mylittlepet.entity.User;
import com.mylittlepet.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/players")
public class PlayerController {
    @Autowired
    private PlayerService playerService;

    @GetMapping
    public List<User> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/{id}")
    public Optional<User> getPlayerById(@PathVariable Integer id) {
        return playerService.getPlayerById(id);
    }

    @PostMapping
    public User createPlayer(@RequestBody User player) {
        return playerService.createPlayer(player);
    }

    @PutMapping("/{id}")
    public User updatePlayer(@PathVariable Integer id, @RequestBody User player) {
        return playerService.updatePlayer(id, player);
    }

    @DeleteMapping("/{id}")
    public void deletePlayer(@PathVariable Integer id) {
        playerService.deletePlayer(id);
    }
} 
*/