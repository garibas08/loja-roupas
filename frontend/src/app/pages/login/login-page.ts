import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LojaServico } from '../../utils/store.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class PaginaLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(LojaServico);
  private readonly router = inject(Router);

  readonly user = this.store.loggedUser;
  message = '';
  isSubmitting = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.form.getRawValue();
    const result = await this.store.login(email ?? '', password ?? '');
    this.isSubmitting = false;
    this.message = result.message;

    if (result.success) {
      this.router.navigateByUrl(this.store.isAdmin() ? '/admin' : '/minha-conta');
    }
  }
}
