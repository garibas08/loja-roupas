package com.garibas.backend.repository;

import com.garibas.backend.entity.AuthToken;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);

    List<AuthToken> findAllByUserIdAndRevokedFalse(Long userId);
}
