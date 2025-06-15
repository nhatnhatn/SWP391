package com.mylittlepet.repository;

import com.mylittlepet.entity.GameRecord;
import com.mylittlepet.entity.GameRecordId;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.Minigame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameRecordRepository extends JpaRepository<GameRecord, GameRecordId> {
    List<GameRecord> findByPlayer(User player);

    List<GameRecord> findByMinigame(Minigame minigame);

    Page<GameRecord> findByPlayer(User player, Pageable pageable);

    Page<GameRecord> findByMinigame(Minigame minigame, Pageable pageable);

    @Query("SELECT gr FROM GameRecord gr WHERE gr.player.id = :playerId ORDER BY gr.score DESC")
    List<GameRecord> findByPlayerIdOrderByScoreDesc(@Param("playerId") Integer playerId);

    @Query("SELECT gr FROM GameRecord gr WHERE gr.minigame.minigameId = :minigameId ORDER BY gr.score DESC")
    List<GameRecord> findByMinigameIdOrderByScoreDesc(@Param("minigameId") Integer minigameId);

    @Query("SELECT gr FROM GameRecord gr WHERE gr.playedAt BETWEEN :startDate AND :endDate")
    List<GameRecord> findByPlayedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT MAX(gr.score) FROM GameRecord gr WHERE gr.player.id = :playerId AND gr.minigame.minigameId = :minigameId")
    Integer findMaxScoreByPlayerAndMinigame(@Param("playerId") Integer playerId,
            @Param("minigameId") Integer minigameId);
}
