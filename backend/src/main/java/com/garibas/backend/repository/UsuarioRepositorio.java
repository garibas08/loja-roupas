package com.garibas.backend.repository;

import com.garibas.backend.entity.ContaUsuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<ContaUsuario, Long> {
    Optional<ContaUsuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
