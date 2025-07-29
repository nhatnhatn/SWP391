package com.mylittlepet.repository;

import com.mylittlepet.entity.PlayerPet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerPetRepository extends JpaRepository<PlayerPet, Integer> { // Get all pets owned by a specific
                                                                                 // player - chỉ lấy tên và level
        @Query("SELECT pp.playerPetId, pp.petCustomName, pp.status, pp.adoptedAt, p.petDefaultName " +
                        "FROM PlayerPet pp " +
                        "LEFT JOIN Pet p ON pp.petId = p.petId " +
                        "WHERE pp.playerId = :playerId " +
                        "ORDER BY pp.adoptedAt DESC")
        List<Object[]> findPlayerPetsWithDetails(@Param("playerId") Integer playerId);

        // Count total pets by player ID
        @Query("SELECT COUNT(pp.playerPetId) FROM PlayerPet pp WHERE pp.playerId = :playerId")
        Integer countByPlayerId(@Param("playerId") Integer playerId);

        // Find pets by player ID (simple)
        @Query("SELECT pp FROM PlayerPet pp WHERE pp.playerId = :playerId ORDER BY pp.adoptedAt DESC")
        List<PlayerPet> findByPlayerId(@Param("playerId") Integer playerId);
}
