package com.garibas.backend.service;

import com.garibas.backend.dto.order.RequisicaoCriarPedido;
import com.garibas.backend.dto.order.RespostaClientePedido;
import com.garibas.backend.dto.order.RequisicaoItemPedido;
import com.garibas.backend.dto.order.RespostaItemPedido;
import com.garibas.backend.dto.order.RespostaPedido;
import com.garibas.backend.entity.PedidoCliente;
import com.garibas.backend.entity.ItemPedidoCliente;
import com.garibas.backend.entity.FormaPagamento;
import com.garibas.backend.entity.Produto;
import com.garibas.backend.entity.ContaUsuario;
import com.garibas.backend.exception.RequisicaoInvalidaException;
import com.garibas.backend.exception.RecursoNaoEncontradoException;
import com.garibas.backend.repository.PedidoClienteRepositorio;
import com.garibas.backend.repository.ProdutoRepositorio;
import com.garibas.backend.repository.UsuarioRepositorio;
import com.garibas.backend.security.UsuarioAutenticado;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoServico {

    private final PedidoClienteRepositorio pedidoClienteRepositorio;
    private final ProdutoRepositorio produtoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final EmailPedidoServico emailPedidoServico;

    @Transactional
    public RespostaPedido criarPedido(RequisicaoCriarPedido request, UsuarioAutenticado authenticatedUser) {
        FormaPagamento paymentMethod = FormaPagamento.fromLabel(request.paymentMethod());

        if (paymentMethod == FormaPagamento.CARTAO && !StringUtils.hasText(request.cardNumber())) {
            throw new RequisicaoInvalidaException("Informe o numero do cartao para pagamentos no cartao.");
        }

        ContaUsuario user = authenticatedUser == null
            ? null
            : usuarioRepositorio.findById(authenticatedUser.id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));

        String state = request.state().trim().toUpperCase();
        BigDecimal shippingFee = calculateShippingFee(state);

        PedidoCliente order = PedidoCliente.builder()
            .orderCode(generateOrderCode())
            .user(user)
            .customerName(request.name().trim())
            .customerEmail(request.email().trim().toLowerCase())
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

        for (RequisicaoItemPedido requestedItem : request.items()) {
            Produto product = produtoRepositorio.findById(requestedItem.productId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado para o pedido."));

            ItemPedidoCliente orderItem = ItemPedidoCliente.builder()
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

        PedidoCliente savedOrder = pedidoClienteRepositorio.save(order);
        enviarEmailConfirmacaoPedido(savedOrder);
        return montarResposta(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<RespostaPedido> listarPedidosDoUsuario(UsuarioAutenticado authenticatedUser) {
        return pedidoClienteRepositorio.findAllByUserIdOrderByCreatedAtDesc(authenticatedUser.id()).stream()
            .map(this::montarResposta)
            .toList();
    }

    private RespostaPedido montarResposta(PedidoCliente order) {
        List<RespostaItemPedido> items = order.getItems().stream()
            .map(item -> new RespostaItemPedido(
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

        return new RespostaPedido(
            order.getOrderCode(),
            items,
            subtotal,
            shippingFee,
            order.getTotal(),
            order.getCreatedAt(),
            new RespostaClientePedido(
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getAddress(),
                order.getNumber(),
                order.getCity(),
                order.getState(),
                order.getCep(),
                order.getPaymentMethod().getLabel()
            )
        );
    }

    private void enviarEmailConfirmacaoPedido(PedidoCliente order) {
        if (!StringUtils.hasText(order.getCustomerEmail())) {
            return;
        }

        try {
            emailPedidoServico.enviarResumoPedido(order);
        } catch (Exception exception) {
            log.warn(
                "Nao foi possivel enviar o email de confirmacao do pedido {} para {}.",
                order.getOrderCode(),
                order.getCustomerEmail(),
                exception
            );
        }
    }

    private BigDecimal calculateShippingFee(String state) {
        return switch (state) {
            case "SP" -> BigDecimal.valueOf(12.90);
            case "RJ", "MG", "ES" -> BigDecimal.valueOf(18.90);
            case "PR", "SC", "RS" -> BigDecimal.valueOf(24.90);
            case "DF", "GO", "MT", "MS" -> BigDecimal.valueOf(29.90);
            case "BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA" -> BigDecimal.valueOf(34.90);
            case "AC", "AP", "AM", "PA", "RO", "RR", "TO" -> BigDecimal.valueOf(39.90);
            default -> throw new RequisicaoInvalidaException("Informe uma UF valida para calcular o frete.");
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
