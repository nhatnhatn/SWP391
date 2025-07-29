package com.mylittlepet.exception;

/**
 * Custom exception for email uniqueness violations
 * Thrown when attempting to register/update with an existing email
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Email already exists: " + email);
    }

    public EmailAlreadyExistsException(String email, Throwable cause) {
        super("Email already exists: " + email, cause);
    }
}
