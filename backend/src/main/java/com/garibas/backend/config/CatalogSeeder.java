package com.garibas.backend.config;

import com.garibas.backend.entity.Product;
import com.garibas.backend.entity.ProductCategory;
import com.garibas.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CatalogSeeder implements ApplicationRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (productRepository.count() > 0) {
            return;
        }

        productRepository.saveAll(List.of(
            product("Jaqueta Feminina Urban Denim", 229.90, "/assets/produtos/JaquetaFem.jpg", ProductCategory.FEMININO, "Jaqueta feminina com lavagem jeans marcante, bolso frontal e caimento estruturado para looks casuais cheios de estilo.", "P", "M", "G"),
            product("Polo Masculina Prime", 99.90, "/assets/produtos/CamisaUmMas.jpg", ProductCategory.MASCULINO, "Polo masculina em tecido macio com gola reforcada e modelagem reta para combinar com jeans, sarja ou jogger.", "P", "M", "G", "GG"),
            product("Bolsa Tiracolo Studio", 149.90, "/assets/produtos/AcessorioTres.jpg", ProductCategory.ACESSORIOS, "Bolsa tiracolo compacta com acabamento moderno e espaco na medida certa para acompanhar a rotina com praticidade.", "Unico"),
            product("Camiseta Hero Kids", 79.90, "/assets/produtos/camisaCrianca.jpg", ProductCategory.INFANTIL, "Camiseta infantil inspirada no universo heroico, com toque macio e modelagem confortavel para brincar o dia todo.", "4", "6", "8", "10"),
            product("Calca Legging Move", 119.90, "/assets/produtos/CalcaUmfem.jpg", ProductCategory.FEMININO, "Calca legging feminina com cintura alta e tecido flexivel que oferece conforto no treino e no dia a dia.", "36", "38", "40", "42"),
            product("Calca Jeans Wide Blue", 169.90, "/assets/produtos/CalcaDoisfem.jpg", ProductCategory.FEMININO, "Jeans feminino com lavagem azul classica e modelagem ampla que deixa o visual atual sem abrir mao do conforto.", "36", "38", "40", "42", "44"),
            product("Polo Feminina Breeze", 89.90, "/assets/produtos/camisaUmfem.jpg", ProductCategory.FEMININO, "Polo feminina leve e versatil, ideal para compor producoes casuais com toque elegante e acabamento impecavel.", "P", "M", "G"),
            product("T-shirt Basica Aura", 69.90, "/assets/produtos/CamisaDoisfem.jpg", ProductCategory.FEMININO, "T-shirt feminina basica com toque suave e modelagem facil de combinar em looks minimalistas ou urbanos.", "P", "M", "G", "GG"),
            product("Blusa Feminina Soft Touch", 84.90, "/assets/produtos/BlusaFem.jpg", ProductCategory.FEMININO, "Blusa feminina com caimento soltinho e tecido macio para quem busca praticidade com aparencia refinada.", "P", "M", "G"),
            product("Calca Jogger Street", 139.90, "/assets/produtos/CalcaUmMas.jpg", ProductCategory.MASCULINO, "Calca jogger masculina com visual urbano, punho ajustado e tecido confortavel para acompanhar a rotina inteira.", "38", "40", "42", "44"),
            product("Calca Sarja Classic", 159.90, "/assets/produtos/CalcaDoisMas.jpg", ProductCategory.MASCULINO, "Calca de sarja masculina com corte reto e acabamento clean para montar producoes do trabalho ao fim de semana.", "38", "40", "42", "44", "46"),
            product("Camiseta Basica Core", 64.90, "/assets/produtos/CamisaDoisMas.jpg", ProductCategory.MASCULINO, "Camiseta masculina basica com tecido leve, gola resistente e visual versatil para usar em qualquer ocasiao.", "P", "M", "G", "GG"),
            product("Blusa Masculina Essential", 94.90, "/assets/produtos/blusaMas.jpg", ProductCategory.MASCULINO, "Blusa masculina com toque macio e visual moderno para dias amenos, combinando conforto e estilo sem esforco.", "P", "M", "G", "GG"),
            product("Jaqueta Masculina Downtown", 239.90, "/assets/produtos/JaquetaMas.jpg", ProductCategory.MASCULINO, "Jaqueta masculina com estrutura firme, detalhes marcantes e proposta urbana para elevar qualquer combinacao.", "M", "G", "GG"),
            product("Calca Infantil Play", 89.90, "/assets/produtos/calcaCrianca.jpg", ProductCategory.INFANTIL, "Calca infantil confortavel com modelagem solta e tecido resistente para acompanhar escola, parque e passeio.", "4", "6", "8", "10"),
            product("Blusa Infantil Color Fun", 74.90, "/assets/produtos/BlusaCrianca.jpg", ProductCategory.INFANTIL, "Blusa infantil divertida com toque suave e visual alegre para deixar os looks das criancas ainda mais especiais.", "4", "6", "8", "10"),
            product("Bone Street Club", 49.90, "/assets/produtos/AcessorioUm.jpg", ProductCategory.ACESSORIOS, "Bone com aba curva e ajuste traseiro para completar o visual com atitude e praticidade em qualquer estacao.", "Unico"),
            product("Pulseira Urban Chain", 39.90, "/assets/produtos/AcessorioDois.jpg", ProductCategory.ACESSORIOS, "Pulseira com design contemporaneo e acabamento metalico para trazer personalidade a producoes minimalistas.", "Unico"),
            product("Brinco Glow Mini", 34.90, "/assets/produtos/Acessorioquatro.jpg", ProductCategory.ACESSORIOS, "Brinco delicado com brilho na medida certa para finalizar o look com leveza, elegancia e versatilidade.", "Unico")
        ));
    }

    private Product product(
        String name,
        double price,
        String image,
        ProductCategory category,
        String description,
        String... sizes
    ) {
        return Product.builder()
            .name(name)
            .price(BigDecimal.valueOf(price))
            .image(image)
            .category(category)
            .description(description)
            .sizes(List.of(sizes))
            .build();
    }
}
