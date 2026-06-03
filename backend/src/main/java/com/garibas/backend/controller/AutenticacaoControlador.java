package com.garibas.backend.controller;

import com.garibas.backend.dto.auth.RespostaAutenticacao;
import com.garibas.backend.dto.auth.RequisicaoLogin;
import com.garibas.backend.dto.auth.RespostaMensagem;
import com.garibas.backend.dto.auth.RequisicaoConfirmarRedefinicaoSenha;
import com.garibas.backend.dto.auth.RequisicaoRedefinirSenha;
import com.garibas.backend.dto.auth.RequisicaoCadastro;
import com.garibas.backend.dto.auth.RequisicaoAtualizarPerfil;
import com.garibas.backend.dto.auth.RespostaUsuario;
import com.garibas.backend.exception.NaoAutorizadoException;
import com.garibas.backend.security.UsuarioAutenticado;
import com.garibas.backend.service.AutenticacaoServico;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacaoControlador {

    private static final String BEARER_PREFIX = "Bearer ";

    private final AutenticacaoServico autenticacaoServico;

    @PostMapping("/register")
    public RespostaAutenticacao register(@Valid @RequestBody RequisicaoCadastro request) {
        return autenticacaoServico.register(request);
    }

    @PostMapping("/login")
    public RespostaAutenticacao login(@Valid @RequestBody RequisicaoLogin request) {
        return autenticacaoServico.login(request);
    }

    @GetMapping("/me")
    public RespostaUsuario me(Authentication authentication) {
        return autenticacaoServico.me(authenticatedUser(authentication));
    }

    @PutMapping("/me")
    public RespostaUsuario atualizarPerfil(
        Authentication authentication,
        @Valid @RequestBody RequisicaoAtualizarPerfil request
    ) {
        return autenticacaoServico.atualizarPerfil(authenticatedUser(authentication), request);
    }

    @PostMapping("/password-reset/request")
    public RespostaMensagem solicitarRedefinicaoSenha(@Valid @RequestBody RequisicaoRedefinirSenha request) {
        return autenticacaoServico.solicitarRedefinicaoSenha(request);
    }

    @PostMapping("/password-reset/confirm")
    public RespostaMensagem confirmarRedefinicaoSenha(@Valid @RequestBody RequisicaoConfirmarRedefinicaoSenha request) {
        return autenticacaoServico.confirmarRedefinicaoSenha(request);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new NaoAutorizadoException("Sessao invalida.");
        }

        autenticacaoServico.logout(authorizationHeader.substring(BEARER_PREFIX.length()));
    }

    private UsuarioAutenticado authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioAutenticado user)) {
            throw new NaoAutorizadoException("Sessao invalida.");
        }

        return user;
    }
}
