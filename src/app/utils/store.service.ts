import { Injectable, computed, signal } from '@angular/core';
import { PRODUCTS } from './products';
import { CartItem, CheckoutData, LoggedUser, OrderSummary, Product, RegisteredUser, StoredCartItem } from './models';

const CART_KEY = 'store-cart';
const USERS_KEY = 'store-users';
const LOGGED_USER_KEY = 'store-logged-user';
const LAST_ORDER_KEY = 'store-last-order';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly products = signal<Product[]>(PRODUCTS);
  readonly searchTerm = signal('');
  readonly cart = signal<CartItem[]>(this.readCartStorage());
  readonly users = signal<RegisteredUser[]>(this.readStorage<RegisteredUser[]>(USERS_KEY, []));
  readonly loggedUser = signal<LoggedUser | null>(this.readStorage<LoggedUser | null>(LOGGED_USER_KEY, null));
  readonly lastOrder = signal<OrderSummary | null>(this.readStorage<OrderSummary | null>(LAST_ORDER_KEY, null));
  readonly cartPopupVisible = signal(false);
  readonly lastAddedItem = signal<CartItem | null>(null);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return term ? this.products().filter((product) => product.name.toLowerCase().includes(term)) : this.products();
  });

  readonly cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotal = computed(() => this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0));

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  getAllProducts(): Product[] {
    return [...PRODUCTS];
  }

  getCartItems(): CartItem[] {
    return this.readCartStorage();
  }

  loadProducts(): void {
    this.products.set([...PRODUCTS]);
  }

  loadCart(): void {
    this.cart.set(this.readCartStorage());
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

  closeCartPopup(): void {
    this.cartPopupVisible.set(false);
  }

  registerUser(user: RegisteredUser): { success: boolean; message: string } {
    const exists = this.users().some((entry) => entry.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Ja existe um cadastro com este email.' };
    }

    const updatedUsers = [...this.users(), user];
    this.users.set(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    this.setLoggedUser({ name: user.name, email: user.email });
    return { success: true, message: 'Cadastro realizado com sucesso.' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.users().find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
    );

    if (!user) {
      return { success: false, message: 'Email ou senha invalidos.' };
    }

    this.setLoggedUser({ name: user.name, email: user.email });
    return { success: true, message: 'Login realizado com sucesso.' };
  }

  logout(): void {
    this.loggedUser.set(null);
    localStorage.removeItem(LOGGED_USER_KEY);
  }

  createOrder(customer: CheckoutData): OrderSummary {
    const order: OrderSummary = {
      id: `PED-${Date.now()}`,
      items: this.cart(),
      total: this.cartTotal(),
      createdAt: new Date().toISOString(),
      customer
    };

    this.lastOrder.set(order);
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    this.clearCart();
    return order;
  }

  private setLoggedUser(user: LoggedUser): void {
    this.loggedUser.set(user);
    localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(user));
  }

  private updateCart(cart: CartItem[]): void {
    this.cart.set(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart.map((item) => this.toStoredCartItem(item))));
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

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
