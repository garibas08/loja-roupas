package com.garibas.backend.dto.product;

import java.math.BigDecimal;
import java.util.List;

public record RespostaProduto(
    Long id,
    String name,
    BigDecimal price,
    String image,
    String category,
    String description,
    List<String> sizes
) {
}
