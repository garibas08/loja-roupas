import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Produto } from '../../utils/models';
import { LojaServico } from '../../utils/store.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.css',
})
export class PaginaFavoritosComponent {
  private readonly store = inject(LojaServico);
  private readonly router = inject(Router);

  readonly items = this.store.wishlistProducts;
  readonly wishlistCount = this.store.wishlistCount;
  readonly productsLoading = this.store.productsLoading;

  adicionarAoCarrinho(productId: number): void {
    this.store.adicionarAoCarrinho(productId);
  }

  remove(productId: number): void {
    this.store.removerDosFavoritos(productId);
  }

  clear(): void {
    this.store.limparFavoritos();
  }

  goToProduct(productId: number): void {
    this.router.navigateByUrl(`/produto/${productId}`);
  }

  trackById(_: number, product: Produto): number {
    return product.id;
  }
}
