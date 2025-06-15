package com.mylittlepet.repository;

import com.mylittlepet.entity.Achievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Integer> {
    List<Achievement> findByAchievementNameContainingIgnoreCase(String achievementName);

    @Query("SELECT a FROM Achievement a WHERE " +
            "LOWER(a.achievementName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Achievement> findByAchievementNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);
}
