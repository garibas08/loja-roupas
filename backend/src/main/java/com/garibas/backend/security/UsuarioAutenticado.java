package com.garibas.backend.security;

import com.garibas.backend.entity.PerfilUsuario;

public record UsuarioAutenticado(
    Long id,
    String name,
    String email,
    PerfilUsuario role
) {
}
