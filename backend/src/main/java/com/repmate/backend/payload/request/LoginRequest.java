package com.repmate.backend.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * OWASP A03:2021 – Injection / Input Validation
 * Strict constraints on login credentials to reject malformed input early.
 */
@Data
public class LoginRequest {

    // Email format enforced — prevents plain-text injection in auth lookup
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    private String email;

    // Length limit prevents excessively large payloads being sent to BCrypt
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    private String password;
}
