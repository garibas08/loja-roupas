package com.garibas.backend.dto.auth;

public record RespostaUsuario(
    Long id,
    String name,
    String email,
    String role
) {
}
