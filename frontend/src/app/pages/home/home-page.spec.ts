import { registerLocaleData } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import localePt from '@angular/common/locales/pt';
import { HomePageComponent } from './home-page';

registerLocaleData(localePt, 'pt-BR');

describe('HomePageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should render the showcase and product cards on first load', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const showcaseTitle = compiled.querySelector('.showcase__content h2');
    const showcaseDescription = compiled.querySelector('.showcase__content p');
    const showcaseImage = compiled.querySelector('.showcase__media img');
    const catalogDescriptions = compiled.querySelectorAll('.catalog-card__description');

    expect(showcaseTitle?.textContent).toContain('Polo Feminina Breeze');
    expect(showcaseDescription?.textContent).toContain('Polo feminina');
    expect(showcaseImage?.getAttribute('src')).toContain('/assets/produtos/camisaUmfem.jpg');
    expect(catalogDescriptions.length).toBeGreaterThan(0);
  });

  it('should filter the catalog by selected category', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleCategory('Acessorios');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const categoryLabels = Array.from(compiled.querySelectorAll('.catalog-card__category')).map((element) =>
      element.textContent?.trim()
    );

    expect(categoryLabels.length).toBe(4);
    expect(categoryLabels.every((label) => label === 'Acessorios')).toBe(true);
  });
});
