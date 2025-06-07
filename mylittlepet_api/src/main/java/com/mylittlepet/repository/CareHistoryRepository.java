package com.mylittlepet.repository;

import com.mylittlepet.entity.CareHistory;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareHistoryRepository extends JpaRepository<CareHistory, Long> {

    List<CareHistory> findByUser(User user);

    Page<CareHistory> findByUser(User user, Pageable pageable);

    List<CareHistory> findByPet(Pet pet);

    Page<CareHistory> findByPet(Pet pet, Pageable pageable);

    List<CareHistory> findByUserOrderByDateDesc(User user);

    List<CareHistory> findByPetOrderByDateDesc(Pet pet);
}
