package com.mylittlepet.repository;

import com.mylittlepet.entity.CareActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareActivityRepository extends JpaRepository<CareActivity, Integer> {
    List<CareActivity> findByActivityType(String activityType);

    List<CareActivity> findByActivityTypeContainingIgnoreCase(String activityType);

    Page<CareActivity> findByActivityType(String activityType, Pageable pageable);

    @Query("SELECT ca FROM CareActivity ca WHERE " +
            "LOWER(ca.activityType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(ca.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<CareActivity> findByActivityTypeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);
}
