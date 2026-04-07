import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Product } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

type ProductNavigationDirection = 'prev' | 'next';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css'
})
export class ProductDetailPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);
  private animationTimeout: number | null = null;
  private hasRendered = false;
  private readonly pendingDirection = signal<ProductNavigationDirection>('next');

  readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')) || 0)),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) || 0 }
  );
  readonly products = this.store.products;
  readonly product = computed(() => this.store.getProductById(this.productId()));
  readonly previousProduct = computed(() => this.getRelativeProduct(-1));
  readonly nextProduct = computed(() => this.getRelativeProduct(1));
  readonly transitionDirection = signal<ProductNavigationDirection>('next');
  readonly isTransitioning = signal(false);

  constructor() {
    effect(() => {
      const currentProduct = this.product();

      if (!currentProduct) {
        return;
      }

      if (!this.hasRendered) {
        this.hasRendered = true;
        return;
      }

      const direction = untracked(() => this.pendingDirection());
      this.transitionDirection.set(direction);
      this.isTransitioning.set(false);

      if (this.animationTimeout !== null) {
        window.clearTimeout(this.animationTimeout);
      }

      window.requestAnimationFrame(() => {
        this.isTransitioning.set(true);
        this.animationTimeout = window.setTimeout(() => this.isTransitioning.set(false), 2000);
      });
    });
  }

  addToCart(): void {
    const currentProduct = this.product();

    if (currentProduct) {
      this.store.addToCart(currentProduct.id);
    }
  }

  goToSiblingProduct(direction: ProductNavigationDirection): void {
    const targetProduct = direction === 'prev' ? this.previousProduct() : this.nextProduct();

    if (!targetProduct || targetProduct.id === this.productId()) {
      return;
    }

    this.pendingDirection.set(direction);
    void this.router.navigate(['/produto', targetProduct.id]);
  }

  ngOnDestroy(): void {
    if (this.animationTimeout !== null) {
      window.clearTimeout(this.animationTimeout);
    }
  }

  private getRelativeProduct(offset: number): Product | null {
    const products = this.products();

    if (products.length < 2) {
      return null;
    }

    const currentIndex = products.findIndex((product) => product.id === this.productId());

    if (currentIndex === -1) {
      return null;
    }

    return products[(currentIndex + offset + products.length) % products.length] ?? null;
  }
}
