package com.repmate.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "diet_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column
    private Integer tdee;

    @Column(name = "target_calories")
    private Integer targetCalories;

    // Stores the 7-day plan as a JSON string
    @Column(name = "plan_json", columnDefinition = "TEXT")
    private String planJson;
}
