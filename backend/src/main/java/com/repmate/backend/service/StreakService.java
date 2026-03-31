package com.repmate.backend.service;

import com.repmate.backend.model.User;
import com.repmate.backend.model.UserStreak;
import com.repmate.backend.repository.UserRepository;
import com.repmate.backend.repository.UserStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class StreakService {

    private final UserStreakRepository streakRepository;
    private final UserRepository userRepository;

    @Autowired
    public StreakService(UserStreakRepository streakRepository, UserRepository userRepository) {
        this.streakRepository = streakRepository;
        this.userRepository = userRepository;
    }

    /**
     * Returns the streak record for a user, or a zero-streak default if none exists.
     */
    public UserStreak getStreak(Long userId) {
        return streakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .build());
    }

    /**
     * Updates the streak when a session is completed.
     * Rules:
     *   - Same day as lastActiveDate → no change (already counted today)
     *   - Previous day → increment currentStreak
     *   - Any gap greater than 1 day → reset currentStreak to 1
     */
    public UserStreak updateStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Optional<UserStreak> existing = streakRepository.findByUserId(userId);
        UserStreak streak = existing.orElse(UserStreak.builder()
                .userId(userId)
                .user(user)
                .currentStreak(0)
                .longestStreak(0)
                .build());

        LocalDate today = LocalDate.now();
        LocalDate last = streak.getLastActiveDate();

        if (last == null) {
            // First ever session
            streak.setCurrentStreak(1);
        } else if (last.equals(today)) {
            // Already completed a session today — no change
            return streak;
        } else if (last.equals(today.minusDays(1))) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            // Streak broken
            streak.setCurrentStreak(1);
        }

        // Update longest streak
        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        streak.setLastActiveDate(today);
        streak.setUser(user);
        return streakRepository.save(streak);
    }
}
