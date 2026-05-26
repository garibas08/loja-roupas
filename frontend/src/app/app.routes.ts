import { Routes } from '@angular/router';
import { CartPageComponent } from './pages/cart/cart-page';
import { CheckoutPageComponent } from './pages/checkout/checkout-page';
import { ConfirmationPageComponent } from './pages/confirmation/confirmation-page';
import { HomePageComponent } from './pages/home/home-page';
import { LoginPageComponent } from './pages/login/login-page';
import { AccountPageComponent } from './pages/account/account-page';
import { PasswordResetPageComponent } from './pages/password-reset/password-reset-page';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail-page';
import { RegisterPageComponent } from './pages/register/register-page';
import { WishlistPageComponent } from './pages/wishlist/wishlist-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'produto/:id', component: ProductDetailPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'recuperar-senha', component: PasswordResetPageComponent },
  { path: 'minha-conta', component: AccountPageComponent },
  { path: 'cadastro', component: RegisterPageComponent },
  { path: 'favoritos', component: WishlistPageComponent },
  { path: 'carrinho', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'confirmacao', component: ConfirmationPageComponent },
  { path: '**', redirectTo: '' }
];
