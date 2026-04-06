import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css'
})
export class ProductDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(StoreService);

  readonly product = this.store.getProductById(Number(this.route.snapshot.paramMap.get('id')));

  addToCart(): void {
    if (this.product) {
      this.store.addToCart(this.product.id);
    }
  }
}
