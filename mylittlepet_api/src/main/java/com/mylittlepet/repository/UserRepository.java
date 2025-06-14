package com.mylittlepet.repository;

import com.mylittlepet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

        Optional<User> findByUserName(String userName);

        Optional<User> findByEmail(String email);

        boolean existsByUserName(String userName);

        boolean existsByEmail(String email);

        List<User> findByRole(String role);

        @Query("SELECT u FROM User u WHERE " +
                        "LOWER(u.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
        List<User> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        @Param("search") String search);

        @Query("SELECT u FROM User u WHERE " +
                        "LOWER(u.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
        Page<User> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        @Param("search") String search, Pageable pageable);

        Page<User> findByRole(String role, Pageable pageable);

        @Query("SELECT u FROM User u WHERE u.role = :role AND " +
                        "(LOWER(u.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<User> findByRoleAndUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        @Param("role") String role,
                        @Param("search") String search,
                        Pageable pageable);

        // Additional methods for compatibility
        Optional<User> findByUsername(String username);

        boolean existsByUsername(String username);

        @Query("SELECT u FROM User u WHERE " +
                        "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
        List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(@Param("search") String search);
}
