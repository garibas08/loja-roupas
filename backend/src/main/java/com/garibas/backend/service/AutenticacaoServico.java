package com.garibas.backend.service;

import com.garibas.backend.dto.auth.RespostaAutenticacao;
import com.garibas.backend.dto.auth.RequisicaoLogin;
import com.garibas.backend.dto.auth.RespostaMensagem;
import com.garibas.backend.dto.auth.RequisicaoConfirmarRedefinicaoSenha;
import com.garibas.backend.dto.auth.RequisicaoRedefinirSenha;
import com.garibas.backend.dto.auth.RequisicaoCadastro;
import com.garibas.backend.dto.auth.RequisicaoAtualizarPerfil;
import com.garibas.backend.dto.auth.RespostaUsuario;
import com.garibas.backend.entity.CodigoRedefinicaoSenha;
import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.entity.PerfilUsuario;
import com.garibas.backend.exception.RequisicaoInvalidaException;
import com.garibas.backend.exception.ConflitoException;
import com.garibas.backend.exception.RecursoNaoEncontradoException;
import com.garibas.backend.exception.NaoAutorizadoException;
import com.garibas.backend.repository.CodigoRedefinicaoSenhaRepositorio;
import com.garibas.backend.repository.UsuarioRepositorio;
import com.garibas.backend.security.UsuarioAutenticado;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutenticacaoServico {

    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(15);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String PASSWORD_RESET_SENT_MESSAGE =
        "Se o email estiver cadastrado, enviaremos um codigo de recuperacao.";

    private final UsuarioRepositorio usuarioRepositorio;
    private final CodigoRedefinicaoSenhaRepositorio codigoRedefinicaoSenhaRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final TokenServico tokenServico;
    private final EmailRedefinicaoSenhaServico emailRedefinicaoSenhaServico;

    @Transactional
    public RespostaAutenticacao register(RequisicaoCadastro request) {
        if (usuarioRepositorio.existsByEmailIgnoreCase(request.email())) {
            throw new ConflitoException("Ja existe um cadastro com este email.");
        }

        ContaUsuario user = usuarioRepositorio.save(
            ContaUsuario.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build()
        );

        String token = tokenServico.emitirToken(user);
        return new RespostaAutenticacao(token, montarRespostaUsuario(user), "Cadastro realizado com sucesso.");
    }

    @Transactional
    public RespostaAutenticacao login(RequisicaoLogin request) {
        ContaUsuario user = usuarioRepositorio.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new NaoAutorizadoException("Email ou senha invalidos."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new NaoAutorizadoException("Email ou senha invalidos.");
        }

        String token = tokenServico.emitirToken(user);
        return new RespostaAutenticacao(token, montarRespostaUsuario(user), "Login realizado com sucesso.");
    }

    @Transactional(readOnly = true)
    public RespostaUsuario me(UsuarioAutenticado authenticatedUser) {
        ContaUsuario user = usuarioRepositorio.findById(authenticatedUser.id())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));

        return montarRespostaUsuario(user);
    }

    @Transactional
    public RespostaUsuario atualizarPerfil(UsuarioAutenticado authenticatedUser, RequisicaoAtualizarPerfil request) {
        ContaUsuario user = usuarioRepositorio.findById(authenticatedUser.id())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));

        String email = normalizeEmail(request.email());

        if (!user.getEmail().equalsIgnoreCase(email) && usuarioRepositorio.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("Ja existe um cadastro com este email.");
        }

        user.setName(request.name().trim());
        user.setEmail(email);

        return montarRespostaUsuario(usuarioRepositorio.save(user));
    }

    @Transactional
    public RespostaMensagem solicitarRedefinicaoSenha(RequisicaoRedefinirSenha request) {
        usuarioRepositorio.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .ifPresent(this::criarEEnviarCodigoRedefinicaoSenha);

        return new RespostaMensagem(PASSWORD_RESET_SENT_MESSAGE);
    }

    @Transactional
    public RespostaMensagem confirmarRedefinicaoSenha(RequisicaoConfirmarRedefinicaoSenha request) {
        ContaUsuario user = usuarioRepositorio.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .orElseThrow(() -> new RequisicaoInvalidaException("Codigo invalido ou expirado."));

        CodigoRedefinicaoSenha resetCode = codigoRedefinicaoSenhaRepositorio
            .findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId()).stream()
            .filter(code -> code.getExpiresAt().isAfter(Instant.now()))
            .filter(code -> passwordEncoder.matches(request.code(), code.getCodeHash()))
            .findFirst()
            .orElseThrow(() -> new RequisicaoInvalidaException("Codigo invalido ou expirado."));

        resetCode.setUsed(true);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        tokenServico.revokeActiveTokens(user.getId());

        return new RespostaMensagem("Senha alterada com sucesso. Faca login novamente.");
    }

    @Transactional
    public void logout(String token) {
        tokenServico.revoke(token);
    }

    public RespostaUsuario montarRespostaUsuario(ContaUsuario user) {
        PerfilUsuario role = user.getRole() == null ? PerfilUsuario.USER : user.getRole();
        return new RespostaUsuario(user.getId(), user.getName(), user.getEmail(), role.name());
    }

    private void criarEEnviarCodigoRedefinicaoSenha(ContaUsuario user) {
        codigoRedefinicaoSenhaRepositorio.findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
            .forEach(code -> code.setUsed(true));

        String code = generatePasswordResetCode();
        CodigoRedefinicaoSenha resetCode = CodigoRedefinicaoSenha.builder()
            .user(user)
            .codeHash(passwordEncoder.encode(code))
            .expiresAt(Instant.now().plus(PASSWORD_RESET_TTL))
            .build();

        codigoRedefinicaoSenhaRepositorio.save(resetCode);
        emailRedefinicaoSenhaServico.enviarCodigoRedefinicaoSenha(user, code);
    }

    private String generatePasswordResetCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
