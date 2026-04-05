package com.repmate.backend.controller;

import com.repmate.backend.model.User;
import com.repmate.backend.payload.request.ProfileUpdateRequest;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/{id}
     * Returns safe profile projection (no password).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        if (!principal.getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(toProfileMap(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/users/profile/me
     * Returns the authenticated user's full profile including onboarding data.
     */
    @GetMapping("/profile/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return userService.getUserById(principal.getId())
                .map(user -> ResponseEntity.ok(toProfileMap(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/users/profile
     * Updates the authenticated user's onboarding questionnaire answers.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest req,  // @Valid triggers Bean Validation
            Authentication authentication
    ) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        try {
            User updated = userService.updateProfile(principal.getId(), req);
            return ResponseEntity.ok(toProfileMap(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> toProfileMap(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("email", user.getEmail());
        m.put("role", user.getRole());
        m.put("createdAt", user.getCreatedAt());
        m.put("age", user.getAge());
        m.put("heightCm", user.getHeightCm());
        m.put("weightKg", user.getWeightKg());
        m.put("gender", user.getGender());
        m.put("fitnessGoal", user.getFitnessGoal());
        m.put("activityLevel", user.getActivityLevel());
        m.put("dietPreference", user.getDietPreference());
        m.put("equipmentAccess", user.getEquipmentAccess());
        m.put("workoutDaysPerWeek", user.getWorkoutDaysPerWeek());
        m.put("onboardingComplete", user.getOnboardingComplete());

        // Profile completeness calculation
        long filled = List.of(
                user.getAge(), user.getHeightCm(), user.getWeightKg(),
                user.getGender(), user.getFitnessGoal(), user.getActivityLevel(),
                user.getDietPreference(), user.getEquipmentAccess(), user.getWorkoutDaysPerWeek()
        ).stream().filter(v -> v != null).count();
        m.put("profileCompleteness", (int) Math.round((filled / 9.0) * 100));

        return m;
    }
}
