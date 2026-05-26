package com.garibas.backend.entity;

import java.util.Arrays;

public enum ProductCategory {
    MASCULINO("Masculino"),
    FEMININO("Feminino"),
    ACESSORIOS("Acessorios"),
    INFANTIL("Infantil");

    private final String label;

    ProductCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ProductCategory fromLabel(String value) {
        return Arrays.stream(values())
            .filter(category -> category.label.equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Categoria invalida: " + value));
    }
}
