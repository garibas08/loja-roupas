import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.css'
})
export class WishlistPageComponent {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  readonly items = this.store.wishlistProducts;
  readonly wishlistCount = this.store.wishlistCount;
  readonly productsLoading = this.store.productsLoading;

  addToCart(productId: number): void {
    this.store.addToCart(productId);
  }

  remove(productId: number): void {
    this.store.removeFromWishlist(productId);
  }

  clear(): void {
    this.store.clearWishlist();
  }

  goToProduct(productId: number): void {
    this.router.navigateByUrl(`/produto/${productId}`);
  }

  trackById(_: number, product: Product): number {
    return product.id;
  }
}
