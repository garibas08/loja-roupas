import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ItemCarrinho } from '../../utils/models';
import { LojaServico } from '../../utils/store.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class PaginaCarrinhoComponent {
  private readonly store = inject(LojaServico);
  private readonly router = inject(Router);

  readonly items = this.store.cart;
  readonly total = this.store.cartTotal;
  readonly user = this.store.loggedUser;
  readonly itemKinds = computed(() => this.items().length);
  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  increment(item: ItemCarrinho): void {
    this.store.atualizarQuantidadeItem(item.id, item.quantity + 1);
  }

  decrement(item: ItemCarrinho): void {
    this.store.atualizarQuantidadeItem(item.id, item.quantity - 1);
  }

  remove(itemId: number): void {
    this.store.removerDoCarrinho(itemId);
  }

  goToCheckout(): void {
    if (!this.items().length) {
      return;
    }

    this.router.navigateByUrl('/checkout');
  }

  trackById(_: number, item: ItemCarrinho): number {
    return item.id;
  }
}
