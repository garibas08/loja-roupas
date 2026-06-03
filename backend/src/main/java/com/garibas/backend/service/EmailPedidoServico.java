package com.garibas.backend.service;

import com.garibas.backend.entity.PedidoCliente;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailPedidoServico {

    private static final Locale LOCALE_BR = Locale.forLanguageTag("pt-BR");
    private static final ZoneId ZONA_BRASIL = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter FORMATADOR_DATA = DateTimeFormatter
        .ofPattern("dd/MM/yyyy HH:mm")
        .withZone(ZONA_BRASIL);

    private final JavaMailSender mailSender;
    private final String remetente;
    private final String nomeRemetente;
    private final String usuarioSmtp;
    private final String senhaSmtp;

    public EmailPedidoServico(
        JavaMailSender mailSender,
        @Value("${app.email.remetente:}") String remetente,
        @Value("${app.email.nome-remetente:Garibas Store}") String nomeRemetente,
        @Value("${spring.mail.username:}") String usuarioSmtp,
        @Value("${spring.mail.password:}") String senhaSmtp
    ) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.nomeRemetente = nomeRemetente;
        this.usuarioSmtp = usuarioSmtp;
        this.senhaSmtp = senhaSmtp;
    }

    public void enviarResumoPedido(PedidoCliente pedido) {
        validarConfiguracaoEmail();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(montarRemetente());
        message.setTo(pedido.getCustomerEmail());
        message.setSubject("Confirmacao do pedido " + pedido.getOrderCode() + " - Garibas Store");
        message.setText(montarCorpoEmail(pedido));

        try {
            mailSender.send(message);
        } catch (MailAuthenticationException exception) {
            throw new IllegalStateException(
                "Nao foi possivel autenticar no servidor de email. Verifique usuario e senha SMTP.",
                exception
            );
        } catch (MailSendException exception) {
            throw new IllegalStateException(
                "Nao foi possivel enviar o email de confirmacao do pedido. Verifique as configuracoes SMTP.",
                exception
            );
        }
    }

    private void validarConfiguracaoEmail() {
        if (!StringUtils.hasText(usuarioSmtp) || !StringUtils.hasText(senhaSmtp) || !StringUtils.hasText(remetente)) {
            throw new IllegalStateException(
                "Configure MAIL_USERNAME, MAIL_PASSWORD e MAIL_FROM para enviar emails reais."
            );
        }
    }

    private String montarRemetente() {
        return StringUtils.hasText(nomeRemetente)
            ? "%s <%s>".formatted(nomeRemetente, remetente)
            : remetente;
    }

    private String montarCorpoEmail(PedidoCliente pedido) {
        return """
            Ola, %s.

            Recebemos sua compra na Garibas Store.

            Numero do pedido: %s
            Data da compra: %s
            Valor total: %s

            Obrigado por comprar com a gente.

            Garibas Store
            """.formatted(
                pedido.getCustomerName(),
                pedido.getOrderCode(),
                FORMATADOR_DATA.format(pedido.getCreatedAt()),
                NumberFormat.getCurrencyInstance(LOCALE_BR).format(pedido.getTotal())
            );
    }
}
