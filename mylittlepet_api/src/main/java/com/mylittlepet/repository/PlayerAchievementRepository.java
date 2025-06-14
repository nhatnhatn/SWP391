package com.mylittlepet.repository;

import com.mylittlepet.entity.PlayerAchievement;
import com.mylittlepet.entity.PlayerAchievementId;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.Achievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlayerAchievementRepository extends JpaRepository<PlayerAchievement, PlayerAchievementId> {
    List<PlayerAchievement> findByPlayer(User player);

    List<PlayerAchievement> findByAchievement(Achievement achievement);

    Page<PlayerAchievement> findByPlayer(User player, Pageable pageable);

    @Query("SELECT pa FROM PlayerAchievement pa WHERE pa.player.id = :playerId")
    List<PlayerAchievement> findByPlayerId(@Param("playerId") Integer playerId);

    @Query("SELECT pa FROM PlayerAchievement pa WHERE pa.earnedAt BETWEEN :startDate AND :endDate")
    List<PlayerAchievement> findByEarnedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    Long countByPlayerId(Integer playerId);
}
