import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { formatCardNumber, formatCep } from '../../utils/masks';
import { EstadoBrasileiro, FormaPagamento } from '../../utils/models';
import { LojaServico } from '../../utils/store.service';

const BRAZILIAN_STATES: Array<{ value: EstadoBrasileiro; label: string }> = [
  { value: 'SP', label: 'SP - Sao Paulo' },
  { value: 'RJ', label: 'RJ - Rio de Janeiro' },
  { value: 'MG', label: 'MG - Minas Gerais' },
  { value: 'ES', label: 'ES - Espirito Santo' },
  { value: 'PR', label: 'PR - Parana' },
  { value: 'SC', label: 'SC - Santa Catarina' },
  { value: 'RS', label: 'RS - Rio Grande do Sul' },
  { value: 'DF', label: 'DF - Distrito Federal' },
  { value: 'GO', label: 'GO - Goias' },
  { value: 'MT', label: 'MT - Mato Grosso' },
  { value: 'MS', label: 'MS - Mato Grosso do Sul' },
  { value: 'BA', label: 'BA - Bahia' },
  { value: 'SE', label: 'SE - Sergipe' },
  { value: 'AL', label: 'AL - Alagoas' },
  { value: 'PE', label: 'PE - Pernambuco' },
  { value: 'PB', label: 'PB - Paraiba' },
  { value: 'RN', label: 'RN - Rio Grande do Norte' },
  { value: 'CE', label: 'CE - Ceara' },
  { value: 'PI', label: 'PI - Piaui' },
  { value: 'MA', label: 'MA - Maranhao' },
  { value: 'AC', label: 'AC - Acre' },
  { value: 'AP', label: 'AP - Amapa' },
  { value: 'AM', label: 'AM - Amazonas' },
  { value: 'PA', label: 'PA - Para' },
  { value: 'RO', label: 'RO - Rondonia' },
  { value: 'RR', label: 'RR - Roraima' },
  { value: 'TO', label: 'TO - Tocantins' },
];

const SHIPPING_FEE_GROUPS: Array<{ states: EstadoBrasileiro[]; fee: number }> = [
  { states: ['SP'], fee: 12.9 },
  { states: ['RJ', 'MG', 'ES'], fee: 18.9 },
  { states: ['PR', 'SC', 'RS'], fee: 24.9 },
  { states: ['DF', 'GO', 'MT', 'MS'], fee: 29.9 },
  { states: ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'], fee: 34.9 },
  { states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'], fee: 39.9 },
];

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class PaginaCheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(LojaServico);
  private readonly router = inject(Router);

  readonly items = this.store.cart;
  readonly total = this.store.cartTotal;
  readonly states = BRAZILIAN_STATES;
  readonly selectedState = signal<EstadoBrasileiro>('SP');
  readonly shippingFee = computed(() => this.calculateShippingFee(this.selectedState()));
  readonly finalTotal = computed(() => this.total() + this.shippingFee());
  message = '';
  isSubmitting = false;

  readonly form = this.fb.group({
    name: [this.store.loggedUser()?.name ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.store.loggedUser()?.email ?? '', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    number: ['', [Validators.required]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['SP', [Validators.required]],
    cep: ['', [Validators.required, Validators.minLength(9)]],
    paymentMethod: ['Cartao', [Validators.required]],
    cardNumber: [''],
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
    this.form.controls.cardNumber.setValue(
      formatCardNumber((event.target as HTMLInputElement).value),
    );
  }

  onStateChange(event: Event): void {
    this.selectedState.set((event.target as HTMLSelectElement).value as EstadoBrasileiro);
  }

  async submit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    const paymentMethod = (this.form.controls.paymentMethod.value ?? 'Cartao') as FormaPagamento;
    const state = (this.form.controls.state.value ?? 'SP') as EstadoBrasileiro;

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

    this.isSubmitting = true;
    const result = await this.store.criarPedido({
      name: this.form.value.name ?? '',
      email: this.form.value.email ?? '',
      address: this.form.value.address ?? '',
      number: this.form.value.number ?? '',
      city: this.form.value.city ?? '',
      state,
      cep: this.form.value.cep ?? '',
      paymentMethod,
      cardNumber: this.form.value.cardNumber ?? '',
    });
    this.isSubmitting = false;
    this.message = result.message;

    if (result.success) {
      this.router.navigateByUrl('/confirmacao');
    }
  }

  private calculateShippingFee(state: EstadoBrasileiro): number {
    return SHIPPING_FEE_GROUPS.find((group) => group.states.includes(state))?.fee ?? 39.9;
  }
}
