package com.garibas.backend.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    String id,
    List<OrderItemResponse> items,
    BigDecimal subtotal,
    BigDecimal shippingFee,
    BigDecimal total,
    Instant createdAt,
    OrderCustomerResponse customer
) {
}
