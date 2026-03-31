package com.repmate.backend.controller;

import com.repmate.backend.model.Achievement;
import com.repmate.backend.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    @Autowired
    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Achievement>> getAchievementsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(achievementService.getAchievementsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Achievement> createAchievement(@RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementService.saveAchievement(achievement));
    }
}
