package com.garibas.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequisicaoRedefinirSenha(
    @NotBlank(message = "Informe o email.")
    @Email(message = "Informe um email valido.")
    @Size(max = 160, message = "O email informado e muito longo.")
    String email
) {
}
