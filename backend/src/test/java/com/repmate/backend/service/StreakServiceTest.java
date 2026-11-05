package com.repmate.backend.service;

import com.repmate.backend.model.User;
import com.repmate.backend.repository.UserRepository;
import com.repmate.backend.repository.UserStreakRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Real Hibernate on H2: the bug only appears when a new UserStreak is actually saved.
@DataJpaTest(properties = "spring.datasource.url=jdbc:h2:mem:streak;MODE=PostgreSQL")
@Import(StreakService.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class StreakServiceTest {

    @Autowired StreakService streakService;
    @Autowired UserRepository userRepository;
    @Autowired UserStreakRepository streakRepository;

    @Test
    void firstCompletedSessionCreatesStreak() {
        User user = userRepository.save(User.builder()
                .name("Test User").email("streak@repmate.test").password("x").role("USER").build());

        streakService.updateStreak(user.getId());

        assertEquals(1, streakRepository.findByUserId(user.getId()).orElseThrow().getCurrentStreak());
    }
}
