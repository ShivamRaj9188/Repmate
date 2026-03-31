package com.repmate.backend.controller;

import com.repmate.backend.model.ExerciseMetric;
import com.repmate.backend.service.ExerciseMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class ExerciseMetricController {

    private final ExerciseMetricService metricService;

    @Autowired
    public ExerciseMetricController(ExerciseMetricService metricService) {
        this.metricService = metricService;
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ExerciseMetric>> getMetricsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(metricService.getMetricsBySessionId(sessionId));
    }

    @PostMapping
    public ResponseEntity<ExerciseMetric> createMetric(@RequestBody ExerciseMetric metric) {
        return ResponseEntity.ok(metricService.saveMetric(metric));
    }
}
