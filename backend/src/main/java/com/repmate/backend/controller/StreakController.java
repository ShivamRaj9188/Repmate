package com.repmate.backend.controller;

import com.repmate.backend.model.UserStreak;
import com.repmate.backend.repository.WorkoutSessionRepository;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.StreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * StreakController — exposes streak data for the authenticated user.
 * GET /api/streaks/me              — current streak, longest streak, last active date
 * GET /api/streaks/me/history      — list of dates with completed workouts (for heatmap)
 */
@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    private final StreakService streakService;
    private final WorkoutSessionRepository sessionRepository;

    @Autowired
    public StreakController(StreakService streakService, WorkoutSessionRepository sessionRepository) {
        this.streakService = streakService;
        this.sessionRepository = sessionRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyStreak(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        UserStreak streak = streakService.getStreak(principal.getId());

        LocalDate lastActive = streak.getLastActiveDate();
        boolean atRisk = lastActive != null && !lastActive.equals(LocalDate.now());
        int current = streak.getCurrentStreak();

        // Milestone badge
        String badge = null;
        if (current >= 30)     badge = "30-Day Legend";
        else if (current >= 14) badge = "14-Day Warrior";
        else if (current >= 7)  badge = "7-Day Streak";
        else if (current >= 3)  badge = "3-Day Streak";

        return ResponseEntity.ok(Map.of(
            "currentStreak",   current,
            "longestStreak",   streak.getLongestStreak(),
            "lastActiveDate",  lastActive != null ? lastActive.toString() : "",
            "streakAtRisk",    atRisk,
            "milestoneBadge",  badge != null ? badge : ""
        ));
    }

    /**
     * GET /api/streaks/me/history
     * Returns an array of ISO date strings for the heatmap.
     */
    @GetMapping("/me/history")
    public ResponseEntity<List<String>> getStreakHistory(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        List<LocalDate> dates = sessionRepository.findCompletedWorkoutDates(principal.getId());
        List<String> isoStrings = dates.stream().map(LocalDate::toString).toList();
        return ResponseEntity.ok(isoStrings);
    }
}
