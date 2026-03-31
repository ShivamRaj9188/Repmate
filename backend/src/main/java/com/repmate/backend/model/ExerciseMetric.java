package com.repmate.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Fix: @JsonIgnoreProperties prevents LazyInitializationException when Jackson
    // serializes the lazy-loaded WorkoutSession outside of a transaction.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private WorkoutSession session;

    // Security Hardening: Validations prevent negative illogical inputs
    @Min(value = 0, message = "Reps cannot be negative")
    @Builder.Default
    private Integer reps = 0;

    @DecimalMin(value = "0.0", message = "Speed cannot be negative")
    @Column(name = "avg_speed", precision = 5, scale = 2)
    private BigDecimal avgSpeed;

    @DecimalMin(value = "0.0", message = "Accuracy cannot be negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal accuracy;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;
}
