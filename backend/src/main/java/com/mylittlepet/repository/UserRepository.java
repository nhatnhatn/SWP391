package com.mylittlepet.repository;

import com.mylittlepet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("SELECT u FROM User u WHERE u.userName = :userName")
    Optional<User> findByUserName(@Param("userName") String userName);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.userName = :userName")
    boolean existsByUserName(@Param("userName") String userName);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);

    @Modifying
    @Query(value = "INSERT INTO [User] (Role, UserName, Email, Password, Level, Coin, Diamond, Gem, JoinDate) " +
            "VALUES (:role, :userName, :email, :password, NULL, NULL, NULL, NULL, GETDATE())", nativeQuery = true)
    void insertUserWithNullGameFields(@Param("role") String role,
            @Param("userName") String userName,
            @Param("email") String email,
            @Param("password") String password);
}
