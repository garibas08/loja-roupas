package com.garibas.backend.controller;

import com.garibas.backend.dto.product.RequisicaoCriarProduto;
import com.garibas.backend.dto.product.RespostaProduto;
import com.garibas.backend.entity.PerfilUsuario;
import com.garibas.backend.exception.AcessoNegadoException;
import com.garibas.backend.exception.NaoAutorizadoException;
import com.garibas.backend.security.UsuarioAutenticado;
import com.garibas.backend.service.ProdutoServico;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProdutoControlador {

    private final ProdutoServico produtoServico;

    @GetMapping
    public List<RespostaProduto> listarProdutos() {
        return produtoServico.listarProdutos();
    }

    @GetMapping("/categories")
    public List<String> listarCategorias() {
        return produtoServico.listarCategorias();
    }

    @GetMapping("/{id}")
    public RespostaProduto buscarProdutoPorId(@PathVariable Long id) {
        return produtoServico.buscarProdutoPorId(id);
    }

    @PostMapping
    public RespostaProduto cadastrarProduto(
        Authentication authentication,
        @Valid @RequestBody RequisicaoCriarProduto request
    ) {
        exigirAdministrador(authentication);
        return produtoServico.cadastrarProduto(request);
    }

    @DeleteMapping("/{id}")
    public void removerProduto(Authentication authentication, @PathVariable Long id) {
        exigirAdministrador(authentication);
        produtoServico.removerProduto(id);
    }

    private void exigirAdministrador(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioAutenticado user)) {
            throw new NaoAutorizadoException("Sessao invalida.");
        }

        if (user.role() != PerfilUsuario.ADMIN) {
            throw new AcessoNegadoException("Acesso restrito a administradores.");
        }
    }
}
