package com.repmate.backend.payload.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * OWASP A03:2021 – Injection / Input Validation
 *
 * All string-enum fields are validated with @Pattern so only known enum values
 * can be persisted. Numeric fields are range-checked to reject absurd values
 * that could distort the TDEE/diet calculations.
 *
 * All fields are optional (nullable) for sparse profile updates.
 */
@Data
public class ProfileUpdateRequest {

    // ── Personal Info ────────────────────────────────────────────────────────

    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Name can only contain letters and spaces")
    private String name;
    
    @Size(max = 1048576, message = "Profile picture payload is too large, maximum allowed is ~750KB")
    @Pattern(regexp = "^(data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)?$", message = "Invalid profile picture format. Must be a valid base64 image (jpeg, png, webp)")
    private String profilePicture;

    // ── Numeric body stats ───────────────────────────────────────────────────

    @Min(value = 13,  message = "Age must be at least 13")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;

    @DecimalMin(value = "50.0",  message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height must be at most 300 cm")
    private BigDecimal heightCm;

    @DecimalMin(value = "20.0",  message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @Min(value = 1, message = "Workout days per week must be at least 1")
    @Max(value = 7, message = "Workout days per week must be at most 7")
    private Integer workoutDaysPerWeek;

    // ── String enums — only exact known values accepted ──────────────────────

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$",
             message = "Gender must be one of: MALE, FEMALE, OTHER")
    private String gender;

    @Pattern(regexp = "^(WEIGHT_LOSS|MUSCLE_GAIN|ENDURANCE|FLEXIBILITY|STAY_ACTIVE)$",
             message = "Invalid fitness goal value")
    private String fitnessGoal;

    @Pattern(regexp = "^(SEDENTARY|LIGHTLY_ACTIVE|MODERATELY_ACTIVE|VERY_ACTIVE)$",
             message = "Invalid activity level value")
    private String activityLevel;

    @Pattern(regexp = "^(NO_PREFERENCE|VEGETARIAN|VEGAN|NON_VEG|KETO)$",
             message = "Invalid diet preference value")
    private String dietPreference;

    @Pattern(regexp = "^(NONE|RESISTANCE_BANDS|DUMBBELLS|FULL_GYM)$",
             message = "Invalid equipment access value")
    private String equipmentAccess;
}
