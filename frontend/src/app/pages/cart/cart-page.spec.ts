import { registerLocaleData } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import localePt from '@angular/common/locales/pt';
import { StoreService } from '../../utils/store.service';
import { CartPageComponent } from './cart-page';

registerLocaleData(localePt, 'pt-BR');

describe('CartPageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should render cart item image, description and quantity without extra interaction', () => {
    const store = TestBed.inject(StoreService);
    store.cart.set([
      {
        id: 1,
        name: 'Camiseta Branca',
        price: 59.9,
        image: '/assets/produtos/camisa.jpg',
        description: 'Camiseta branca basica de algodao com toque leve e corte reto para o dia a dia.',
        quantity: 2
      }
    ]);

    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cartImage = compiled.querySelector('.cart-item img');
    const cartDescription = compiled.querySelector('.cart-item__info p');
    const quantity = compiled.querySelector('.cart-item__quantity span');

    expect(cartImage?.getAttribute('src')).toContain('/assets/produtos/camisa.jpg');
    expect(cartDescription?.textContent).toContain('algodao');
    expect(quantity?.textContent?.trim()).toBe('2');
  });
});
