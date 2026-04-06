import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

@Component({
  selector: 'app-account-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPageComponent {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  readonly user = this.store.loggedUser;

  logout(): void {
    this.store.logout();
    this.router.navigateByUrl('/');
  }
}
