package com.garibas.backend.security;

public record AuthenticatedUser(
    Long id,
    String name,
    String email
) {
}
