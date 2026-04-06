import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent implements AfterViewInit {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  constructor() {
    effect(() => {
      this.store.searchTerm();
      queueMicrotask(() => this.renderizarProdutos());
    });
  }

  ngAfterViewInit(): void {
    this.renderizarProdutos();
    setTimeout(() => this.renderizarProdutos(), 0);
  }

  private renderizarProdutos(): void {
    const container = document.getElementById('lista-produtos');
    const emptyState = document.getElementById('produtos-vazio');
    const count = document.getElementById('produtos-contagem');

    if (!container || !emptyState || !count) {
      return;
    }

    const term = this.store.searchTerm().trim().toLowerCase();
    const produtos = this.store
      .getAllProducts()
      .filter((produto) => !term || produto.name.toLowerCase().includes(term));

    container.innerHTML = '';
    count.textContent = `${produtos.length} produto(s) encontrado(s) | ${this.store.cartCount()} no carrinho`;

    if (!produtos.length) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    produtos.forEach((produto) => {
      container.appendChild(this.criarCard(produto));
    });
  }

  private criarCard(produto: Product): HTMLElement {
    const card = document.createElement('article');
    card.className = 'catalog-card';

    card.innerHTML = `
      <button class="catalog-card__image-button" type="button">
        <img src="${produto.image}" alt="${produto.name}" class="catalog-card__image">
      </button>
      <div class="catalog-card__content">
        <span class="catalog-card__category">${produto.category}</span>
        <button class="catalog-card__title" type="button">${produto.name}</button>
        <p class="catalog-card__description">${produto.description}</p>
        <strong class="catalog-card__price">${this.currency.format(produto.price)}</strong>
        <div class="catalog-card__actions">
          <button class="catalog-card__details" type="button">Ver detalhes</button>
          <button class="catalog-card__add" type="button">Adicionar ao carrinho</button>
        </div>
      </div>
    `;

    const goToProduct = () => this.router.navigateByUrl(`/produto/${produto.id}`);

    card.querySelector('.catalog-card__image-button')?.addEventListener('click', goToProduct);
    card.querySelector('.catalog-card__title')?.addEventListener('click', goToProduct);
    card.querySelector('.catalog-card__details')?.addEventListener('click', goToProduct);
    card.querySelector('.catalog-card__add')?.addEventListener('click', () => {
      this.store.addToCart(produto.id);
      this.renderizarProdutos();
    });

    return card;
  }
}
