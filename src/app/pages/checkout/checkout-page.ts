import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { formatCardNumber, formatCep } from '../../utils/masks';
import { PaymentMethod } from '../../utils/models';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  readonly items = this.store.cart;
  readonly total = this.store.cartTotal;

  readonly form = this.fb.group({
    name: [this.store.loggedUser()?.name ?? '', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    number: ['', [Validators.required]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    cep: ['', [Validators.required, Validators.minLength(9)]],
    paymentMethod: ['Cartao', [Validators.required]],
    cardNumber: ['']
  });

  constructor() {
    if (!this.items().length) {
      this.router.navigateByUrl('/carrinho');
    }
  }

  onCepInput(event: Event): void {
    this.form.controls.cep.setValue(formatCep((event.target as HTMLInputElement).value));
  }

  onCardInput(event: Event): void {
    this.form.controls.cardNumber.setValue(formatCardNumber((event.target as HTMLInputElement).value));
  }

  submit(): void {
    const paymentMethod = (this.form.controls.paymentMethod.value ?? 'Cartao') as PaymentMethod;

    if (paymentMethod === 'Cartao') {
      this.form.controls.cardNumber.addValidators([Validators.required, Validators.minLength(19)]);
    } else {
      this.form.controls.cardNumber.clearValidators();
    }

    this.form.controls.cardNumber.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.createOrder({
      name: this.form.value.name ?? '',
      address: this.form.value.address ?? '',
      number: this.form.value.number ?? '',
      city: this.form.value.city ?? '',
      cep: this.form.value.cep ?? '',
      paymentMethod,
      cardNumber: this.form.value.cardNumber ?? ''
    });

    this.router.navigateByUrl('/confirmacao');
  }
}
