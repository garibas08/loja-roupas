package com.garibas.backend.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    String name,
    BigDecimal price,
    String image,
    String description,
    Integer quantity
) {
}
