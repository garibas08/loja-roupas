package com.garibas.backend.service;

import com.garibas.backend.dto.product.RequisicaoCriarProduto;
import com.garibas.backend.dto.product.RespostaProduto;
import com.garibas.backend.entity.Produto;
import com.garibas.backend.entity.CategoriaProduto;
import com.garibas.backend.exception.RecursoNaoEncontradoException;
import com.garibas.backend.repository.ProdutoRepositorio;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProdutoServico {

    private final ProdutoRepositorio produtoRepositorio;

    @Transactional(readOnly = true)
    public List<RespostaProduto> listarProdutos() {
        return produtoRepositorio.findAll().stream()
            .map(this::montarResposta)
            .toList();
    }

    @Transactional(readOnly = true)
    public RespostaProduto buscarProdutoPorId(Long id) {
        return produtoRepositorio.findById(id)
            .map(this::montarResposta)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }

    @Transactional
    public RespostaProduto cadastrarProduto(RequisicaoCriarProduto request) {
        Produto product = Produto.builder()
            .name(request.name().trim())
            .price(request.price())
            .image(request.image().trim())
            .category(CategoriaProduto.fromLabel(request.category().trim()))
            .description(request.description().trim())
            .sizes(request.sizes().stream()
                .map(String::trim)
                .filter(size -> !size.isBlank())
                .toList())
            .build();

        if (product.getSizes().isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um tamanho valido.");
        }

        return montarResposta(produtoRepositorio.save(product));
    }

    @Transactional
    public void removerProduto(Long id) {
        Produto product = produtoRepositorio.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));

        produtoRepositorio.delete(product);
    }

    public List<String> listarCategorias() {
        return Arrays.stream(CategoriaProduto.values())
            .map(CategoriaProduto::getLabel)
            .toList();
    }

    public RespostaProduto montarResposta(Produto product) {
        return new RespostaProduto(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getImage(),
            product.getCategory().getLabel(),
            product.getDescription(),
            List.copyOf(product.getSizes())
        );
    }
}
