package com.mylittlepet.repository;

import com.mylittlepet.entity.Shop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Integer> {
    List<Shop> findByType(String type);

    List<Shop> findByNameContainingIgnoreCase(String name);

    Page<Shop> findByType(String type, Pageable pageable);

    @Query("SELECT s FROM Shop s WHERE " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Shop> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);
}
