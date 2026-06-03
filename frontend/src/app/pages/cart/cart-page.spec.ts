import { registerLocaleData } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import localePt from '@angular/common/locales/pt';
import { LojaServico } from '../../utils/store.service';
import { PaginaCarrinhoComponent } from './cart-page';

registerLocaleData(localePt, 'pt-BR');

describe('PaginaCarrinhoComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PaginaCarrinhoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('exibe imagem, descrição e quantidade do item do carrinho sem interação extra', () => {
    const store = TestBed.inject(LojaServico);
    store.cart.set([
      {
        id: 1,
        name: 'Camiseta Branca',
        price: 59.9,
        image: '/assets/produtos/camisa.jpg',
        description:
          'Camiseta branca basica de algodao com toque leve e corte reto para o dia a dia.',
        quantity: 2,
      },
    ]);

    const fixture = TestBed.createComponent(PaginaCarrinhoComponent);
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
