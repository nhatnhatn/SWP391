package com.mylittlepet.repository;

import com.mylittlepet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<User, Integer> {
    // Find all players (users with role = "Player") - including JoinDate
    @Query("SELECT u FROM User u WHERE u.role = 'Player' ORDER BY u.joinDate DESC")
    List<User> findAllPlayers();

    // Find all players with total pets count
    @Query("SELECT u, CAST(COUNT(pp.playerPetId) AS int) FROM User u " +
            "LEFT JOIN PlayerPet pp ON u.id = pp.playerId " +
            "WHERE u.role = 'Player' " +
            "GROUP BY u.id, u.role, u.userName, u.email, u.password, u.userStatus, u.level, u.coin, u.diamond, u.gem, u.joinDate "
            +
            "ORDER BY u.joinDate DESC")
    List<Object[]> findAllPlayersWithPetCount();

    // Get total pets count for a specific player
    @Query("SELECT COUNT(pp.playerPetId) FROM PlayerPet pp WHERE pp.playerId = :playerId")
    Integer getTotalPetsByPlayerId(@Param("playerId") Integer playerId);

    // Find player by ID (must be Player role) - including JoinDate
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.role = 'Player'")
    Optional<User> findPlayerById(@Param("id") Integer id);

    // Find player by email (must be Player role) - including JoinDate
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.role = 'Player'")
    Optional<User> findPlayerByEmail(@Param("email") String email);

    // Find player by username (must be Player role) - including JoinDate
    @Query("SELECT u FROM User u WHERE u.userName = :userName AND u.role = 'Player'")
    Optional<User> findPlayerByUserName(@Param("userName") String userName);

    // Find players by status - including JoinDate, ordered by join date
    @Query("SELECT u FROM User u WHERE u.role = 'Player' AND u.userStatus = :status ORDER BY u.joinDate DESC")
    List<User> findPlayersByStatus(@Param("status") String status);

    // Update player information
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.userName = :userName, u.email = :email, u.userStatus = :userStatus, u.level = :level, u.coin = :coin, u.diamond = :diamond, u.gem = :gem WHERE u.id = :id AND u.role = 'Player'")
    int updatePlayer(@Param("id") Integer id, @Param("userName") String userName, @Param("email") String email,
            @Param("userStatus") String userStatus, @Param("level") Integer level,
            @Param("coin") Integer coin, @Param("diamond") Integer diamond, @Param("gem") Integer gem);
}
