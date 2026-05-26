package com.garibas.backend.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank(message = "Informe o nome.")
    @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres.")
    String name,

    @NotBlank(message = "Informe o endereco.")
    @Size(min = 4, max = 180, message = "O endereco deve ter entre 4 e 180 caracteres.")
    String address,

    @NotBlank(message = "Informe o numero.")
    @Size(max = 20, message = "O numero informado e muito longo.")
    String number,

    @NotBlank(message = "Informe a cidade.")
    @Size(min = 2, max = 100, message = "A cidade deve ter entre 2 e 100 caracteres.")
    String city,

    @NotBlank(message = "Informe o estado.")
    @Pattern(
        regexp = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO",
        message = "Informe uma UF valida."
    )
    String state,

    @NotBlank(message = "Informe o CEP.")
    @Size(min = 8, max = 12, message = "Informe um CEP valido.")
    String cep,

    @NotBlank(message = "Informe a forma de pagamento.")
    String paymentMethod,

    @Size(max = 19, message = "O numero do cartao e muito longo.")
    String cardNumber,

    @Valid
    @NotEmpty(message = "Adicione ao menos um item ao pedido.")
    List<OrderItemRequest> items
) {
}
