import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-confirmation-page',
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './confirmation-page.html',
  styleUrl: './confirmation-page.css'
})
export class ConfirmationPageComponent {
  readonly order = inject(StoreService).lastOrder;
}
