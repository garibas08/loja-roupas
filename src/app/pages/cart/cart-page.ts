import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
  encapsulation: ViewEncapsulation.None
})
export class CartPageComponent implements AfterViewInit {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  ngAfterViewInit(): void {
    this.carregarCarrinho();
    setTimeout(() => this.carregarCarrinho(), 0);
  }

  private carregarCarrinho(): void {
    this.store.loadCart();

    const container = document.getElementById('itens-carrinho');
    const summary = document.getElementById('carrinho-resumo');
    const content = document.getElementById('carrinho-conteudo');
    const empty = document.getElementById('carrinho-vazio');

    if (!container || !summary || !content || !empty) {
      return;
    }

    const carrinho = this.store.getCartItems();
    container.innerHTML = '';
    summary.innerHTML = '';

    if (!carrinho.length) {
      content.hidden = true;
      empty.hidden = false;
      return;
    }

    content.hidden = false;
    empty.hidden = true;

    carrinho.forEach((produto) => {
      container.appendChild(this.criarItemCarrinho(produto));
    });

    const total = carrinho.reduce((sum, item) => sum + item.price * item.quantity, 0);
    summary.innerHTML = `
      <span class="eyebrow">Resumo</span>
      <h1>Seu carrinho</h1>
      <p>${carrinho.length} produto(s) selecionado(s).</p>
      <strong>${this.currency.format(total)}</strong>
      <button type="button" class="cart-summary__button">Finalizar compra</button>
    `;

    summary.querySelector('.cart-summary__button')?.addEventListener('click', () => {
      this.router.navigateByUrl('/checkout');
    });
  }

  private criarItemCarrinho(produto: CartItem): HTMLElement {
    const item = document.createElement('article');
    item.className = 'cart-item';

    item.innerHTML = `
      <img src="${produto.image}" alt="${produto.name}">
      <div class="cart-item__info">
        <h2>${produto.name}</h2>
        <p>${this.currency.format(produto.price)}</p>
        <small>${produto.description}</small>
        <strong>Subtotal: ${this.currency.format(produto.price * produto.quantity)}</strong>
      </div>
      <div class="cart-item__quantity">
        <button type="button" class="cart-item__decrement">-</button>
        <span>${produto.quantity}</span>
        <button type="button" class="cart-item__increment">+</button>
      </div>
      <button type="button" class="cart-item__remove">Remover</button>
    `;

    item.querySelector('.cart-item__increment')?.addEventListener('click', () => {
      this.store.updateItemQuantity(produto.id, produto.quantity + 1);
      this.carregarCarrinho();
    });

    item.querySelector('.cart-item__decrement')?.addEventListener('click', () => {
      this.store.updateItemQuantity(produto.id, produto.quantity - 1);
      this.carregarCarrinho();
    });

    item.querySelector('.cart-item__remove')?.addEventListener('click', () => {
      this.store.removeFromCart(produto.id);
      this.carregarCarrinho();
    });

    return item;
  }
}
