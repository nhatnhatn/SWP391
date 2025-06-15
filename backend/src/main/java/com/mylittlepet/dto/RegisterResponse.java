package com.mylittlepet.dto;

public class RegisterResponse {

    private boolean success;
    private String message;
    private AdminInfo adminInfo;

    // Constructors
    public RegisterResponse() {
    }

    public RegisterResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public RegisterResponse(boolean success, String message, AdminInfo adminInfo) {
        this.success = success;
        this.message = message;
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

    public AdminInfo getAdminInfo() {
        return adminInfo;
    }

    public void setAdminInfo(AdminInfo adminInfo) {
        this.adminInfo = adminInfo;
    }
}
