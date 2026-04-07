import { Product, ProductCategory } from './models';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Masculino', 'Feminino', 'Acessorios', 'Infantil'];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Jaqueta Feminina Urban Denim',
    price: 229.9,
    image: '/assets/produtos/JaquetaFem.jpg',
    category: 'Feminino',
    description: 'Jaqueta feminina com lavagem jeans marcante, bolso frontal e caimento estruturado para looks casuais cheios de estilo.',
    sizes: ['P', 'M', 'G']
  },
  {
    id: 2,
    name: 'Polo Masculina Prime',
    price: 99.9,
    image: '/assets/produtos/CamisaUmMas.jpg',
    category: 'Masculino',
    description: 'Polo masculina em tecido macio com gola reforcada e modelagem reta para combinar com jeans, sarja ou jogger.',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 3,
    name: 'Bolsa Tiracolo Studio',
    price: 149.9,
    image: '/assets/produtos/AcessorioTres.jpg',
    category: 'Acessorios',
    description: 'Bolsa tiracolo compacta com acabamento moderno e espaco na medida certa para acompanhar a rotina com praticidade.',
    sizes: ['Unico']
  },
  {
    id: 4,
    name: 'Camiseta Hero Kids',
    price: 79.9,
    image: '/assets/produtos/camisaCrianca.jpg',
    category: 'Infantil',
    description: 'Camiseta infantil inspirada no universo heroico, com toque macio e modelagem confortavel para brincar o dia todo.',
    sizes: ['4', '6', '8', '10']
  },
  {
    id: 5,
    name: 'Calca Legging Move',
    price: 119.9,
    image: '/assets/produtos/CalcaUmfem.jpg',
    category: 'Feminino',
    description: 'Calca legging feminina com cintura alta e tecido flexivel que oferece conforto no treino e no dia a dia.',
    sizes: ['36', '38', '40', '42']
  },
  {
    id: 6,
    name: 'Calca Jeans Wide Blue',
    price: 169.9,
    image: '/assets/produtos/CalcaDoisfem.jpg',
    category: 'Feminino',
    description: 'Jeans feminino com lavagem azul classica e modelagem ampla que deixa o visual atual sem abrir mao do conforto.',
    sizes: ['36', '38', '40', '42', '44']
  },
  {
    id: 7,
    name: 'Polo Feminina Breeze',
    price: 89.9,
    image: '/assets/produtos/camisaUmfem.jpg',
    category: 'Feminino',
    description: 'Polo feminina leve e versatil, ideal para compor producoes casuais com toque elegante e acabamento impecavel.',
    sizes: ['P', 'M', 'G']
  },
  {
    id: 8,
    name: 'T-shirt Basica Aura',
    price: 69.9,
    image: '/assets/produtos/CamisaDoisfem.jpg',
    category: 'Feminino',
    description: 'T-shirt feminina basica com toque suave e modelagem facil de combinar em looks minimalistas ou urbanos.',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 9,
    name: 'Blusa Feminina Soft Touch',
    price: 84.9,
    image: '/assets/produtos/BlusaFem.jpg',
    category: 'Feminino',
    description: 'Blusa feminina com caimento soltinho e tecido macio para quem busca praticidade com aparencia refinada.',
    sizes: ['P', 'M', 'G']
  },
  {
    id: 10,
    name: 'Calca Jogger Street',
    price: 139.9,
    image: '/assets/produtos/CalcaUmMas.jpg',
    category: 'Masculino',
    description: 'Calca jogger masculina com visual urbano, punho ajustado e tecido confortavel para acompanhar a rotina inteira.',
    sizes: ['38', '40', '42', '44']
  },
  {
    id: 11,
    name: 'Calca Sarja Classic',
    price: 159.9,
    image: '/assets/produtos/CalcaDoisMas.jpg',
    category: 'Masculino',
    description: 'Calca de sarja masculina com corte reto e acabamento clean para montar producoes do trabalho ao fim de semana.',
    sizes: ['38', '40', '42', '44', '46']
  },
  {
    id: 12,
    name: 'Camiseta Basica Core',
    price: 64.9,
    image: '/assets/produtos/CamisaDoisMas.jpg',
    category: 'Masculino',
    description: 'Camiseta masculina basica com tecido leve, gola resistente e visual versatil para usar em qualquer ocasiao.',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 13,
    name: 'Blusa Masculina Essential',
    price: 94.9,
    image: '/assets/produtos/blusaMas.jpg',
    category: 'Masculino',
    description: 'Blusa masculina com toque macio e visual moderno para dias amenos, combinando conforto e estilo sem esforco.',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 14,
    name: 'Jaqueta Masculina Downtown',
    price: 239.9,
    image: '/assets/produtos/JaquetaMas.jpg',
    category: 'Masculino',
    description: 'Jaqueta masculina com estrutura firme, detalhes marcantes e proposta urbana para elevar qualquer combinacao.',
    sizes: ['M', 'G', 'GG']
  },
  {
    id: 15,
    name: 'Calca Infantil Play',
    price: 89.9,
    image: '/assets/produtos/calcaCrianca.jpg',
    category: 'Infantil',
    description: 'Calca infantil confortavel com modelagem solta e tecido resistente para acompanhar escola, parque e passeio.',
    sizes: ['4', '6', '8', '10']
  },
  {
    id: 16,
    name: 'Blusa Infantil Color Fun',
    price: 74.9,
    image: '/assets/produtos/BlusaCrianca.jpg',
    category: 'Infantil',
    description: 'Blusa infantil divertida com toque suave e visual alegre para deixar os looks das criancas ainda mais especiais.',
    sizes: ['4', '6', '8', '10']
  },
  {
    id: 17,
    name: 'Bone Street Club',
    price: 49.9,
    image: '/assets/produtos/AcessorioUm.jpg',
    category: 'Acessorios',
    description: 'Bone com aba curva e ajuste traseiro para completar o visual com atitude e praticidade em qualquer estacao.',
    sizes: ['Unico']
  },
  {
    id: 18,
    name: 'Pulseira Urban Chain',
    price: 39.9,
    image: '/assets/produtos/AcessorioDois.jpg',
    category: 'Acessorios',
    description: 'Pulseira com design contemporaneo e acabamento metalico para trazer personalidade a producoes minimalistas.',
    sizes: ['Unico']
  },
  {
    id: 19,
    name: 'Brinco Glow Mini',
    price: 34.9,
    image: '/assets/produtos/Acessorioquatro.jpg',
    category: 'Acessorios',
    description: 'Brinco delicado com brilho na medida certa para finalizar o look com leveza, elegancia e versatilidade.',
    sizes: ['Unico']
  }
];
