import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiServico } from './api.service';
import { DadosCriacaoPedido, Produto, ResumoPedido } from './models';
import { LojaServico } from './store.service';

const PRODUCT_FROM_API: Produto = {
  id: 42,
  name: 'Polo Masculina Essencial',
  price: 99.9,
  image: '/assets/produtos/CamisaUmMas.jpg',
  category: 'Masculino',
  description: 'Polo atualizada pelo banco.',
  sizes: ['P', 'M', 'G'],
};

class ApiServicoMock {
  pedidoPayload: DadosCriacaoPedido | null = null;

  buscarProdutos() {
    return of([PRODUCT_FROM_API]);
  }

  criarPedido(payload: DadosCriacaoPedido) {
    this.pedidoPayload = payload;

    const order: ResumoPedido = {
      id: 'PED-TESTE',
      items: [],
      subtotal: 99.9,
      shippingFee: 12.9,
      total: 112.8,
      createdAt: new Date().toISOString(),
      customer: payload,
    };

    return of(order);
  }
}

describe('LojaServico', () => {
  let api: ApiServicoMock;
  let store: LojaServico;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [LojaServico, { provide: ApiServico, useClass: ApiServicoMock }],
    });

    api = TestBed.inject(ApiServico) as unknown as ApiServicoMock;
    store = TestBed.inject(LojaServico);
  });

  it('reconcilia item salvo com o id atual do produto antes de criar pedido', async () => {
    store.cart.set([
      {
        id: 1,
        name: 'Polo antiga',
        price: 89.9,
        image: PRODUCT_FROM_API.image,
        description: 'Dados antigos do carrinho.',
        quantity: 2,
      },
    ]);

    store.carregarProdutos();

    await store.criarPedido({
      name: 'Cliente Teste',
      address: 'Rua Teste',
      number: '123',
      city: 'Sao Paulo',
      state: 'SP',
      cep: '01000-000',
      paymentMethod: 'Pix',
    });

    expect(api.pedidoPayload?.items).toEqual([{ productId: PRODUCT_FROM_API.id, quantity: 2 }]);
    expect(store.cart()).toEqual([]);
  });
});
