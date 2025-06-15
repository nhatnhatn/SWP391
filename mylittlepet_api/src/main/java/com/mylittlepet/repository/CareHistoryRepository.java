package com.mylittlepet.repository;

import com.mylittlepet.entity.CareHistory;
import com.mylittlepet.entity.PlayerPet;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.CareActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CareHistoryRepository extends JpaRepository<CareHistory, Integer> {

    List<CareHistory> findByPlayer(User player);

    Page<CareHistory> findByPlayer(User player, Pageable pageable);

    List<CareHistory> findByPlayerPet(PlayerPet playerPet);

    Page<CareHistory> findByPlayerPet(PlayerPet playerPet, Pageable pageable);

    List<CareHistory> findByActivity(CareActivity activity);

    List<CareHistory> findByPlayerOrderByPerformedAtDesc(User player);

    List<CareHistory> findByPlayerPetOrderByPerformedAtDesc(PlayerPet playerPet);

    @Query("SELECT ch FROM CareHistory ch WHERE ch.player.id = :playerId")
    List<CareHistory> findByPlayerId(@Param("playerId") Integer playerId);

    @Query("SELECT ch FROM CareHistory ch WHERE ch.performedAt BETWEEN :startDate AND :endDate")
    List<CareHistory> findByPerformedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
