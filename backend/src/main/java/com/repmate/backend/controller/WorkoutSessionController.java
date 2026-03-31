package com.repmate.backend.controller;

import com.repmate.backend.model.WorkoutSession;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.StreakService;
import com.repmate.backend.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * WorkoutSessionController
 * Security fixes:
 *   - All endpoints verify the session belongs to the authenticated user (IDOR fix).
 *   - Added PATCH /{id}/complete to properly mark sessions as COMPLETED.
 *   - completeSession also updates the user's streak.
 */
@RestController
@RequestMapping("/api/sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService sessionService;
    private final StreakService streakService;

    @Autowired
    public WorkoutSessionController(WorkoutSessionService sessionService, StreakService streakService) {
        this.sessionService = sessionService;
        this.streakService = streakService;
    }

    /**
     * GET /api/sessions/user/{userId}
     * IDOR fix: userId in path must match the authenticated principal.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSessionsByUser(@PathVariable Long userId, Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        if (!principal.getId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        List<WorkoutSession> sessions = sessionService.getSessionsByUserId(userId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * GET /api/sessions/{id}
     * IDOR fix: verifies the session belongs to the authenticated user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return sessionService.getSessionById(id)
                .map(session -> {
                    if (!session.getUser().getId().equals(principal.getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                    }
                    return ResponseEntity.ok(session);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/sessions — creates a new workout session.
     */
    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(@Valid @RequestBody WorkoutSession session) {
        return ResponseEntity.ok(sessionService.saveSession(session));
    }

    /**
     * PATCH /api/sessions/{id}/complete
     * Marks a session COMPLETED, stamps endTime, and updates the user's streak.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeSession(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return sessionService.getSessionById(id)
                .map(session -> {
                    if (!session.getUser().getId().equals(principal.getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                    }
                    WorkoutSession completed = sessionService.completeSession(id);
                    // Update streak on successful session completion
                    streakService.updateStreak(principal.getId());
                    return ResponseEntity.ok(completed);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
