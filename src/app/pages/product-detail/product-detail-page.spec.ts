import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { ProductDetailPageComponent } from './product-detail-page';

registerLocaleData(localePt, 'pt-BR');

describe('ProductDetailPageComponent', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ id: '7' }));

  beforeEach(async () => {
    localStorage.clear();
    paramMap$.next(convertToParamMap({ id: '7' }));

    await TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
            snapshot: { paramMap: convertToParamMap({ id: '7' }) }
          }
        }
      ]
    }).compileComponents();
  });

  it('should expose previous and next products and navigate to the next item', () => {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    expect(component.previousProduct()?.id).toBe(6);
    expect(component.nextProduct()?.id).toBe(8);

    component.goToSiblingProduct('next');

    expect(navigateSpy).toHaveBeenCalledWith(['/produto', 8]);
  });
});
