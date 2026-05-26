import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-password-reset-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset-page.html',
  styleUrl: './password-reset-page.css'
})
export class PasswordResetPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StoreService);

  requestMessage = '';
  resetMessage = '';
  isRequesting = false;
  isResetting = false;

  readonly requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  async requestCode(): Promise<void> {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isRequesting = true;
    const email = this.requestForm.controls.email.value ?? '';
    const result = await this.store.requestPasswordReset(email);
    this.isRequesting = false;
    this.requestMessage = result.message;

    if (result.success) {
      this.resetForm.controls.email.setValue(email);
    }
  }

  async resetPassword(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const { email, code, newPassword, confirmPassword } = this.resetForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.resetMessage = 'As senhas nao conferem.';
      return;
    }

    this.isResetting = true;
    const result = await this.store.resetPassword(email ?? '', code ?? '', newPassword ?? '');
    this.isResetting = false;
    this.resetMessage = result.message;

    if (result.success) {
      this.resetForm.reset();
    }
  }
}
