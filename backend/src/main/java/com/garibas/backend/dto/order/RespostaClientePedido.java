package com.garibas.backend.dto.order;

public record RespostaClientePedido(
    String name,
    String email,
    String address,
    String number,
    String city,
    String state,
    String cep,
    String paymentMethod
) {
}
