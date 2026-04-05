package com.repmate.backend.service;

import com.repmate.backend.model.User;
import com.repmate.backend.payload.request.ProfileUpdateRequest;
import com.repmate.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Update the onboarding profile fields for a user.
     * Only non-null fields in the request are applied (sparse update).
     */
    public User updateProfile(Long userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (req.getName()               != null) user.setName(req.getName());
        if (req.getAge()                != null) user.setAge(req.getAge());
        if (req.getHeightCm()           != null) user.setHeightCm(req.getHeightCm());
        if (req.getWeightKg()           != null) user.setWeightKg(req.getWeightKg());
        if (req.getGender()             != null) user.setGender(req.getGender());
        if (req.getFitnessGoal()        != null) user.setFitnessGoal(req.getFitnessGoal());
        if (req.getActivityLevel()      != null) user.setActivityLevel(req.getActivityLevel());
        if (req.getDietPreference()     != null) user.setDietPreference(req.getDietPreference());
        if (req.getEquipmentAccess()    != null) user.setEquipmentAccess(req.getEquipmentAccess());
        if (req.getWorkoutDaysPerWeek() != null) user.setWorkoutDaysPerWeek(req.getWorkoutDaysPerWeek());

        user.setOnboardingComplete(true);
        return userRepository.save(user);
    }
}
