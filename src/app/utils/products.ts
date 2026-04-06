import { Product } from './models';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Camiseta Branca',
    price: 59.9,
    image: '/assets/produtos/camisa.jpg',
    category: 'Masculino',
    description: 'Camiseta branca basica de algodao com toque leve e corte reto para o dia a dia.',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 2,
    name: 'Jaqueta Jeans',
    price: 199.9,
    image: '/assets/produtos/logo.jpg',
    category: 'Feminino',
    description: 'Jaqueta jeans azul casual com acabamento estruturado e visual moderno.',
    sizes: ['P', 'M', 'G']
  },
  {
    id: 3,
    name: 'Calca Street',
    price: 149.9,
    image: '/assets/produtos/calca.jpg',
    category: 'Masculino',
    description: 'Calca casual com modelagem confortavel e tecido versatil para estudo e passeio.',
    sizes: ['38', '40', '42', '44']
  },
  {
    id: 4,
    name: 'Bone Casual',
    price: 49.9,
    image: '/assets/produtos/bone.jpg',
    category: 'Acessorios',
    description: 'Bone com ajuste traseiro e acabamento leve para completar o visual.',
    sizes: ['Unico']
  },
  {
    id: 5,
    name: 'Vestido Breeze',
    price: 179.9,
    image: '/assets/produtos/camisa.jpg',
    category: 'Feminino',
    description: 'Vestido casual com tecido leve, corte fluido e visual elegante.',
    sizes: ['P', 'M', 'G']
  },
  {
    id: 6,
    name: 'Conjunto Mini Trend',
    price: 129.9,
    image: '/assets/produtos/calca.jpg',
    category: 'Infantil',
    description: 'Conjunto infantil confortavel com caimento solto e toque macio.',
    sizes: ['4', '6', '8', '10']
  }
];
