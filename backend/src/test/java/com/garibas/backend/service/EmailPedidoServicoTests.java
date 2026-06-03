package com.garibas.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.garibas.backend.entity.PedidoCliente;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailPedidoServicoTests {

    @Test
    void enviaResumoDoPedidoPorEmail() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailPedidoServico service = new EmailPedidoServico(
            mailSender,
            "loja@garibas.com",
            "Garibas Store - Ajuda",
            "loja@garibas.com",
            "senha-smtp"
        );
        PedidoCliente pedido = PedidoCliente.builder()
            .orderCode("PED-12345678")
            .customerName("Cliente Teste")
            .customerEmail("cliente@exemplo.com")
            .createdAt(Instant.parse("2026-06-03T15:00:00Z"))
            .total(BigDecimal.valueOf(112.80))
            .build();

        service.enviarResumoPedido(pedido);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();

        assertThat(message.getTo()).containsExactly("cliente@exemplo.com");
        assertThat(message.getFrom()).isEqualTo("Garibas Store - Ajuda <loja@garibas.com>");
        assertThat(message.getSubject()).isEqualTo("Confirmacao do pedido PED-12345678 - Garibas Store");
        assertThat(message.getText())
            .contains("Numero do pedido: PED-12345678")
            .contains("Data da compra: 03/06/2026 12:00")
            .contains("Valor total: R$");
    }
}
