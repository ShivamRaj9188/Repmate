package com.repmate.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    @Column(nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be empty")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    @Builder.Default
    private String role = "USER";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Questionnaire / Onboarding profile fields ────────────────────────
    @Column
    private Integer age;

    @Column(name = "height_cm", precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(length = 20)
    private String gender;

    @Column(name = "fitness_goal", length = 50)
    private String fitnessGoal;

    @Column(name = "activity_level", length = 50)
    private String activityLevel;

    @Column(name = "diet_preference", length = 50)
    private String dietPreference;

    @Column(name = "equipment_access", length = 50)
    private String equipmentAccess;

    @Column(name = "workout_days_per_week")
    private Integer workoutDaysPerWeek;

    @Column(name = "onboarding_complete")
    @Builder.Default
    private Boolean onboardingComplete = false;
}
