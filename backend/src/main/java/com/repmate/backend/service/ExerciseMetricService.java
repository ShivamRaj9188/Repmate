package com.repmate.backend.service;

import com.repmate.backend.model.ExerciseMetric;
import com.repmate.backend.repository.ExerciseMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciseMetricService {

    private final ExerciseMetricRepository metricRepository;

    @Autowired
    public ExerciseMetricService(ExerciseMetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    public List<ExerciseMetric> getMetricsBySessionId(Long sessionId) {
        return metricRepository.findBySessionId(sessionId);
    }

    public ExerciseMetric saveMetric(ExerciseMetric metric) {
        return metricRepository.save(metric);
    }
}
