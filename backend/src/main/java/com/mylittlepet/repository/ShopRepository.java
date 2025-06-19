package com.mylittlepet.repository;

import com.mylittlepet.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Integer> {

    // Find shops by type
    List<Shop> findByType(String type);

    // Find shops by name containing keyword (case insensitive)
    @Query("SELECT s FROM Shop s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Shop> findByNameContainingIgnoreCase(@Param("keyword") String keyword);

    // Search shops by name or description
    @Query("SELECT s FROM Shop s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Shop> searchShops(@Param("keyword") String keyword);

    // Find all shops ordered by name
    @Query("SELECT s FROM Shop s ORDER BY s.name ASC")
    List<Shop> findAllOrderByName();
}
