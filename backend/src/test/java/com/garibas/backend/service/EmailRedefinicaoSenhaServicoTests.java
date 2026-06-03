package com.garibas.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.exception.RequisicaoInvalidaException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailRedefinicaoSenhaServicoTests {

    @Test
    void enviaCodigoPorEmailComDadosDoUsuario() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailRedefinicaoSenhaServico service = new EmailRedefinicaoSenhaServico(
            mailSender,
            "loja@garibas.com",
            "Garibas Store",
            "loja@garibas.com",
            "senha-smtp"
        );
        ContaUsuario user = ContaUsuario.builder()
            .name("Cliente Teste")
            .email("cliente@exemplo.com")
            .build();

        service.enviarCodigoRedefinicaoSenha(user, "123456");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();

        assertThat(message.getTo()).containsExactly("cliente@exemplo.com");
        assertThat(message.getFrom()).isEqualTo("Garibas Store <loja@garibas.com>");
        assertThat(message.getSubject()).isEqualTo("Codigo de recuperacao de senha - Garibas Store");
        assertThat(message.getText()).contains("Cliente Teste", "123456", "15 minutos");
    }

    @Test
    void avisaQuandoSmtpNaoEstaConfigurado() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailRedefinicaoSenhaServico service = new EmailRedefinicaoSenhaServico(
            mailSender,
            "",
            "Garibas Store",
            "",
            ""
        );
        ContaUsuario user = ContaUsuario.builder()
            .name("Cliente Teste")
            .email("cliente@exemplo.com")
            .build();

        assertThatThrownBy(() -> service.enviarCodigoRedefinicaoSenha(user, "123456"))
            .isInstanceOf(RequisicaoInvalidaException.class)
            .hasMessageContaining("Configure MAIL_USERNAME, MAIL_PASSWORD e MAIL_FROM");
    }
}
