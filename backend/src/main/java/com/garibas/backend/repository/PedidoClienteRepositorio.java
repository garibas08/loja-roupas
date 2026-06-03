package com.garibas.backend.repository;

import com.garibas.backend.entity.PedidoCliente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoClienteRepositorio extends JpaRepository<PedidoCliente, Long> {
    List<PedidoCliente> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
