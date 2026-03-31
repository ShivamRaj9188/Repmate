package com.repmate.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * UserStreak — maps to the `user_streaks` table defined in schema.sql.
 * Tracks the current and longest workout streak per user.
 * Uses user_id as the primary key (one streak record per user).
 */
@Entity
@Table(name = "user_streaks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreak {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "current_streak")
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak")
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
}
