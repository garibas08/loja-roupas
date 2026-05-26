package com.garibas.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordResetConfirmRequest(
    @NotBlank(message = "Informe o email.")
    @Email(message = "Informe um email valido.")
    @Size(max = 160, message = "O email informado e muito longo.")
    String email,

    @NotBlank(message = "Informe o codigo recebido.")
    @Pattern(regexp = "\\d{6}", message = "Informe o codigo de 6 digitos.")
    String code,

    @NotBlank(message = "Informe a nova senha.")
    @Size(min = 6, max = 60, message = "A senha deve ter entre 6 e 60 caracteres.")
    String newPassword
) {
}
