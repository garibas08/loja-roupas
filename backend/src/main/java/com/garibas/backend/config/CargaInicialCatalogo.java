package com.garibas.backend.config;

import com.garibas.backend.entity.Produto;
import com.garibas.backend.entity.CategoriaProduto;
import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.entity.PerfilUsuario;
import com.garibas.backend.repository.ProdutoRepositorio;
import com.garibas.backend.repository.UsuarioRepositorio;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CargaInicialCatalogo implements ApplicationRunner {

    private final ProdutoRepositorio produtoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@garibas.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        criarAdminInicial();

        List<Produto> catalogoPadrao = catalogoPadrao();

        if (produtoRepositorio.count() > 0) {
            atualizarCatalogoPadrao(catalogoPadrao);
            return;
        }

        produtoRepositorio.saveAll(catalogoPadrao);
    }

    private List<Produto> catalogoPadrao() {
        return List.of(
            produto("Jaqueta Feminina Jeans Urbano", 229.90, "/assets/produtos/JaquetaFem.jpg", CategoriaProduto.FEMININO, "Jaqueta feminina com lavagem jeans marcante, bolso frontal e caimento estruturado para looks casuais cheios de estilo.", "P", "M", "G"),
            produto("Polo Masculina Essencial", 99.90, "/assets/produtos/CamisaUmMas.jpg", CategoriaProduto.MASCULINO, "Polo masculina em tecido macio com gola reforcada e modelagem reta para combinar com jeans, sarja ou jogger.", "P", "M", "G", "GG"),
            produto("Bolsa Tiracolo Compacta", 149.90, "/assets/produtos/AcessorioTres.jpg", CategoriaProduto.ACESSORIOS, "Bolsa tiracolo compacta com acabamento moderno e espaco na medida certa para acompanhar a rotina com praticidade.", "Unico"),
            produto("Camiseta Infantil Aventura", 79.90, "/assets/produtos/camisaCrianca.jpg", CategoriaProduto.INFANTIL, "Camiseta infantil inspirada no universo heroico, com toque macio e modelagem confortavel para brincar o dia todo.", "4", "6", "8", "10"),
            produto("Calca Legging Movimento", 119.90, "/assets/produtos/CalcaUmfem.jpg", CategoriaProduto.FEMININO, "Calca legging feminina com cintura alta e tecido flexivel que oferece conforto no treino e no dia a dia.", "36", "38", "40", "42"),
            produto("Calca Jeans Ampla Azul", 169.90, "/assets/produtos/CalcaDoisfem.jpg", CategoriaProduto.FEMININO, "Jeans feminino com lavagem azul classica e modelagem ampla que deixa o visual atual sem abrir mao do conforto.", "36", "38", "40", "42", "44"),
            produto("Polo Feminina Leve", 89.90, "/assets/produtos/camisaUmfem.jpg", CategoriaProduto.FEMININO, "Polo feminina leve e versatil, ideal para compor producoes casuais com toque elegante e acabamento impecavel.", "P", "M", "G"),
            produto("Camiseta Basica Aura", 69.90, "/assets/produtos/CamisaDoisfem.jpg", CategoriaProduto.FEMININO, "Camiseta feminina basica com toque suave e modelagem facil de combinar em looks minimalistas ou urbanos.", "P", "M", "G", "GG"),
            produto("Blusa Feminina Toque Macio", 84.90, "/assets/produtos/BlusaFem.jpg", CategoriaProduto.FEMININO, "Blusa feminina com caimento soltinho e tecido macio para quem busca praticidade com aparencia refinada.", "P", "M", "G"),
            produto("Calca Jogger Urbana", 139.90, "/assets/produtos/CalcaUmMas.jpg", CategoriaProduto.MASCULINO, "Calca jogger masculina com visual urbano, punho ajustado e tecido confortavel para acompanhar a rotina inteira.", "38", "40", "42", "44"),
            produto("Calca Sarja Classica", 159.90, "/assets/produtos/CalcaDoisMas.jpg", CategoriaProduto.MASCULINO, "Calca de sarja masculina com corte reto e acabamento limpo para montar producoes do trabalho ao fim de semana.", "38", "40", "42", "44", "46"),
            produto("Camiseta Basica Dia a Dia", 64.90, "/assets/produtos/CamisaDoisMas.jpg", CategoriaProduto.MASCULINO, "Camiseta masculina basica com tecido leve, gola resistente e visual versatil para usar em qualquer ocasiao.", "P", "M", "G", "GG"),
            produto("Blusa Masculina Essencial", 94.90, "/assets/produtos/blusaMas.jpg", CategoriaProduto.MASCULINO, "Blusa masculina com toque macio e visual moderno para dias amenos, combinando conforto e estilo sem esforco.", "P", "M", "G", "GG"),
            produto("Jaqueta Masculina Urbana", 239.90, "/assets/produtos/JaquetaMas.jpg", CategoriaProduto.MASCULINO, "Jaqueta masculina com estrutura firme, detalhes marcantes e proposta urbana para elevar qualquer combinacao.", "M", "G", "GG"),
            produto("Calca Infantil Brincar", 89.90, "/assets/produtos/calcaCrianca.jpg", CategoriaProduto.INFANTIL, "Calca infantil confortavel com modelagem solta e tecido resistente para acompanhar escola, parque e passeio.", "4", "6", "8", "10"),
            produto("Blusa Infantil Colorida", 74.90, "/assets/produtos/BlusaCrianca.jpg", CategoriaProduto.INFANTIL, "Blusa infantil divertida com toque suave e visual alegre para deixar os looks das criancas ainda mais especiais.", "4", "6", "8", "10"),
            produto("Bone Clube Urbano", 49.90, "/assets/produtos/AcessorioUm.jpg", CategoriaProduto.ACESSORIOS, "Bone com aba curva e ajuste traseiro para completar o visual com atitude e praticidade em qualquer estacao.", "Unico"),
            produto("Pulseira Corrente Urbana", 39.90, "/assets/produtos/AcessorioDois.jpg", CategoriaProduto.ACESSORIOS, "Pulseira com design contemporaneo e acabamento metalico para trazer personalidade a producoes minimalistas.", "Unico"),
            produto("Brinco Brilho Delicado", 34.90, "/assets/produtos/Acessorioquatro.jpg", CategoriaProduto.ACESSORIOS, "Brinco delicado com brilho na medida certa para finalizar o look com leveza, elegancia e versatilidade.", "Unico")
        );
    }

    private void atualizarCatalogoPadrao(List<Produto> catalogoPadrao) {
        List<Produto> produtosAtuais = produtoRepositorio.findAll();

        catalogoPadrao.forEach((produtoPadrao) ->
            produtosAtuais.stream()
                .filter((produtoAtual) -> produtoPadrao.getImage().equals(produtoAtual.getImage()))
                .findFirst()
                .ifPresent((produtoAtual) -> atualizarProdutoPadrao(produtoAtual, produtoPadrao))
        );
    }

    private void atualizarProdutoPadrao(Produto produtoAtual, Produto produtoPadrao) {
        produtoAtual.setName(produtoPadrao.getName());
        produtoAtual.setPrice(produtoPadrao.getPrice());
        produtoAtual.setCategory(produtoPadrao.getCategory());
        produtoAtual.setDescription(produtoPadrao.getDescription());
        produtoAtual.setSizes(new ArrayList<>(produtoPadrao.getSizes()));
        produtoRepositorio.save(produtoAtual);
    }

    private Produto produto(
        String nome,
        double preco,
        String imagem,
        CategoriaProduto categoria,
        String descricao,
        String... tamanhos
    ) {
        return Produto.builder()
            .name(nome)
            .price(BigDecimal.valueOf(preco))
            .image(imagem)
            .category(categoria)
            .description(descricao)
            .sizes(List.of(tamanhos))
            .build();
    }

    private void criarAdminInicial() {
        if (usuarioRepositorio.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }

        usuarioRepositorio.save(
            ContaUsuario.builder()
                .name("Administrador")
                .email(adminEmail.trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(PerfilUsuario.ADMIN)
                .build()
        );
    }
}
