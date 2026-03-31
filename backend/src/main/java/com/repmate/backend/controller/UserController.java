package com.repmate.backend.controller;

import com.repmate.backend.model.User;
import com.repmate.backend.security.UserDetailsImpl;
import com.repmate.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * UserController — only exposes the authenticated user's own profile data.
 * GET /api/users and POST /api/users removed:
 *   - GET all leaked hashed passwords
 *   - POST bypassed password encoding (auth always fails for those users)
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/{id}
     * Returns safe profile projection (no password).
     * Enforces that the caller can only read their own profile.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        if (!principal.getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        return userService.getUserById(id)
                .map((User user) -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "createdAt", user.getCreatedAt()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
