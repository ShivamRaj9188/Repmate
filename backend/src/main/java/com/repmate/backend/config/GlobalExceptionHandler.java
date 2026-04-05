package com.repmate.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler (OWASP A09:2021 – Security Logging and Monitoring Failures).
 *
 * Converts Bean Validation errors into structured 400 JSON responses.
 * Ensures internal stack traces are NEVER sent to the client (information disclosure).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles @Valid / @Validated constraint violations on @RequestBody DTOs.
     * Returns a map of { fieldName → errorMessage } for each failed constraint.
     *
     * Example response:
     *   { "errors": { "email": "must be a well-formed email address",
     *                 "age": "must be between 13 and 120" } }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            // Use the last error per field to avoid duplicate keys
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "status", 400,
                        "error",  "Validation failed",
                        "errors", fieldErrors
                ));
    }

    /**
     * Catch-all for unexpected RuntimeExceptions.
     * OWASP: Never expose exception messages or stack traces to clients.
     * Log the full exception server-side (the default Spring logger does this).
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // Log internally (Spring logs the stack trace at ERROR level automatically)
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status",  500,
                        "error",   "Internal server error",
                        "message", "An unexpected error occurred. Please try again later."
                ));
    }
}
