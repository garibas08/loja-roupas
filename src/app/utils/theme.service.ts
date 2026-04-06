import { DOCUMENT } from '@angular/common';
import { Injectable, Renderer2, RendererFactory2, inject, signal } from '@angular/core';

export type ThemeMode = 'claro' | 'escuro';

const THEME_KEY = 'tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;

  readonly theme = signal<ThemeMode>(this.readTheme());

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this.theme());
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  aplicarTemaSalvo(): void {
    this.applyTheme(this.readTheme());
  }

  toggleTheme(theme: ThemeMode): void {
    this.setTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const body = this.document.body;
    this.renderer.removeClass(body, 'tema-claro');
    this.renderer.removeClass(body, 'tema-escuro');
    this.renderer.addClass(body, theme === 'escuro' ? 'tema-escuro' : 'tema-claro');
  }

  private readTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'escuro' ? 'escuro' : 'claro';
  }
}
