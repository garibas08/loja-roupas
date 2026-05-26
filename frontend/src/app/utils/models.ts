export type ProductCategory = 'Masculino' | 'Feminino' | 'Acessorios' | 'Infantil';
export type ProductCategoryFilter = ProductCategory | 'Todos';
export type BrazilianState =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

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

export interface LoggedUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: LoggedUser;
}

export interface AuthResponse extends AuthSession {
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface ProfileUpdatePayload {
  name: string;
  email: string;
}

export type PaymentMethod = 'Cartao' | 'Pix' | 'Boleto';

export interface CheckoutData {
  name: string;
  address: string;
  number: string;
  city: string;
  state: BrazilianState;
  cep: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
}

export interface OrderSummary {
  id: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  customer: CheckoutData;
}

export interface CreateOrderPayload extends CheckoutData {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
