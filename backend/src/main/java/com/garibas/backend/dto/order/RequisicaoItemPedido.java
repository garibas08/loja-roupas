package com.garibas.backend.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RequisicaoItemPedido(
    @NotNull(message = "Informe o produto do item.")
    Long productId,

    @NotNull(message = "Informe a quantidade do item.")
    @Min(value = 1, message = "A quantidade minima por item e 1.")
    Integer quantity
) {
}
