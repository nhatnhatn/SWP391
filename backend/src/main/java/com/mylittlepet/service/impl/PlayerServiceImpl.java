package com.mylittlepet.service.impl;

import com.mylittlepet.dto.PlayerDTO;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.PlayerRepository;
import com.mylittlepet.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerServiceImpl(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }    @Override
    public List<PlayerDTO> getAllPlayers() {
        // Use PlayerRepository's dedicated method
        return playerRepository.findAllPlayers().stream()
                .map(PlayerDTO::fromUser)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PlayerDTO> getPlayerById(Integer id) {
        // Use PlayerRepository's dedicated method
        return playerRepository.findPlayerById(id)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public Optional<PlayerDTO> getPlayerByEmail(String email) {
        // Use PlayerRepository's dedicated method
        return playerRepository.findPlayerByEmail(email)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public Optional<PlayerDTO> getPlayerByUserName(String userName) {
        // Use PlayerRepository's dedicated method
        return playerRepository.findPlayerByUserName(userName)
                .map(PlayerDTO::fromUser);
    }

    @Override
    public List<PlayerDTO> getPlayersByStatus(String status) {
        // Use PlayerRepository's dedicated method
        return playerRepository.findPlayersByStatus(status).stream()
                .map(PlayerDTO::fromUser)
                .collect(Collectors.toList());
    }    @Override
    public PlayerDTO createPlayer(PlayerDTO playerDTO) {
        try {
            // Check if email already exists (using PlayerRepository find method)
            if (playerRepository.findPlayerByEmail(playerDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

            // Check if username already exists (using PlayerRepository find method)
            if (playerRepository.findPlayerByUserName(playerDTO.getUserName()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }

            // Create new User entity
            User user = new User();
            user.setRole("Player");  // Use "Player" instead of "PLAYER" to match schema
            user.setUserName(playerDTO.getUserName());
            user.setEmail(playerDTO.getEmail());
            user.setPassword("defaultPassword123"); // Default password
            user.setUserStatus("ACTIVE");
            user.setLevel(playerDTO.getLevel() != null ? playerDTO.getLevel() : 1);
            user.setCoin(playerDTO.getCoin() != null ? playerDTO.getCoin() : 0);
            user.setDiamond(playerDTO.getDiamond() != null ? playerDTO.getDiamond() : 0);
            user.setGem(playerDTO.getGem() != null ? playerDTO.getGem() : 0);
            user.setJoinDate(LocalDateTime.now());

            // Save user
            User savedUser = playerRepository.save(user);
            return PlayerDTO.fromUser(savedUser);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create player: " + e.getMessage());
        }
    }    @Override
    public PlayerDTO updatePlayer(Integer id, PlayerDTO playerDTO) {
        try {
            // Get current player first
            Optional<User> existingUserOpt = playerRepository.findPlayerById(id);
            if (existingUserOpt.isEmpty()) {
                throw new RuntimeException("Player not found");
            }

            User existingUser = existingUserOpt.get();

            // Prepare update values (keep existing if new is null)
            String userName = playerDTO.getUserName() != null ? playerDTO.getUserName() : existingUser.getUserName();
            String email = playerDTO.getEmail() != null ? playerDTO.getEmail() : existingUser.getEmail();
            String userStatus = playerDTO.getUserStatus() != null ? playerDTO.getUserStatus() : existingUser.getUserStatus();
            Integer level = playerDTO.getLevel() != null ? playerDTO.getLevel() : existingUser.getLevel();
            Integer coin = playerDTO.getCoin() != null ? playerDTO.getCoin() : existingUser.getCoin();
            Integer diamond = playerDTO.getDiamond() != null ? playerDTO.getDiamond() : existingUser.getDiamond();
            Integer gem = playerDTO.getGem() != null ? playerDTO.getGem() : existingUser.getGem();

            // Use PlayerRepository's update method
            int updatedRows = playerRepository.updatePlayer(id, userName, email, userStatus, level, coin, diamond, gem);
            
            if (updatedRows > 0) {
                // Return updated player
                return playerRepository.findPlayerById(id)
                        .map(PlayerDTO::fromUser)
                        .orElse(null);
            } else {
                throw new RuntimeException("Update failed");
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to update player: " + e.getMessage());
        }
    }    @Override
    public boolean deletePlayer(Integer id) {
        try {
            // Get current player first
            Optional<User> userOpt = playerRepository.findPlayerById(id);
            if (userOpt.isEmpty()) {
                return false;
            }

            User user = userOpt.get();
            
            // Use PlayerRepository's update method to set status to BANNED
            int updatedRows = playerRepository.updatePlayer(
                id, 
                user.getUserName(), 
                user.getEmail(), 
                "BANNED",  // Set status to BANNED
                user.getLevel(), 
                user.getCoin(), 
                user.getDiamond(), 
                user.getGem()
            );
            
            return updatedRows > 0;

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete player: " + e.getMessage());
        }
    }
}
