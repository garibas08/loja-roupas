import { Routes } from '@angular/router';
import { PaginaCarrinhoComponent } from './pages/cart/cart-page';
import { PaginaCheckoutComponent } from './pages/checkout/checkout-page';
import { PaginaConfirmacaoComponent } from './pages/confirmation/confirmation-page';
import { PaginaInicialComponent } from './pages/home/home-page';
import { PaginaLoginComponent } from './pages/login/login-page';
import { PaginaContaComponent } from './pages/account/account-page';
import { PaginaAdminComponent } from './pages/admin/admin-page';
import { PaginaRedefinirSenhaComponent } from './pages/password-reset/password-reset-page';
import { PaginaDetalheProdutoComponent } from './pages/product-detail/product-detail-page';
import { PaginaCadastroComponent } from './pages/register/register-page';
import { PaginaFavoritosComponent } from './pages/wishlist/wishlist-page';

export const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  { path: 'produto/:id', component: PaginaDetalheProdutoComponent },
  { path: 'login', component: PaginaLoginComponent },
  { path: 'recuperar-senha', component: PaginaRedefinirSenhaComponent },
  { path: 'minha-conta', component: PaginaContaComponent },
  { path: 'admin', component: PaginaAdminComponent },
  { path: 'cadastro', component: PaginaCadastroComponent },
  { path: 'favoritos', component: PaginaFavoritosComponent },
  { path: 'carrinho', component: PaginaCarrinhoComponent },
  { path: 'checkout', component: PaginaCheckoutComponent },
  { path: 'confirmacao', component: PaginaConfirmacaoComponent },
  { path: '**', redirectTo: '' },
];
