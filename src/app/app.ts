import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer';
import { HeaderComponent } from './components/header/header';
import { StoreService } from './utils/store.service';
import { ThemeService } from './utils/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(StoreService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.store.loadProducts();
    this.store.loadCart();
    this.themeService.aplicarTemaSalvo();
  }

  closePopup(): void {
    this.store.closeCartPopup();
  }

  goToCart(): void {
    this.store.closeCartPopup();
    this.router.navigateByUrl('/carrinho');
  }
}
