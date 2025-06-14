package com.mylittlepet.repository;

import com.mylittlepet.entity.UserInventory;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInventoryRepository extends JpaRepository<UserInventory, Long> {
    List<UserInventory> findByUser(User user);

    List<UserInventory> findByUserId(Long userId);

    Optional<UserInventory> findByUserAndItem(User user, Item item);

    Optional<UserInventory> findByUserIdAndItemId(Long userId, Long itemId);

    boolean existsByUserAndItem(User user, Item item);

    long countByUser(User user);
}
