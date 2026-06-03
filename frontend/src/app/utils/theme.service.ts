import { DOCUMENT } from '@angular/common';
import { Injectable, Renderer2, RendererFactory2, inject, signal } from '@angular/core';

export type ModoTema = 'claro' | 'escuro';

const THEME_KEY = 'tema';

@Injectable({ providedIn: 'root' })
export class TemaServico {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;

  readonly theme = signal<ModoTema>(this.readTheme());

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this.theme());
  }

  setTheme(theme: ModoTema): void {
    this.theme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  applySavedTheme(): void {
    this.applyTheme(this.readTheme());
  }

  toggleTheme(theme: ModoTema): void {
    this.setTheme(theme);
  }

  private applyTheme(theme: ModoTema): void {
    const body = this.document.body;
    this.renderer.removeClass(body, 'tema-claro');
    this.renderer.removeClass(body, 'tema-escuro');
    this.renderer.addClass(body, theme === 'escuro' ? 'tema-escuro' : 'tema-claro');
  }

  private readTheme(): ModoTema {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'escuro' ? 'escuro' : 'claro';
  }
}
