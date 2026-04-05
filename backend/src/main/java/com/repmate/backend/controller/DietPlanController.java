package com.repmate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.repmate.backend.model.DietPlan;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.DietPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/diet")
public class DietPlanController {

    private final DietPlanService dietPlanService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public DietPlanController(DietPlanService dietPlanService) {
        this.dietPlanService = dietPlanService;
    }

    /**
     * GET /api/diet/plan
     * Returns the latest diet plan for the authenticated user.
     * If no plan exists yet, generates one on the fly.
     */
    @GetMapping("/plan")
    public ResponseEntity<?> getPlan(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = principal.getId();

        Optional<DietPlan> existing = dietPlanService.getLatestPlan(userId);
        DietPlan plan = existing.orElseGet(() -> dietPlanService.generateOrRefreshPlan(userId));

        return buildPlanResponse(plan);
    }

    /**
     * POST /api/diet/regenerate
     * Generates a fresh 7-day plan (discards the old one).
     */
    @PostMapping("/regenerate")
    public ResponseEntity<?> regenerate(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        DietPlan plan = dietPlanService.generateOrRefreshPlan(principal.getId());
        return buildPlanResponse(plan);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private ResponseEntity<?> buildPlanResponse(DietPlan plan) {
        try {
            List<?> weekPlan = objectMapper.readValue(plan.getPlanJson(), List.class);
            return ResponseEntity.ok(Map.of(
                "id", plan.getId(),
                "generatedAt", plan.getGeneratedAt().toString(),
                "tdee", plan.getTdee(),
                "targetCalories", plan.getTargetCalories(),
                "weekPlan", weekPlan
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to parse diet plan"));
        }
    }
}
