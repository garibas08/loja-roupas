package com.garibas.backend.repository;

import com.garibas.backend.entity.TokenAutenticacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenAutenticacaoRepositorio extends JpaRepository<TokenAutenticacao, Long> {
    Optional<TokenAutenticacao> findByToken(String token);

    List<TokenAutenticacao> findAllByUserIdAndRevokedFalse(Long userId);
}
