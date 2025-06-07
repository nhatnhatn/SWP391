package com.mylittlepet.repository;

import com.mylittlepet.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT i FROM Item i WHERE " +
            "LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Item> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);

    Page<Item> findByType(Item.ItemType type, Pageable pageable);

    Page<Item> findByRarity(Item.RarityType rarity, Pageable pageable);

    @Query("SELECT i FROM Item i WHERE " +
            "(LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:type IS NULL OR i.type = :type) AND " +
            "(:rarity IS NULL OR i.rarity = :rarity)")
    Page<Item> findItemsWithFilters(
            @Param("search") String search,
            @Param("type") Item.ItemType type,
            @Param("rarity") Item.RarityType rarity,
            Pageable pageable);
}
