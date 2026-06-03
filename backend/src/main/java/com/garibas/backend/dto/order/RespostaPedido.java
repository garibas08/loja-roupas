package com.garibas.backend.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record RespostaPedido(
    String id,
    List<RespostaItemPedido> items,
    BigDecimal subtotal,
    BigDecimal shippingFee,
    BigDecimal total,
    Instant createdAt,
    RespostaClientePedido customer
) {
}
