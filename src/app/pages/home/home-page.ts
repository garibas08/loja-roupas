import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private carouselTimer: number | null = null;

  readonly products = this.store.filteredProducts;
  readonly cartCount = this.store.cartCount;
  readonly featuredProducts = computed(() => this.store.products().slice(0, 4));
  readonly activeSlideIndex = signal(0);
  readonly activeProduct = computed(() => {
    const featured = this.featuredProducts();
    return featured.length ? featured[this.activeSlideIndex() % featured.length] : null;
  });
  readonly productCountLabel = computed(
    () => `${this.products().length} produto(s) encontrado(s) | ${this.cartCount()} no carrinho`
  );
  readonly highlightCategories = computed(() => [...new Set(this.store.products().map((product) => product.category))]);

  constructor() {
    effect(() => {
      const featured = this.featuredProducts();
      const index = this.activeSlideIndex();

      if (!featured.length) {
        if (index !== 0) {
          this.activeSlideIndex.set(0);
        }
        return;
      }

      if (index >= featured.length) {
        this.activeSlideIndex.set(0);
      }
    });
  }

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  nextSlide(): void {
    const featured = this.featuredProducts();

    if (!featured.length) {
      return;
    }

    this.activeSlideIndex.update((index) => (index + 1) % featured.length);
  }

  prevSlide(): void {
    const featured = this.featuredProducts();

    if (!featured.length) {
      return;
    }

    this.activeSlideIndex.update((index) => (index - 1 + featured.length) % featured.length);
  }

  selectSlide(index: number): void {
    this.activeSlideIndex.set(index);
  }

  addToCart(productId: number): void {
    this.store.addToCart(productId);
  }

  goToProduct(productId: number): void {
    this.router.navigateByUrl(`/produto/${productId}`);
  }

  trackById(_: number, product: Product): number {
    return product.id;
  }

  private startCarousel(): void {
    this.stopCarousel();
    this.carouselTimer = window.setInterval(() => this.nextSlide(), 4200);
  }

  private stopCarousel(): void {
    if (this.carouselTimer !== null) {
      window.clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }
}
