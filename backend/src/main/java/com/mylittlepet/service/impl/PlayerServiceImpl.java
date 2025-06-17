package com.mylittlepet.service.impl;

import com.mylittlepet.dto.PlayerDTO;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.PlayerRepository;
import com.mylittlepet.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerServiceImpl(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @Override
    public List<PlayerDTO> getAllPlayers() {
        return playerRepository.findAllPlayers().stream()
                .map(PlayerDTO::fromUser)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PlayerDTO> getPlayerById(Integer id) {
        return playerRepository.findPlayerById(id)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public Optional<PlayerDTO> getPlayerByEmail(String email) {
        return playerRepository.findPlayerByEmail(email)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public Optional<PlayerDTO> getPlayerByUserName(String userName) {
        return playerRepository.findPlayerByUserName(userName)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public List<PlayerDTO> getPlayersByStatus(String status) {
        return playerRepository.findPlayersByStatus(status).stream()
                .map(PlayerDTO::fromUser)
                .collect(Collectors.toList());
    }

    @Override
    public PlayerDTO createPlayer(PlayerDTO playerDTO) {
        User user = playerDTO.toUser();
        user.setRole("PLAYER"); // Ensure role is PLAYER
        User savedUser = playerRepository.save(user);
        return PlayerDTO.fromUser(savedUser);
    }

    @Override
    public PlayerDTO updatePlayer(Integer id, PlayerDTO playerDTO) {
        // Use the updatePlayer method from repository
        int updatedRows = playerRepository.updatePlayer(
                id,
                playerDTO.getUserName(),
                playerDTO.getEmail(),
                playerDTO.getUserStatus(),
                playerDTO.getLevel(),
                playerDTO.getCoin(),
                playerDTO.getDiamond(),
                playerDTO.getGem());

        if (updatedRows > 0) {
            // Return updated player
            return playerRepository.findPlayerById(id)
                    .map(PlayerDTO::fromUser)
                    .orElse(null);
        }

        return null; // Player not found or update failed
    }

    @Override
    public boolean deletePlayer(Integer id) {
        // Get current player data first
        Optional<User> playerOpt = playerRepository.findPlayerById(id);

        if (playerOpt.isPresent()) {
            User player = playerOpt.get();

            // Use updatePlayer method to set status to INACTIVE (soft delete)
            int updatedRows = playerRepository.updatePlayer(
                    id,
                    player.getUserName(),
                    player.getEmail(),
                    "INACTIVE", // Set status to INACTIVE
                    player.getLevel(),
                    player.getCoin(),
                    player.getDiamond(),
                    player.getGem());

            return updatedRows > 0;
        }

        return false; // Player not found
    }
}
