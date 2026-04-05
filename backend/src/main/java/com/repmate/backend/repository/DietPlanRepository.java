package com.repmate.backend.repository;

import com.repmate.backend.model.DietPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {
    Optional<DietPlan> findTopByUserIdOrderByGeneratedAtDesc(Long userId);
}
