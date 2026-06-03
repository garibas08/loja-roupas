import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, firstValueFrom } from 'rxjs';
import { ApiServico } from './api.service';
import {
  RespostaAutenticacao,
  SessaoAutenticacao,
  ItemCarrinho,
  DadosCheckout,
  DadosCriacaoPedido,
  UsuarioLogado,
  ResultadoOperacao,
  ResumoPedido,
  Produto,
  FiltroCategoriaProduto,
  DadosProduto,
  DadosAtualizacaoPerfil,
  UsuarioCadastro,
} from './models';
import { PRODUTOS } from './products';

const CART_KEY = 'store-cart';
const AUTH_SESSION_KEY = 'store-auth-session';
const LAST_ORDER_KEY = 'store-last-order';
const WISHLIST_KEY = 'store-wishlist';

interface ItemCarrinhoAntigo {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  descricao?: string;
  quantidade: number;
}

interface ReferenciaCarrinho {
  productId: number;
  quantity: number;
}

type EntradaCarrinhoSalva = ItemCarrinho | ItemCarrinhoAntigo | ReferenciaCarrinho;

@Injectable({ providedIn: 'root' })
export class LojaServico {
  private readonly api = inject(ApiServico);
  private readonly storedSession = this.lerSessaoSalva();
  private authToken: string | null = this.storedSession?.token ?? null;

  readonly products = signal<Produto[]>(PRODUTOS);
  readonly searchTerm = signal('');
  readonly activeCategory = signal<FiltroCategoriaProduto>('Todos');
  readonly cart = signal<ItemCarrinho[]>(this.lerCarrinhoSalvo());
  readonly wishlist = signal<number[]>(this.lerStorage<number[]>(WISHLIST_KEY, []));
  readonly loggedUser = signal<UsuarioLogado | null>(this.storedSession?.user ?? null);
  readonly orders = signal<ResumoPedido[]>([]);
  readonly lastOrder = signal<ResumoPedido | null>(
    this.lerStorage<ResumoPedido | null>(LAST_ORDER_KEY, null),
  );
  readonly cartPopupVisible = signal(false);
  readonly lastAddedItem = signal<ItemCarrinho | null>(null);
  readonly productsLoading = signal(true);
  readonly authLoading = signal(false);
  readonly ordersLoading = signal(false);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.activeCategory();

