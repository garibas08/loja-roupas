import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RodapeComponent } from './components/footer/footer';
import { CabecalhoComponent } from './components/header/header';
import { LojaServico } from './utils/store.service';
import { TemaServico } from './utils/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, CabecalhoComponent, RodapeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Aplicativo implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(LojaServico);
  private readonly themeService = inject(TemaServico);

  ngOnInit(): void {
    this.store.carregarProdutos();
    this.store.carregarCarrinho();
    void this.store.iniciarSessao();
    this.themeService.applySavedTheme();
  }

  closePopup(): void {
    this.store.fecharAvisoCarrinho();
  }

  goToCart(): void {
    this.store.fecharAvisoCarrinho();
    this.router.navigateByUrl('/carrinho');
  }
}
