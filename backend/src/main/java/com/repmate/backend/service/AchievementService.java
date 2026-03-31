package com.repmate.backend.service;

import com.repmate.backend.model.Achievement;
import com.repmate.backend.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    public List<Achievement> getAchievementsByUserId(Long userId) {
        return achievementRepository.findByUserId(userId);
    }

    public Achievement saveAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }
}
