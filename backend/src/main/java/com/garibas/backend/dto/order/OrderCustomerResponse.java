package com.garibas.backend.dto.order;

public record OrderCustomerResponse(
    String name,
    String address,
    String number,
    String city,
    String state,
    String cep,
    String paymentMethod
) {
}
