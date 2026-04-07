export type ProductCategory = 'Masculino' | 'Feminino' | 'Acessorios' | 'Infantil';
export type ProductCategoryFilter = ProductCategory | 'Todos';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  description: string;
  sizes: string[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity: number;
}

export interface StoredCartItem {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  descricao: string;
  quantidade: number;
}

export interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

export type LoggedUser = Omit<RegisteredUser, 'password'>;

export type PaymentMethod = 'Cartao' | 'Pix' | 'Boleto';

export interface CheckoutData {
  name: string;
  address: string;
  number: string;
  city: string;
  cep: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
}

export interface OrderSummary {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  customer: CheckoutData;
}
