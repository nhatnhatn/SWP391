package com.mylittlepet.repository;

import com.mylittlepet.entity.PlayerPet;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerPetRepository extends JpaRepository<PlayerPet, Integer> {
    List<PlayerPet> findByPlayer(User player);

    List<PlayerPet> findByPet(Pet pet);

    Optional<PlayerPet> findByPlayerAndPetName(User player, String petName);

    Page<PlayerPet> findByPlayer(User player, Pageable pageable);

    @Query("SELECT pp FROM PlayerPet pp WHERE pp.player.id = :playerId")
    List<PlayerPet> findByPlayerId(@Param("playerId") Integer playerId);

    @Query("SELECT pp FROM PlayerPet pp WHERE pp.player.id = :playerId AND LOWER(pp.petName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<PlayerPet> findByPlayerIdAndPetNameContaining(@Param("playerId") Integer playerId, @Param("name") String name);

    @Query("SELECT pp FROM PlayerPet pp WHERE pp.status = :status")
    List<PlayerPet> findByStatus(@Param("status") String status);

    @Query("SELECT pp FROM PlayerPet pp WHERE pp.level >= :minLevel")
    List<PlayerPet> findByLevelGreaterThanEqual(@Param("minLevel") Integer minLevel);

    @Query("SELECT pp FROM PlayerPet pp WHERE pp.adoptedAt BETWEEN :startDate AND :endDate")
    List<PlayerPet> findByAdoptedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    Long countByPlayerId(Integer playerId);
}
