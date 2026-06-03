import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LojaServico } from '../../utils/store.service';

@Component({
  selector: 'app-confirmation-page',
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './confirmation-page.html',
  styleUrl: './confirmation-page.css',
})
export class PaginaConfirmacaoComponent {
  readonly order = inject(LojaServico).lastOrder;
}
