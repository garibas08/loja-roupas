package com.garibas.backend.controller;

import com.garibas.backend.dto.order.CreateOrderRequest;
import com.garibas.backend.dto.order.OrderResponse;
import com.garibas.backend.exception.UnauthorizedException;
import com.garibas.backend.security.AuthenticatedUser;
import com.garibas.backend.service.OrderService;
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
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        AuthenticatedUser user = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal
            ? principal
            : null;

        return orderService.createOrder(request, user);
    }

    @GetMapping("/me")
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new UnauthorizedException("Sessao invalida.");
        }

        return orderService.getOrdersForUser(user);
    }
}