    return this.products().filter((product) => {
      const matchesCategory = category === 'Todos' || product.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [product.name, product.description, product.category].some((value) =>
        value.toLowerCase().includes(term),
      );
    });
  });

  readonly cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  readonly wishlistCount = computed(() => this.wishlist().length);
  readonly wishlistProducts = computed(() => {
    const wishlistIds = new Set(this.wishlist());
    return this.products().filter((product) => wishlistIds.has(product.id));
  });
  readonly isAdmin = computed(() => this.loggedUser()?.role === 'ADMIN');

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setActiveCategory(category: FiltroCategoriaProduto): void {
    this.activeCategory.set(category);
  }

  carregarProdutos(): void {
    this.productsLoading.set(true);
    this.api
      .buscarProdutos()
      .pipe(finalize(() => this.productsLoading.set(false)))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.reconciliarCarrinhoComCatalogo(products);
        },
        error: () => this.products.set([...PRODUTOS]),
      });
  }

  carregarCarrinho(): void {
    this.cart.set(this.lerCarrinhoSalvo());
    this.reconciliarCarrinhoComCatalogo(this.products());
  }

  async iniciarSessao(): Promise<void> {
    const token = this.authToken;

    if (!token) {
      return;
    }

    this.authLoading.set(true);

    try {
      const user = await firstValueFrom(this.api.buscarUsuarioAtual(token));
      this.salvarSessao({ token, user });
      await this.carregarMeusPedidos();
    } catch {
      this.limparSessao();
      this.orders.set([]);
    } finally {
      this.authLoading.set(false);
    }
  }

  buscarProdutoPorId(id: number): Produto | undefined {
    return this.products().find((product) => product.id === id);
  }

  adicionarAoCarrinho(productId: number): void {
    const product = this.buscarProdutoPorId(productId);

    if (!product) {
      return;
    }

    const nextCart = [...this.cart()];
    const item = nextCart.find((entry) => entry.id === productId);

    if (item) {
      item.quantity += 1;
    } else {
      nextCart.push(this.montarItemCarrinho(product, 1));
    }

    this.atualizarCarrinho(nextCart);
    const addedItem = nextCart.find((entry) => entry.id === productId) ?? null;
    this.lastAddedItem.set(addedItem ? { ...addedItem } : null);
    this.cartPopupVisible.set(true);
  }

  atualizarQuantidadeItem(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removerDoCarrinho(productId);
      return;
    }

    this.atualizarCarrinho(
      this.cart().map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  }

  removerDoCarrinho(productId: number): void {
    this.atualizarCarrinho(this.cart().filter((item) => item.id !== productId));
  }

  limparCarrinho(): void {
    this.atualizarCarrinho([]);
  }

  alternarFavorito(productId: number): void {
    const productExists = this.products().some((product) => product.id === productId);

    if (!productExists) {
      return;
    }

    const current = this.wishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    this.atualizarFavoritos(next);
  }

  removerDosFavoritos(productId: number): void {
    this.atualizarFavoritos(this.wishlist().filter((id) => id !== productId));
  }

  limparFavoritos(): void {
    this.atualizarFavoritos([]);
  }

  estaNosFavoritos(productId: number): boolean {
    return this.wishlist().includes(productId);
  }

  fecharAvisoCarrinho(): void {
    this.cartPopupVisible.set(false);
  }

  async cadastrarUsuario(user: UsuarioCadastro): Promise<ResultadoOperacao> {
    try {
      const response = await firstValueFrom(this.api.register(user));
      this.salvarRespostaAutenticacao(response);
      await this.carregarMeusPedidos();
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel concluir o cadastro.'),
      };
    }
  }

  async login(email: string, password: string): Promise<ResultadoOperacao> {
    try {
      const response = await firstValueFrom(this.api.login(email, password));
      this.salvarRespostaAutenticacao(response);
      await this.carregarMeusPedidos();
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel fazer login.'),
      };
    }
  }

  async atualizarPerfil(payload: DadosAtualizacaoPerfil): Promise<ResultadoOperacao> {
    const token = this.authToken;

    if (!token) {
      return { success: false, message: 'Sessao invalida.' };
    }

    try {
      const user = await firstValueFrom(this.api.atualizarPerfil(payload, token));
      this.salvarSessao({ token, user });
      return { success: true, message: 'Perfil atualizado com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel atualizar o perfil.'),
      };
    }
  }

  async cadastrarProduto(payload: DadosProduto): Promise<ResultadoOperacao> {
    const token = this.authToken;

    if (!token || !this.isAdmin()) {
      return { success: false, message: 'Acesso restrito a administradores.' };
    }

    try {
      const product = await firstValueFrom(this.api.cadastrarProduto(payload, token));
      this.products.update((products) => [...products, product]);
      return { success: true, message: 'Produto cadastrado com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel cadastrar o produto.'),
      };
    }
  }

  async removerProduto(productId: number): Promise<ResultadoOperacao> {
    const token = this.authToken;

    if (!token || !this.isAdmin()) {
      return { success: false, message: 'Acesso restrito a administradores.' };
    }

    try {
      await firstValueFrom(this.api.removerProduto(productId, token));
      this.products.update((products) => products.filter((product) => product.id !== productId));
      this.removerDoCarrinho(productId);
      this.removerDosFavoritos(productId);
      return { success: true, message: 'Produto removido com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel remover o produto.'),
      };
    }
  }

  async solicitarRedefinicaoSenha(email: string): Promise<ResultadoOperacao> {
    try {
      const response = await firstValueFrom(this.api.solicitarRedefinicaoSenha(email));
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel solicitar a recuperacao.'),
      };
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<ResultadoOperacao> {
    try {
      const response = await firstValueFrom(
        this.api.confirmarRedefinicaoSenha(email, code, newPassword),
      );
      this.limparSessao();
      this.orders.set([]);
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel alterar a senha.'),
      };
    }
  }

  logout(): void {
    const token = this.authToken;

    if (token) {
      this.api.logout(token).subscribe({ error: () => void 0 });
    }

    this.limparCarrinho();
    this.lastAddedItem.set(null);
    this.cartPopupVisible.set(false);
    this.orders.set([]);
    this.limparSessao();
  }

  async criarPedido(customer: DadosCheckout): Promise<ResultadoOperacao> {
    this.reconciliarCarrinhoComCatalogo(this.products());

    if (!this.cart().length) {
      return { success: false, message: 'Seu carrinho esta vazio.' };
    }

    const payload: DadosCriacaoPedido = {
      ...customer,
      items: this.cart().map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const order = await firstValueFrom(this.api.criarPedido(payload, this.authToken));
      this.lastOrder.set(order);
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      this.limparCarrinho();

      if (this.authToken) {
        await this.carregarMeusPedidos();
      }

      return { success: true, message: 'Pedido criado com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extrairMensagemErro(error, 'Nao foi possivel finalizar o pedido.'),
      };
    }
  }

  async carregarMeusPedidos(): Promise<void> {
    if (!this.authToken) {
      this.orders.set([]);
      return;
    }

    this.ordersLoading.set(true);

    try {
      const orders = await firstValueFrom(this.api.listarMeusPedidos(this.authToken));
      this.orders.set(orders);
    } catch {
      this.orders.set([]);
    } finally {
      this.ordersLoading.set(false);
    }
  }

  private atualizarCarrinho(cart: ItemCarrinho[]): void {
    this.cart.set(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  private reconciliarCarrinhoComCatalogo(products: Produto[]): void {
    if (!this.cart().length || !products.length) {
      return;
    }

    const cart = this.cart();
    const nextCart = cart
      .map((item) => this.reconciliarItemCarrinho(item, products))
      .filter((item): item is ItemCarrinho => item !== null);

    if (!this.carrinhosIguais(cart, nextCart)) {
      this.atualizarCarrinho(nextCart);
    }
  }

  private reconciliarItemCarrinho(item: ItemCarrinho, products: Produto[]): ItemCarrinho | null {
    const product =
      products.find((entry) => entry.id === item.id) ??
      products.find((entry) => entry.image === item.image) ??
      products.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());

    return product ? this.montarItemCarrinho(product, Math.max(1, item.quantity)) : null;
  }

  private carrinhosIguais(current: ItemCarrinho[], next: ItemCarrinho[]): boolean {
    return (
      current.length === next.length &&
      current.every((item, index) => {
        const nextItem = next[index];

        return (
          nextItem &&
          item.id === nextItem.id &&
          item.name === nextItem.name &&
          item.price === nextItem.price &&
          item.image === nextItem.image &&
          item.description === nextItem.description &&
          item.quantity === nextItem.quantity
        );
      })
    );
  }

  private atualizarFavoritos(productIds: number[]): void {
    const uniqueIds = [...new Set(productIds)];
    this.wishlist.set(uniqueIds);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(uniqueIds));
  }

  private lerCarrinhoSalvo(): ItemCarrinho[] {
    return this.lerStorage<EntradaCarrinhoSalva[]>(CART_KEY, [])
      .map((item) => this.normalizarItemCarrinho(item))
      .filter((item): item is ItemCarrinho => item !== null);
  }

  private normalizarItemCarrinho(item: EntradaCarrinhoSalva): ItemCarrinho | null {
    if (this.ehItemCarrinho(item)) {
      return {
        ...item,
        description: item.description || this.buscarProdutoPorId(item.id)?.description || '',
      };
    }

    if (this.ehItemCarrinhoAntigo(item)) {
      return {
        id: item.id,
        name: item.nome,
        price: item.preco,
        image: item.imagem,
        description: item.descricao ?? this.buscarProdutoPorId(item.id)?.description ?? '',
        quantity: item.quantidade,
      };
    }

    return this.itemCarrinhoPorProduto(item.productId, item.quantity);
  }

  private ehItemCarrinho(item: EntradaCarrinhoSalva): item is ItemCarrinho {
    return (
      'id' in item && 'name' in item && 'price' in item && 'image' in item && 'quantity' in item
    );
  }

  private ehItemCarrinhoAntigo(item: EntradaCarrinhoSalva): item is ItemCarrinhoAntigo {
    return (
      'id' in item && 'nome' in item && 'preco' in item && 'imagem' in item && 'quantidade' in item
    );
  }

  private itemCarrinhoPorProduto(productId: number, quantity: number): ItemCarrinho | null {
    const product = this.buscarProdutoPorId(productId);
    return product ? this.montarItemCarrinho(product, quantity) : null;
  }

  private montarItemCarrinho(product: Produto, quantity: number): ItemCarrinho {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity,
    };
  }

  private salvarRespostaAutenticacao(response: RespostaAutenticacao): void {
    this.salvarSessao({
      token: response.token,
      user: response.user,
    });
  }

  private salvarSessao(session: SessaoAutenticacao): void {
    this.authToken = session.token;
    this.loggedUser.set(session.user);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  private limparSessao(): void {
    this.authToken = null;
    this.loggedUser.set(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  private lerSessaoSalva(): SessaoAutenticacao | null {
    const session = this.lerStorage<SessaoAutenticacao | null>(AUTH_SESSION_KEY, null);
    return session?.token && session.user ? session : null;
  }

  private extrairMensagemErro(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }

  private lerStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
