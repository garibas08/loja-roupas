package com.garibas.backend.dto.auth;

public record AuthResponse(
    String token,
    UserResponse user,
    String message
) {
}
