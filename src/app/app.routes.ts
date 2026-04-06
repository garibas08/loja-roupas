import { Routes } from '@angular/router';
import { CartPageComponent } from './pages/cart/cart-page';
import { CheckoutPageComponent } from './pages/checkout/checkout-page';
import { ConfirmationPageComponent } from './pages/confirmation/confirmation-page';
import { HomePageComponent } from './pages/home/home-page';
import { LoginPageComponent } from './pages/login/login-page';
import { AccountPageComponent } from './pages/account/account-page';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail-page';
import { RegisterPageComponent } from './pages/register/register-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'produto/:id', component: ProductDetailPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'minha-conta', component: AccountPageComponent },
  { path: 'cadastro', component: RegisterPageComponent },
  { path: 'carrinho', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'confirmacao', component: ConfirmationPageComponent },
  { path: '**', redirectTo: '' }
];
