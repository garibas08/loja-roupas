import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-account-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  readonly user = this.store.loggedUser;
  readonly orders = this.store.orders;
  readonly ordersLoading = this.store.ordersLoading;
  readonly latestOrder = computed(() => this.orders()[0] ?? this.store.lastOrder());
  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });
  profileMessage = '';
  isSavingProfile = false;

  constructor() {
    effect(() => {
      const currentUser = this.user();

      if (!currentUser) {
        return;
      }

      this.profileForm.patchValue({
        name: currentUser.name,
        email: currentUser.email
      }, { emitEvent: false });
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    const { name, email } = this.profileForm.getRawValue();
    const result = await this.store.updateProfile({
      name: name ?? '',
      email: email ?? ''
    });

    this.isSavingProfile = false;
    this.profileMessage = result.message;
  }

  logout(): void {
    this.store.logout();
    this.router.navigateByUrl('/');
  }
}
