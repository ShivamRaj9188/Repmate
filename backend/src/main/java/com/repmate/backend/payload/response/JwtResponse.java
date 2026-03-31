package com.repmate.backend.payload.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;

    public JwtResponse(String accessToken, Long id, String email, String name) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
    }
}
