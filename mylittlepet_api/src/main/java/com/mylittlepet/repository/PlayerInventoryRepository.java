package com.mylittlepet.repository;

import com.mylittlepet.entity.PlayerInventory;
import com.mylittlepet.entity.PlayerInventoryId;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.ShopProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlayerInventoryRepository extends JpaRepository<PlayerInventory, PlayerInventoryId> {
    List<PlayerInventory> findByPlayer(User player);

    List<PlayerInventory> findByShopProduct(ShopProduct shopProduct);

    Page<PlayerInventory> findByPlayer(User player, Pageable pageable);

    @Query("SELECT pi FROM PlayerInventory pi WHERE pi.player.id = :playerId")
    List<PlayerInventory> findByPlayerId(@Param("playerId") Integer playerId);

    @Query("SELECT pi FROM PlayerInventory pi WHERE pi.player.id = :playerId AND pi.quantity > 0")
    List<PlayerInventory> findByPlayerIdAndQuantityGreaterThan(@Param("playerId") Integer playerId);

    @Query("SELECT pi FROM PlayerInventory pi WHERE pi.acquiredAt BETWEEN :startDate AND :endDate")
    List<PlayerInventory> findByAcquiredAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
