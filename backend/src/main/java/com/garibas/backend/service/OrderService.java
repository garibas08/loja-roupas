package com.garibas.backend.service;

import com.garibas.backend.dto.order.CreateOrderRequest;
import com.garibas.backend.dto.order.OrderCustomerResponse;
import com.garibas.backend.dto.order.OrderItemRequest;
import com.garibas.backend.dto.order.OrderItemResponse;
import com.garibas.backend.dto.order.OrderResponse;
import com.garibas.backend.entity.CustomerOrder;
import com.garibas.backend.entity.CustomerOrderItem;
import com.garibas.backend.entity.PaymentMethod;
import com.garibas.backend.entity.Product;
import com.garibas.backend.entity.UserAccount;
import com.garibas.backend.exception.BadRequestException;
import com.garibas.backend.exception.ResourceNotFoundException;
import com.garibas.backend.repository.CustomerOrderRepository;
import com.garibas.backend.repository.ProductRepository;
import com.garibas.backend.repository.UserRepository;
import com.garibas.backend.security.AuthenticatedUser;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, AuthenticatedUser authenticatedUser) {
        PaymentMethod paymentMethod = PaymentMethod.fromLabel(request.paymentMethod());

        if (paymentMethod == PaymentMethod.CARTAO && !StringUtils.hasText(request.cardNumber())) {
            throw new BadRequestException("Informe o numero do cartao para pagamentos no cartao.");
        }

        UserAccount user = authenticatedUser == null
            ? null
            : userRepository.findById(authenticatedUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        String state = request.state().trim().toUpperCase();
        BigDecimal shippingFee = calculateShippingFee(state);

        CustomerOrder order = CustomerOrder.builder()
            .orderCode(generateOrderCode())
            .user(user)
            .customerName(request.name().trim())
            .address(request.address().trim())
            .number(request.number().trim())
            .city(request.city().trim())
            .state(state)
            .cep(request.cep().trim())
            .paymentMethod(paymentMethod)
            .cardLastFour(extractCardLastFour(request.cardNumber()))
            .shippingFee(shippingFee)
            .total(BigDecimal.ZERO)
            .items(new ArrayList<>())
            .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest requestedItem : request.items()) {
            Product product = productRepository.findById(requestedItem.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto nao encontrado para o pedido."));

            CustomerOrderItem orderItem = CustomerOrderItem.builder()
                .order(order)
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImage())
                .productDescription(product.getDescription())
                .unitPrice(product.getPrice())
                .quantity(requestedItem.quantity())
                .build();

            order.getItems().add(orderItem);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(requestedItem.quantity())));
        }

        order.setTotal(subtotal.add(shippingFee));

        CustomerOrder savedOrder = customerOrderRepository.save(order);
        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(AuthenticatedUser authenticatedUser) {
        return customerOrderRepository.findAllByUserIdOrderByCreatedAtDesc(authenticatedUser.id()).stream()
            .map(this::toResponse)
            .toList();
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = order.getItems().stream()
            .map(item -> new OrderItemResponse(
                item.getProductId(),
                item.getProductName(),
                item.getUnitPrice(),
                item.getProductImage(),
                item.getProductDescription(),
                item.getQuantity()
            ))
            .toList();

        BigDecimal shippingFee = order.getShippingFee() == null ? BigDecimal.ZERO : order.getShippingFee();
        BigDecimal subtotal = order.getItems().stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
            order.getOrderCode(),
            items,
            subtotal,
            shippingFee,
            order.getTotal(),
            order.getCreatedAt(),
            new OrderCustomerResponse(
                order.getCustomerName(),
                order.getAddress(),
                order.getNumber(),
                order.getCity(),
                order.getState(),
                order.getCep(),
                order.getPaymentMethod().getLabel()
            )
        );
    }

    private BigDecimal calculateShippingFee(String state) {
        return switch (state) {
            case "SP" -> BigDecimal.valueOf(12.90);
            case "RJ", "MG", "ES" -> BigDecimal.valueOf(18.90);
            case "PR", "SC", "RS" -> BigDecimal.valueOf(24.90);
            case "DF", "GO", "MT", "MS" -> BigDecimal.valueOf(29.90);
            case "BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA" -> BigDecimal.valueOf(34.90);
            case "AC", "AP", "AM", "PA", "RO", "RR", "TO" -> BigDecimal.valueOf(39.90);
            default -> throw new BadRequestException("Informe uma UF valida para calcular o frete.");
        };
    }

    private String generateOrderCode() {
        return "PED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String extractCardLastFour(String cardNumber) {
        if (!StringUtils.hasText(cardNumber)) {
            return null;
        }

        String digits = cardNumber.replaceAll("\\D", "");
        return digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
    }
}
