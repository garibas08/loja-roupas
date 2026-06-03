package com.garibas.backend.controller;

import com.garibas.backend.dto.order.RequisicaoCriarPedido;
import com.garibas.backend.dto.order.RespostaPedido;
import com.garibas.backend.exception.NaoAutorizadoException;
import com.garibas.backend.security.UsuarioAutenticado;
import com.garibas.backend.service.PedidoServico;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PedidoControlador {

    private final PedidoServico pedidoServico;

    @PostMapping
    public RespostaPedido criarPedido(@Valid @RequestBody RequisicaoCriarPedido request, Authentication authentication) {
        return pedidoServico.criarPedido(request, usuarioOpcional(authentication));
    }

    @GetMapping("/me")
    public List<RespostaPedido> listarMeusPedidos(Authentication authentication) {
        return pedidoServico.listarPedidosDoUsuario(usuarioObrigatorio(authentication));
    }

    private UsuarioAutenticado usuarioOpcional(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioAutenticado user) {
            return user;
        }

        return null;
    }

    private UsuarioAutenticado usuarioObrigatorio(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioAutenticado user)) {
            throw new NaoAutorizadoException("Sessao invalida.");
        }

        return user;
    }
}
