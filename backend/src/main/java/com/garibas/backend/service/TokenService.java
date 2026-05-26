package com.garibas.backend.service;

import com.garibas.backend.entity.AuthToken;
import com.garibas.backend.entity.UserAccount;
import com.garibas.backend.repository.AuthTokenRepository;
import com.garibas.backend.security.AuthenticatedUser;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenService {

    private static final Duration TOKEN_TTL = Duration.ofDays(7);

    private final AuthTokenRepository authTokenRepository;

    @Transactional
    public String issueToken(UserAccount user) {
        revokeActiveTokens(user.getId());

        AuthToken authToken = AuthToken.builder()
            .token(generateTokenValue())
            .user(user)
            .expiresAt(Instant.now().plus(TOKEN_TTL))
            .build();

        return authTokenRepository.save(authToken).getToken();
    }

    @Transactional(readOnly = true)
    public Optional<AuthenticatedUser> authenticate(String rawToken) {
        return authTokenRepository.findByToken(rawToken)
            .filter(token -> !token.isRevoked())
            .filter(token -> token.getExpiresAt().isAfter(Instant.now()))
            .map(AuthToken::getUser)
            .map(user -> new AuthenticatedUser(user.getId(), user.getName(), user.getEmail()));
    }

    @Transactional
    public void revoke(String rawToken) {
        authTokenRepository.findByToken(rawToken).ifPresent(token -> {
            token.setRevoked(true);
            authTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeActiveTokens(Long userId) {
        authTokenRepository.findAllByUserIdAndRevokedFalse(userId).forEach(token -> token.setRevoked(true));
    }

    private String generateTokenValue() {
        return UUID.randomUUID() + "-" + UUID.randomUUID();
    }
}
