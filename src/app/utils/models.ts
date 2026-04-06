export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
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

export interface LoggedUser {
  name: string;
  email: string;
}

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
