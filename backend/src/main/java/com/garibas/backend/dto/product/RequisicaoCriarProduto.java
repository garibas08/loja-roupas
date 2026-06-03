package com.garibas.backend.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record RequisicaoCriarProduto(
    @NotBlank(message = "Informe o nome do produto.")
    @Size(max = 140, message = "O nome deve ter no maximo 140 caracteres.")
    String name,

    @NotNull(message = "Informe o preco.")
    @DecimalMin(value = "0.01", message = "O preco deve ser maior que zero.")
    BigDecimal price,

    @NotBlank(message = "Informe a imagem do produto.")
    String image,

    @NotBlank(message = "Informe a categoria.")
    String category,

    @NotBlank(message = "Informe a descricao.")
    @Size(max = 700, message = "A descricao deve ter no maximo 700 caracteres.")
    String description,

    @NotEmpty(message = "Informe ao menos um tamanho.")
    @Size(max = 12, message = "Informe no maximo 12 tamanhos.")
    List<@NotBlank(message = "Informe um tamanho valido.") @Size(max = 20, message = "Cada tamanho deve ter no maximo 20 caracteres.") String> sizes
) {
}
