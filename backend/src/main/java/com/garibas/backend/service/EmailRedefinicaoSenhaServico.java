package com.garibas.backend.service;

import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.exception.RequisicaoInvalidaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailRedefinicaoSenhaServico {

    private final JavaMailSender mailSender;
    private final String remetente;
    private final String nomeRemetente;
    private final String usuarioSmtp;
    private final String senhaSmtp;

    public EmailRedefinicaoSenhaServico(
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

    public void enviarCodigoRedefinicaoSenha(ContaUsuario user, String code) {
        validarConfiguracaoEmail();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(montarRemetente());
        message.setTo(user.getEmail());
        message.setSubject("Codigo de recuperacao de senha - Garibas Store");
        message.setText(montarCorpoEmail(user, code));

        try {
            mailSender.send(message);
        } catch (MailAuthenticationException exception) {
            throw new RequisicaoInvalidaException(
                "Nao foi possivel autenticar no servidor de email. Verifique usuario e senha SMTP."
            );
        } catch (MailSendException exception) {
            throw new RequisicaoInvalidaException(
                "Nao foi possivel enviar o email de recuperacao. Verifique as configuracoes SMTP."
            );
        }
    }

    private void validarConfiguracaoEmail() {
        if (!StringUtils.hasText(usuarioSmtp) || !StringUtils.hasText(senhaSmtp) || !StringUtils.hasText(remetente)) {
            throw new RequisicaoInvalidaException(
                "Configure MAIL_USERNAME, MAIL_PASSWORD e MAIL_FROM para enviar emails reais."
            );
        }
    }

    private String montarRemetente() {
        return StringUtils.hasText(nomeRemetente)
            ? "%s <%s>".formatted(nomeRemetente, remetente)
            : remetente;
    }

    private String montarCorpoEmail(ContaUsuario user, String code) {
        return """
            Ola, %s.

            Recebemos uma solicitacao para redefinir a senha da sua conta na Garibas Store.

            Seu codigo de recuperacao e: %s

            Esse codigo vale por 15 minutos. Se voce nao solicitou a troca de senha, ignore este email.

            Garibas Store
            """.formatted(user.getName(), code);
    }
}
