package com.repmate.backend.controller;

import com.repmate.backend.model.WorkoutSession;
import com.repmate.backend.service.WorkoutSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService sessionService;

    @Autowired
    public WorkoutSessionController(WorkoutSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutSession>> getSessionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.getSessionsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSession> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(@RequestBody WorkoutSession session) {
        return ResponseEntity.ok(sessionService.saveSession(session));
    }
}
