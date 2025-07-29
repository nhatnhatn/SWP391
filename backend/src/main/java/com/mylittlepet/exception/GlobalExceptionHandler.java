package com.mylittlepet.exception;

import com.mylittlepet.dto.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import jakarta.validation.ConstraintViolationException;

/**
 * Global Exception Handler for handling various types of exceptions
 * Provides consistent error responses across the application
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle email already exists exception
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex, WebRequest request) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse(false, ex.getMessage()));
    }

    /**
     * Handle database integrity violations (including unique constraints)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        String message = "Data integrity violation";

        // Check if it's an email uniqueness violation
        if (ex.getMessage() != null) {
            if (ex.getMessage().toLowerCase().contains("email")) {
                message = "Email already exists";
            } else if (ex.getMessage().toLowerCase().contains("username")) {
                message = "Username already exists";
            } else if (ex.getMessage().toLowerCase().contains("unique")) {
                message = "Duplicate entry detected";
            }
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse(false, message));
    }

    /**
     * Handle validation errors (Bean Validation)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        StringBuilder message = new StringBuilder("Validation failed: ");
        ex.getBindingResult().getFieldErrors().forEach(error -> message.append(error.getField())
                .append(" - ")
                .append(error.getDefaultMessage())
                .append("; "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, message.toString()));
    }

    /**
     * Handle constraint violations
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse> handleConstraintViolation(
            ConstraintViolationException ex) {

        StringBuilder message = new StringBuilder("Constraint violation: ");
        ex.getConstraintViolations().forEach(violation -> message.append(violation.getPropertyPath())
                .append(" - ")
                .append(violation.getMessage())
                .append("; "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, message.toString()));
    }

    /**
     * Handle general exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneral(Exception ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "An unexpected error occurred: " + ex.getMessage()));
    }
}
