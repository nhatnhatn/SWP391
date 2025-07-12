package com.mylittlepet.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private String token;
    private String tokenType = "Bearer";
    private AdminInfo adminInfo;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, AdminInfo adminInfo) {
        this.success = success;
        this.message = message;
        this.adminInfo = adminInfo;
    }

    public LoginResponse(boolean success, String message, String token, AdminInfo adminInfo) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.adminInfo = adminInfo;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public AdminInfo getAdminInfo() {
        return adminInfo;
    }

    public void setAdminInfo(AdminInfo adminInfo) {
        this.adminInfo = adminInfo;
    }
}
