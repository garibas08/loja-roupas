import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { PRODUCTS } from './products';
import {
  AuthResponse,
  AuthSession,
  CartItem,
  CheckoutData,
  CreateOrderPayload,
  LoggedUser,
  OrderSummary,
  Product,
  ProductCategoryFilter,
  ProfileUpdatePayload,
  RegisteredUser,
  StoredCartItem
} from './models';

const CART_KEY = 'store-cart';
const AUTH_SESSION_KEY = 'store-auth-session';
const LAST_ORDER_KEY = 'store-last-order';
const WISHLIST_KEY = 'store-wishlist';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly api = inject(ApiService);
  private authToken: string | null = this.readSessionStorage()?.token ?? null;

  readonly products = signal<Product[]>(PRODUCTS);
  readonly searchTerm = signal('');
  readonly activeCategory = signal<ProductCategoryFilter>('Todos');
  readonly cart = signal<CartItem[]>(this.readCartStorage());
  readonly wishlist = signal<number[]>(this.readStorage<number[]>(WISHLIST_KEY, []));
  readonly loggedUser = signal<LoggedUser | null>(this.readSessionStorage()?.user ?? null);
  readonly orders = signal<OrderSummary[]>([]);
  readonly lastOrder = signal<OrderSummary | null>(this.readStorage<OrderSummary | null>(LAST_ORDER_KEY, null));
  readonly cartPopupVisible = signal(false);
  readonly lastAddedItem = signal<CartItem | null>(null);
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

      return [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(term));
    });
  });

  readonly cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotal = computed(() => this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly wishlistCount = computed(() => this.wishlist().length);
  readonly wishlistProducts = computed(() => {
    const wishlistIds = new Set(this.wishlist());
    return this.products().filter((product) => wishlistIds.has(product.id));
  });

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setActiveCategory(category: ProductCategoryFilter): void {
    this.activeCategory.set(category);
  }

  getAllProducts(): Product[] {
    return [...this.products()];
  }

  getCartItems(): CartItem[] {
    return this.readCartStorage();
  }

  loadProducts(): void {
    this.productsLoading.set(true);
    this.api.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.productsLoading.set(false);
      },
      error: () => {
        this.products.set([...PRODUCTS]);
        this.productsLoading.set(false);
      }
    });
  }

  loadCart(): void {
    this.cart.set(this.readCartStorage());
  }

  async initializeSession(): Promise<void> {
    const token = this.authToken;

    if (!token) {
      return;
    }

    this.authLoading.set(true);

    try {
      const user = await firstValueFrom(this.api.getCurrentUser(token));
      this.persistSession({ token, user });
      await this.loadMyOrders();
    } catch {
      this.clearSessionState();
      this.orders.set([]);
    } finally {
      this.authLoading.set(false);
    }
  }

  getProductById(id: number): Product | undefined {
    return this.products().find((product) => product.id === id);
  }

  addToCart(productId: number): void {
    const product = this.getProductById(productId);
    if (!product) {
      return;
    }

    const current = [...this.cart()];
    const item = current.find((entry) => entry.id === productId);

    if (item) {
      item.quantity += 1;
    } else {
      current.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        quantity: 1
      });
    }

    this.updateCart(current);
    const addedItem = current.find((entry) => entry.id === productId) ?? null;
    this.lastAddedItem.set(addedItem ? { ...addedItem } : null);
    this.cartPopupVisible.set(true);
  }

  updateItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.updateCart(this.cart().map((item) => (item.id === productId ? { ...item, quantity } : item)));
  }

  removeFromCart(productId: number): void {
    this.updateCart(this.cart().filter((item) => item.id !== productId));
  }

  clearCart(): void {
    this.updateCart([]);
  }

  toggleWishlist(productId: number): void {
    const productExists = this.products().some((product) => product.id === productId);

    if (!productExists) {
      return;
    }

    const current = this.wishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    this.updateWishlist(next);
  }

  removeFromWishlist(productId: number): void {
    this.updateWishlist(this.wishlist().filter((id) => id !== productId));
  }

  clearWishlist(): void {
    this.updateWishlist([]);
  }

  isWishlisted(productId: number): boolean {
    return this.wishlist().includes(productId);
  }

  closeCartPopup(): void {
    this.cartPopupVisible.set(false);
  }

  async registerUser(user: RegisteredUser): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(this.api.register(user));
      this.persistAuthResponse(response);
      await this.loadMyOrders();
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel concluir o cadastro.')
      };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(this.api.login(email, password));
      this.persistAuthResponse(response);
      await this.loadMyOrders();
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel fazer login.')
      };
    }
  }

  async updateProfile(payload: ProfileUpdatePayload): Promise<{ success: boolean; message: string }> {
    const token = this.authToken;

    if (!token) {
      return { success: false, message: 'Sessao invalida.' };
    }

    try {
      const user = await firstValueFrom(this.api.updateProfile(payload, token));
      this.persistSession({ token, user });
      return { success: true, message: 'Perfil atualizado com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel atualizar o perfil.')
      };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(this.api.requestPasswordReset(email));
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel solicitar a recuperacao.')
      };
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(this.api.confirmPasswordReset(email, code, newPassword));
      this.clearSessionState();
      this.orders.set([]);
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel alterar a senha.')
      };
    }
  }

  logout(): void {
    const token = this.authToken;

    if (token) {
      this.api.logout(token).subscribe({ error: () => void 0 });
    }

    this.clearCart();
    this.lastAddedItem.set(null);
    this.cartPopupVisible.set(false);
    this.orders.set([]);
    this.clearSessionState();
  }

  async createOrder(customer: CheckoutData): Promise<{ success: boolean; message: string }> {
    if (!this.cart().length) {
      return { success: false, message: 'Seu carrinho esta vazio.' };
    }

    const payload: CreateOrderPayload = {
      ...customer,
      items: this.cart().map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const order = await firstValueFrom(this.api.createOrder(payload, this.authToken));
      this.lastOrder.set(order);
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      this.clearCart();

      if (this.authToken) {
        await this.loadMyOrders();
      }

      return { success: true, message: 'Pedido criado com sucesso.' };
    } catch (error) {
      return {
        success: false,
        message: this.extractErrorMessage(error, 'Nao foi possivel finalizar o pedido.')
      };
    }
  }

  async loadMyOrders(): Promise<void> {
    if (!this.authToken) {
      this.orders.set([]);
      return;
    }

    this.ordersLoading.set(true);

    try {
      const orders = await firstValueFrom(this.api.getMyOrders(this.authToken));
      this.orders.set(orders);
    } catch {
      this.orders.set([]);
    } finally {
      this.ordersLoading.set(false);
    }
  }

  private updateCart(cart: CartItem[]): void {
    this.cart.set(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart.map((item) => this.toStoredCartItem(item))));
  }

  private updateWishlist(productIds: number[]): void {
    const uniqueIds = [...new Set(productIds)];
    this.wishlist.set(uniqueIds);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(uniqueIds));
  }

  private readCartStorage(): CartItem[] {
    const rawCart = this.readStorage<
      Array<
        CartItem |
        StoredCartItem |
        { id: number; name: string; price: number; image: string; quantity: number } |
        { productId: number; quantity: number }
      >
    >(CART_KEY, []);

    return rawCart
      .map((item) => {
        if ('id' in item && 'nome' in item && 'preco' in item && 'imagem' in item) {
          const storedItem = item as StoredCartItem;

          return {
            id: storedItem.id,
            name: storedItem.nome,
            price: storedItem.preco,
            image: storedItem.imagem,
            description: storedItem.descricao,
            quantity: storedItem.quantidade
          } satisfies CartItem;
        }

        if ('id' in item && 'name' in item && 'price' in item && 'image' in item) {
          const storedItem = item as CartItem | { id: number; name: string; price: number; image: string; quantity: number };
          const product = this.products().find((entry) => entry.id === storedItem.id);

          return {
            id: storedItem.id,
            name: storedItem.name,
            price: storedItem.price,
            image: storedItem.image,
            description: 'description' in storedItem ? storedItem.description : product?.description ?? '',
            quantity: storedItem.quantity
          } satisfies CartItem;
        }

        const legacyItem = item as { productId: number; quantity: number };
        const product = this.products().find((entry) => entry.id === legacyItem.productId);

        if (!product) {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          quantity: legacyItem.quantity
        } satisfies CartItem;
      })
      .filter((item): item is CartItem => item !== null);
  }

  private toStoredCartItem(item: CartItem): StoredCartItem {
    return {
      id: item.id,
      nome: item.name,
      preco: item.price,
      imagem: item.image,
      descricao: item.description,
      quantidade: item.quantity
    };
  }

  private persistAuthResponse(response: AuthResponse): void {
    this.persistSession({
      token: response.token,
      user: response.user
    });
  }

  private persistSession(session: AuthSession): void {
    this.authToken = session.token;
    this.loggedUser.set(session.user);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  private clearSessionState(): void {
    this.authToken = null;
    this.loggedUser.set(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  private readSessionStorage(): AuthSession | null {
    const session = this.readStorage<AuthSession | null>(AUTH_SESSION_KEY, null);
    return session?.token && session.user ? session : null;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return fallback;
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
