package com.repmate.backend.service;

import com.repmate.backend.model.WorkoutSession;
import com.repmate.backend.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;

    @Autowired
    public WorkoutSessionService(WorkoutSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<WorkoutSession> getSessionsByUserId(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    public Optional<WorkoutSession> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public WorkoutSession saveSession(WorkoutSession session) {
        return sessionRepository.save(session);
    }
}
