package com.repmate.backend.repository;

import com.repmate.backend.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserId(Long userId);

    /**
     * Returns distinct dates on which the user completed a workout session.
     * Used for the GitHub-style heatmap calendar.
     */
    @Query("SELECT CAST(s.startTime AS LocalDate) FROM WorkoutSession s " +
           "WHERE s.user.id = :userId AND s.status = 'COMPLETED' " +
           "GROUP BY CAST(s.startTime AS LocalDate) " +
           "ORDER BY CAST(s.startTime AS LocalDate) DESC")
    List<LocalDate> findCompletedWorkoutDates(Long userId);
}
