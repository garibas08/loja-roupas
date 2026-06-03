import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Produto } from '../../utils/models';
import { LojaServico } from '../../utils/store.service';

type DirecaoNavegacaoProduto = 'prev' | 'next';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css',
})
export class PaginaDetalheProdutoComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(LojaServico);
  private animationTimeout: number | null = null;
  private hasRendered = false;
  private readonly pendingDirection = signal<DirecaoNavegacaoProduto>('next');

  readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')) || 0)),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) || 0 },
  );
  readonly products = this.store.products;
  readonly productsLoading = this.store.productsLoading;
  readonly product = computed(() => this.store.buscarProdutoPorId(this.productId()));
  readonly previousProduct = computed(() => this.getRelativeProduct(-1));
  readonly nextProduct = computed(() => this.getRelativeProduct(1));
  readonly transitionDirection = signal<DirecaoNavegacaoProduto>('next');
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

  adicionarAoCarrinho(): void {
    const currentProduct = this.product();

    if (currentProduct) {
      this.store.adicionarAoCarrinho(currentProduct.id);
    }
  }

  alternarFavorito(): void {
    const currentProduct = this.product();

    if (currentProduct) {
      this.store.alternarFavorito(currentProduct.id);
    }
  }

  estaNosFavoritos(productId: number): boolean {
    return this.store.estaNosFavoritos(productId);
  }

  goToSiblingProduct(direction: DirecaoNavegacaoProduto): void {
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

  private getRelativeProduct(offset: number): Produto | null {
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
