package com.garibas.backend.repository;

import com.garibas.backend.entity.CodigoRedefinicaoSenha;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodigoRedefinicaoSenhaRepositorio extends JpaRepository<CodigoRedefinicaoSenha, Long> {
    List<CodigoRedefinicaoSenha> findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);
}
