export type CategoriaProduto = 'Masculino' | 'Feminino' | 'Acessorios' | 'Infantil';
export type FiltroCategoriaProduto = CategoriaProduto | 'Todos';
export type EstadoBrasileiro =
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

export interface Produto {
  id: number;
  name: string;
  price: number;
  image: string;
  category: CategoriaProduto;
  description: string;
  sizes: string[];
}

export interface DadosProduto {
  name: string;
  price: number;
  image: string;
  category: CategoriaProduto;
  description: string;
  sizes: string[];
}

export interface ItemCarrinho {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity: number;
}

export interface UsuarioCadastro {
  name: string;
  email: string;
  password: string;
}

export interface UsuarioLogado {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface SessaoAutenticacao {
  token: string;
  user: UsuarioLogado;
}

export interface RespostaAutenticacao extends SessaoAutenticacao {
  message: string;
}

export interface RespostaMensagem {
  message: string;
}

export interface ResultadoOperacao {
  success: boolean;
  message: string;
}

export interface DadosAtualizacaoPerfil {
  name: string;
  email: string;
}

export type FormaPagamento = 'Cartao' | 'Pix' | 'Boleto';

export interface DadosCheckout {
  name: string;
  email: string;
  address: string;
  number: string;
  city: string;
  state: EstadoBrasileiro;
  cep: string;
  paymentMethod: FormaPagamento;
  cardNumber?: string;
}

export interface ResumoPedido {
  id: string;
  items: ItemCarrinho[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  customer: DadosCheckout;
}

export interface DadosCriacaoPedido extends DadosCheckout {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
