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
public interface PlayerRepository extends JpaRepository<User, Integer> { // Find all players (users with role = "PLAYER"
                                                                         // or "player")
    @Query("SELECT u FROM User u WHERE UPPER(u.role) = 'PLAYER'")
    List<User> findAllPlayers();

    // Find player by ID (must be PLAYER role)
    @Query("SELECT u FROM User u WHERE u.id = :id AND UPPER(u.role) = 'PLAYER'")
    Optional<User> findPlayerById(@Param("id") Integer id);

    // Find player by email (must be PLAYER role)
    @Query("SELECT u FROM User u WHERE u.email = :email AND UPPER(u.role) = 'PLAYER'")
    Optional<User> findPlayerByEmail(@Param("email") String email);

    // Find player by username (must be PLAYER role)
    @Query("SELECT u FROM User u WHERE u.userName = :userName AND UPPER(u.role) = 'PLAYER'")
    Optional<User> findPlayerByUserName(@Param("userName") String userName);

    // Find players by status
    @Query("SELECT u FROM User u WHERE UPPER(u.role) = 'PLAYER' AND u.userStatus = :status")
    List<User> findPlayersByStatus(@Param("status") String status); // Update player information

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.userName = :userName, u.email = :email, u.userStatus = :userStatus, u.level = :level, u.coin = :coin, u.diamond = :diamond, u.gem = :gem WHERE u.id = :id AND UPPER(u.role) = 'PLAYER'")
    int updatePlayer(@Param("id") Integer id, @Param("userName") String userName, @Param("email") String email,
            @Param("userStatus") String userStatus, @Param("level") Integer level,
            @Param("coin") Integer coin, @Param("diamond") Integer diamond, @Param("gem") Integer gem);
}
