import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { StoreService } from '../../utils/store.service';
import { ThemeMode, ThemeService } from '../../utils/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly menuOpen = signal(false);
  readonly themeMenuOpen = signal(false);
  readonly cartCount = this.store.cartCount;
  readonly user = this.store.loggedUser;
  readonly currentTheme = this.themeService.theme;

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      this.themeMenuOpen.set(false);
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  updateSearch(term: string): void {
    this.store.setSearchTerm(term);
    if (this.router.url !== '/') {
      this.router.navigateByUrl('/');
    }
  }

  logout(): void {
    this.store.logout();
    this.router.navigateByUrl('/');
  }

  toggleThemeMenu(): void {
    this.themeMenuOpen.update((value) => !value);
  }

  selectTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
    this.themeMenuOpen.set(false);
  }

  get search(): string {
    return this.store.searchTerm();
  }
}
