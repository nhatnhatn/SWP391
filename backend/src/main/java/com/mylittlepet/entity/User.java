package com.mylittlepet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "[User]")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @NotBlank(message = "Role is required")
    @Column(name = "Role", nullable = false, length = 50)
    private String role = "Admin";

    @Column(name = "UserName", length = 100)
    private String userName;

    @Email(message = "Email should be valid")
    @Column(name = "Email", unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(name = "Password", nullable = false, length = 100)
    private String password;
    @Column(name = "Level", insertable = true)
    private Integer level = null;

    @Column(name = "Coin", insertable = true)
    private Integer coin = null;

    @Column(name = "Diamond", insertable = true)
    private Integer diamond = null;

    @Column(name = "Gem", insertable = true)
    private Integer gem = null;

    @Column(name = "JoinDate")
    private LocalDateTime joinDate;

    // Constructors
    public User() {
    }

    public User(String userName, String password, String email) {
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.role = "ADMIN";
        // Explicitly set null để override database DEFAULT values
        this.level = null;
        this.coin = null;
        this.diamond = null;
        this.gem = null;
    }

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        this.joinDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getCoin() {
        return coin;
    }

    public void setCoin(Integer coin) {
        this.coin = coin;
    }

    public Integer getDiamond() {
        return diamond;
    }

    public void setDiamond(Integer diamond) {
        this.diamond = diamond;
    }

    public Integer getGem() {
        return gem;
    }

    public void setGem(Integer gem) {
        this.gem = gem;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }
}
