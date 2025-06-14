package com.mylittlepet.repository;

import com.mylittlepet.entity.Minigame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MinigameRepository extends JpaRepository<Minigame, Integer> {
    List<Minigame> findByNameContainingIgnoreCase(String name);

    @Query("SELECT m FROM Minigame m WHERE " +
            "LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Minigame> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);
}
