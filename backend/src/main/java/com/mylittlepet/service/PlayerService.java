package com.mylittlepet.service;

import com.mylittlepet.dto.PlayerDTO;
import java.util.List;
import java.util.Optional;

public interface PlayerService {

    // Get all players
    List<PlayerDTO> getAllPlayers();

    // Get player by ID
    Optional<PlayerDTO> getPlayerById(Integer id);

    // Get player by email
    Optional<PlayerDTO> getPlayerByEmail(String email);

    // Get player by username
    Optional<PlayerDTO> getPlayerByUserName(String userName);
    // Create new player
    PlayerDTO createPlayer(PlayerDTO playerDTO);

    // Update player
    PlayerDTO updatePlayer(Integer id, PlayerDTO playerDTO); // Delete player (soft delete by changing status)

    boolean deletePlayer(Integer id);

    // Get all pets owned by a specific player
    List<com.mylittlepet.dto.PlayerPetDTO> getPlayerPets(Integer playerId);
}
