import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductCategory } from '../../utils/models';
import { PRODUCT_CATEGORIES } from '../../utils/products';
import { StoreService } from '../../utils/store.service';

const FEATURED_PRODUCT_IDS = [7, 6, 10, 11];
const FEATURED_IMAGE_STYLES: Record<number, { scale: number; position: string }> = {
  6: { scale: 1.22, position: 'center 8%' },
  7: { scale: 1.46, position: 'center 12%' },
  10: { scale: 1.14, position: 'center 12%' },
  11: { scale: 1.1, position: 'center 10%' }
};

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('productCard', { read: ElementRef }) private readonly productCards!: QueryList<ElementRef<HTMLElement>>;

  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private carouselTimer: number | null = null;
  private productRevealObserver: IntersectionObserver | null = null;
  private productCardChangesSubscription: Subscription | null = null;
  private revealLayoutFrame: number | null = null;
  private readonly handleViewportChange = () => this.scheduleProductRevealRefresh();

  readonly categories = PRODUCT_CATEGORIES;
  readonly products = this.store.filteredProducts;
  readonly cartCount = this.store.cartCount;
  readonly activeCategory = this.store.activeCategory;
  readonly featuredProducts = computed(() =>
    FEATURED_PRODUCT_IDS
      .map((id) => this.store.products().find((product) => product.id === id))
      .filter((product): product is Product => product !== undefined)
  );
  readonly activeSlideIndex = signal(0);
  readonly activeProduct = computed(() => {
    const featured = this.featuredProducts();
    return featured.length ? featured[this.activeSlideIndex() % featured.length] : null;
  });
  readonly productCountLabel = computed(() => {
    const selectedCategory = this.activeCategory();
    const categoryLabel = selectedCategory === 'Todos' ? 'todo o catalogo' : selectedCategory.toLowerCase();

    return `${this.products().length} produto(s) em ${categoryLabel} | ${this.cartCount()} no carrinho`;
  });

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

  ngAfterViewInit(): void {
    this.setupProductReveal();
    this.productCardChangesSubscription = this.productCards.changes.subscribe(() => this.scheduleProductRevealRefresh());

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleViewportChange, { passive: true });
    }
  }

  ngOnDestroy(): void {
    this.stopCarousel();
    this.productRevealObserver?.disconnect();
    this.productCardChangesSubscription?.unsubscribe();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleViewportChange);
    }

    if (this.revealLayoutFrame !== null) {
      window.cancelAnimationFrame(this.revealLayoutFrame);
      this.revealLayoutFrame = null;
    }
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

  toggleCategory(category: ProductCategory): void {
    this.store.setActiveCategory(this.activeCategory() === category ? 'Todos' : category);
  }

  showAllProducts(): void {
    this.store.setActiveCategory('Todos');
  }

  goToProduct(productId: number): void {
    this.router.navigateByUrl(`/produto/${productId}`);
  }

  trackById(_: number, product: Product): number {
    return product.id;
  }

  trackByCategory(_: number, category: ProductCategory): ProductCategory {
    return category;
  }

  getFeaturedImageScale(productId: number): number {
    return FEATURED_IMAGE_STYLES[productId]?.scale ?? 1.04;
  }

  getFeaturedImagePosition(productId: number): string {
    return FEATURED_IMAGE_STYLES[productId]?.position ?? 'center top';
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

  private setupProductReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.revealAllProductCards();
      return;
    }

    this.productRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
          entry.target.classList.toggle('is-visible', isVisible);
        });
      },
      {
        threshold: [0, 0.18, 0.32],
        rootMargin: '0px 0px -8% 0px'
      }
    );

    this.scheduleProductRevealRefresh();
  }

  private scheduleProductRevealRefresh(): void {
    if (typeof window === 'undefined') {
      this.observeProductCards();
      return;
    }

    if (this.revealLayoutFrame !== null) {
      window.cancelAnimationFrame(this.revealLayoutFrame);
    }

    this.revealLayoutFrame = window.requestAnimationFrame(() => {
      this.revealLayoutFrame = null;
      this.observeProductCards();
    });
  }

  private observeProductCards(): void {
    const cards = this.productCards?.toArray() ?? [];

    if (!cards.length) {
      this.productRevealObserver?.disconnect();
      return;
    }

    this.applyRevealDirections(cards);

    if (!this.productRevealObserver) {
      this.revealAllProductCards(cards);
      return;
    }

    this.productRevealObserver.disconnect();

    cards.forEach((card) => {
      const element = card.nativeElement;
      element.classList.remove('is-visible');
      this.productRevealObserver?.observe(element);
    });
  }

  private revealAllProductCards(cards: ElementRef<HTMLElement>[] = this.productCards?.toArray() ?? []): void {
    this.applyRevealDirections(cards);

    cards.forEach((card) => {
      const element = card.nativeElement;
      element.classList.add('is-visible');
    });
  }

  private applyRevealDirections(cards: ElementRef<HTMLElement>[]): void {
    const rows: HTMLElement[][] = [];
    let lastTop: number | null = null;

    cards.forEach((card) => {
      const element = card.nativeElement;
      const currentTop = Math.round(element.offsetTop);

      if (lastTop === null || Math.abs(currentTop - lastTop) > 10) {
        rows.push([element]);
        lastTop = currentTop;
        return;
      }

      rows[rows.length - 1].push(element);
    });

    rows.forEach((row, rowIndex) => {
      const entersFromLeft = rowIndex % 2 === 0;
      const baseOffset = entersFromLeft ? '-72px' : '72px';

      row.forEach((element, columnIndex) => {
        const sequenceIndex = entersFromLeft ? columnIndex : row.length - 1 - columnIndex;
        element.style.setProperty('--reveal-offset-x', baseOffset);
        element.style.setProperty('--reveal-delay', `${Math.min(sequenceIndex * 120, 360)}ms`);
      });
    });
  }
}
