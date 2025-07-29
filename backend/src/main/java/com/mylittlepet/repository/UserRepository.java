package com.mylittlepet.repository;

import com.mylittlepet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Auth related methods
    Optional<User> findByEmail(String email);

    Optional<User> findByUserName(String userName);

    boolean existsByEmail(String email);

    boolean existsByUserName(String userName);

    // Case-insensitive email checks for nvarchar compatibility
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmailIgnoreCase(@Param("email") String email);

    // Find admin by email for login (exclude players)
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.role != 'Player'")
    Optional<User> findAdminByEmail(@Param("email") String email);

    // Player management related methods
    @Query("SELECT u FROM User u WHERE u.role = 'Player'")
    List<User> findAllPlayers();

    @Query("SELECT u FROM User u WHERE u.role = 'Player' ORDER BY u.joinDate DESC")
    List<User> findPlayersByStatus();

    @Query("SELECT u FROM User u WHERE u.role = 'Player' AND " +
            "(u.userName LIKE %:keyword% OR u.email LIKE %:keyword%)")
    List<User> searchPlayers(@Param("keyword") String keyword);

    // Admin related methods
    @Query("SELECT u FROM User u WHERE u.role = 'Admin'")
    List<User> findAllAdmins();
}
