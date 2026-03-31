package com.repmate.backend.controller;

import com.repmate.backend.model.UserStreak;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.StreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * StreakController — exposes streak data for the authenticated user.
 * GET /api/streaks/me — returns current streak, longest streak, last active date.
 */
@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    private final StreakService streakService;

    @Autowired
    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    /**
     * GET /api/streaks/me
     * Returns the authenticated user's streak data.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyStreak(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        UserStreak streak = streakService.getStreak(principal.getId());
        return ResponseEntity.ok(Map.of(
                "currentStreak", streak.getCurrentStreak(),
                "longestStreak", streak.getLongestStreak(),
                "lastActiveDate", streak.getLastActiveDate() != null ? streak.getLastActiveDate().toString() : null
        ));
    }
}
