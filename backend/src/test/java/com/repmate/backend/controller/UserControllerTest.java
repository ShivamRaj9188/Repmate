package com.repmate.backend.controller;

import com.repmate.backend.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserControllerTest {

    @Test
    void profileWithUnfilledFieldsReportsCompleteness() {
        User newUser = User.builder().name("New User").email("new@repmate.test").build();
        assertEquals(0, new UserController(null).toProfileMap(newUser).get("profileCompleteness"));

        newUser.setAge(26);
        assertEquals(11, new UserController(null).toProfileMap(newUser).get("profileCompleteness"));
    }
}
