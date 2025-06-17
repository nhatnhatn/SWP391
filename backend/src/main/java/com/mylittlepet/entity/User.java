package com.mylittlepet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "[User]")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Role", nullable = false, length = 50)
    private String role;

    @Column(name = "UserName", length = 100)
    private String userName;

    @Column(name = "Email", unique = true, length = 100)
    private String email;

    @Column(name = "Password", nullable = false, length = 100)
    private String password;

    @Column(name = "UserStatus", length = 20)
    private String userStatus = "ACTIVE";

    @Column(name = "Level")
    private Integer level = 1;

    @Column(name = "Coin")
    private Integer coin = 0;

    @Column(name = "Diamond")
    private Integer diamond = 0;

    @Column(name = "Gem")
    private Integer gem = 0;
    @Column(name = "JoinDate")
    private LocalDateTime joinDate;

    // Constructors
    public User() {
    }

    public User(String role, String userName, String email, String password) {
        this.role = role;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.userStatus = "ACTIVE";
        this.level = 1;
        this.coin = 0;
        this.diamond = 0;
        this.gem = 0;
    }

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        if (this.joinDate == null) {
            this.joinDate = LocalDateTime.now();
        }
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

    public String getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
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
