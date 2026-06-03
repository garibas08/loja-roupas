package com.garibas.backend.entity;

import java.util.Arrays;

public enum FormaPagamento {
    CARTAO("Cartao"),
    PIX("Pix"),
    BOLETO("Boleto");

    private final String label;

    FormaPagamento(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static FormaPagamento fromLabel(String value) {
        return Arrays.stream(values())
            .filter(method -> method.label.equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Forma de pagamento invalida: " + value));
    }
}
