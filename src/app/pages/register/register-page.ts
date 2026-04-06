import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  message = '';

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = this.store.registerUser({
      name: this.form.value.name ?? '',
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? ''
    });

    this.message = result.message;

    if (result.success) {
      this.router.navigateByUrl('/');
    }
  }
}
