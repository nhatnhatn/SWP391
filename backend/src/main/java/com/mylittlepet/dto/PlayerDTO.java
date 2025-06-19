package com.mylittlepet.dto;

import com.mylittlepet.entity.User;
import java.time.LocalDateTime;

public class PlayerDTO {

    private Integer id;
    private String userName;
    private String email;
    private String userStatus;
    private Integer level;
    private Integer coin;
    private Integer diamond;
    private Integer gem;
    private LocalDateTime joinDate;

    // Constructors
    public PlayerDTO() {
    }

    public PlayerDTO(Integer id, String userName, String email, String userStatus,
            Integer level, Integer coin, Integer diamond, Integer gem,
            LocalDateTime joinDate) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.userStatus = userStatus;
        this.level = level;
        this.coin = coin;
        this.diamond = diamond;
        this.gem = gem;
        this.joinDate = joinDate;
    }

    // Convert from User entity to PlayerDTO
    public static PlayerDTO fromUser(User user) {
        if (user == null) {
            return null;
        }

        PlayerDTO playerDTO = new PlayerDTO();
        playerDTO.setId(user.getId());
        playerDTO.setUserName(user.getUserName());
        playerDTO.setEmail(user.getEmail());
        playerDTO.setUserStatus(user.getUserStatus());
        playerDTO.setLevel(user.getLevel());
        playerDTO.setCoin(user.getCoin());
        playerDTO.setDiamond(user.getDiamond());
        playerDTO.setGem(user.getGem());
        playerDTO.setJoinDate(user.getJoinDate());

        return playerDTO;
    }

    // Convert from PlayerDTO to User entity
    public User toUser() {
        User user = new User();
        user.setId(this.id);
        user.setRole("PLAYER"); // Always set as PLAYER
        user.setUserName(this.userName);
        user.setEmail(this.email);
        user.setUserStatus(this.userStatus);
        user.setLevel(this.level);
        user.setCoin(this.coin);
        user.setDiamond(this.diamond);
        user.setGem(this.gem);
        user.setJoinDate(this.joinDate);

        return user;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
