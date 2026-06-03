package com.garibas.backend.service;

import com.garibas.backend.entity.TokenAutenticacao;
import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.entity.PerfilUsuario;
import com.garibas.backend.repository.TokenAutenticacaoRepositorio;
import com.garibas.backend.security.UsuarioAutenticado;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenServico {

    private static final Duration TOKEN_TTL = Duration.ofDays(7);

    private final TokenAutenticacaoRepositorio tokenAutenticacaoRepositorio;

    @Transactional
    public String emitirToken(ContaUsuario user) {
        revokeActiveTokens(user.getId());

        TokenAutenticacao authToken = TokenAutenticacao.builder()
            .token(generateTokenValue())
            .user(user)
            .expiresAt(Instant.now().plus(TOKEN_TTL))
            .build();

        return tokenAutenticacaoRepositorio.save(authToken).getToken();
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioAutenticado> autenticar(String rawToken) {
        return tokenAutenticacaoRepositorio.findByToken(rawToken)
            .filter(token -> !token.isRevoked())
            .filter(token -> token.getExpiresAt().isAfter(Instant.now()))
            .map(TokenAutenticacao::getUser)
            .map(user -> new UsuarioAutenticado(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() == null ? PerfilUsuario.USER : user.getRole()
            ));
    }

    @Transactional
    public void revoke(String rawToken) {
        tokenAutenticacaoRepositorio.findByToken(rawToken).ifPresent(token -> {
            token.setRevoked(true);
            tokenAutenticacaoRepositorio.save(token);
        });
    }

    @Transactional
    public void revokeActiveTokens(Long userId) {
        tokenAutenticacaoRepositorio.findAllByUserIdAndRevokedFalse(userId).forEach(token -> token.setRevoked(true));
    }

    private String generateTokenValue() {
        return UUID.randomUUID() + "-" + UUID.randomUUID();
    }
}
