package com.garibas.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequisicaoCadastro(
    @NotBlank(message = "Informe o nome.")
    @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres.")
    String name,

    @NotBlank(message = "Informe o email.")
    @Email(message = "Informe um email valido.")
    @Size(max = 160, message = "O email informado e muito longo.")
    String email,

    @NotBlank(message = "Informe a senha.")
    @Size(min = 6, max = 60, message = "A senha deve ter entre 6 e 60 caracteres.")
    String password
) {
}
