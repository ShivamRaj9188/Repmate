package com.repmate.backend.repository;

import com.repmate.backend.model.ExerciseMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseMetricRepository extends JpaRepository<ExerciseMetric, Long> {
    List<ExerciseMetric> findBySessionId(Long sessionId);
}
