package com.garibas.backend.dto.order;

import java.math.BigDecimal;

public record RespostaItemPedido(
    Long id,
    String name,
    BigDecimal price,
    String image,
    String description,
    Integer quantity
) {
}
