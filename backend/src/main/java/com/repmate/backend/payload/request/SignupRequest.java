package com.repmate.backend.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * OWASP A03:2021 – Injection / Input Validation
 * Stricter constraints on registration to prevent account-creation abuse.
 */
@Data
public class SignupRequest {

    // Max 100 chars to prevent DB column overflow; pattern rejects HTML/script tags
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{M} .'-]+$",
             message = "Name may only contain letters, spaces, hyphens, apostrophes, and dots")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    private String email;

    // Min 8 enforced here AND in frontend.
    // Max 128 prevents BCrypt DoS — BCrypt is O(n) in password length.
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    private String password;
}
