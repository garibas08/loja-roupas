package com.garibas.backend.service;

import com.garibas.backend.dto.product.ProductResponse;
import com.garibas.backend.entity.Product;
import com.garibas.backend.entity.ProductCategory;
import com.garibas.backend.exception.ResourceNotFoundException;
import com.garibas.backend.repository.ProductRepository;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return productRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Produto nao encontrado."));
    }

    public List<String> getCategories() {
        return Arrays.stream(ProductCategory.values())
            .map(ProductCategory::getLabel)
            .toList();
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
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
