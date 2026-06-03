package com.garibas.backend.dto.auth;

public record RespostaAutenticacao(
    String token,
    RespostaUsuario user,
    String message
) {
}
