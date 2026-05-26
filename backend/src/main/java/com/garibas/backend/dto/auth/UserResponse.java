package com.garibas.backend.dto.auth;

public record UserResponse(
    Long id,
    String name,
    String email
) {
}
