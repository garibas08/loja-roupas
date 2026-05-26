import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthResponse,
  CreateOrderPayload,
  LoggedUser,
  MessageResponse,
  OrderSummary,
  Product,
  ProfileUpdatePayload,
  RegisteredUser
} from './models';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getProducts() {
    return this.http.get<Product[]>(`${API_BASE_URL}/products`);
  }

  register(payload: RegisteredUser) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload);
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password });
  }

  getCurrentUser(token: string) {
    return this.http.get<LoggedUser>(`${API_BASE_URL}/auth/me`, {
      headers: this.authHeaders(token)
    });
  }

  updateProfile(payload: ProfileUpdatePayload, token: string) {
    return this.http.put<LoggedUser>(`${API_BASE_URL}/auth/me`, payload, {
      headers: this.authHeaders(token)
    });
  }

  requestPasswordReset(email: string) {
    return this.http.post<MessageResponse>(`${API_BASE_URL}/auth/password-reset/request`, { email });
  }

  confirmPasswordReset(email: string, code: string, newPassword: string) {
    return this.http.post<MessageResponse>(`${API_BASE_URL}/auth/password-reset/confirm`, {
      email,
      code,
      newPassword
    });
  }

  logout(token: string) {
    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}, {
      headers: this.authHeaders(token)
    });
  }

  createOrder(payload: CreateOrderPayload, token?: string | null) {
    return this.http.post<OrderSummary>(`${API_BASE_URL}/orders`, payload, {
      headers: token ? this.authHeaders(token) : undefined
    });
  }

  getMyOrders(token: string) {
    return this.http.get<OrderSummary[]>(`${API_BASE_URL}/orders/me`, {
      headers: this.authHeaders(token)
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
