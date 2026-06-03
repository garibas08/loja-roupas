import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import {
  RespostaAutenticacao,
  DadosCriacaoPedido,
  UsuarioLogado,
  RespostaMensagem,
  ResumoPedido,
  Produto,
  DadosProduto,
  DadosAtualizacaoPerfil,
  UsuarioCadastro,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiServico {
  private readonly http = inject(HttpClient);

  buscarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${API_BASE_URL}/products`);
  }

  cadastrarProduto(payload: DadosProduto, token: string): Observable<Produto> {
    return this.http.post<Produto>(`${API_BASE_URL}/products`, payload, {
      headers: this.authHeaders(token),
    });
  }

  removerProduto(productId: number, token: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/products/${productId}`, {
      headers: this.authHeaders(token),
    });
  }

  register(payload: UsuarioCadastro): Observable<RespostaAutenticacao> {
    return this.http.post<RespostaAutenticacao>(`${API_BASE_URL}/auth/register`, payload);
  }

  login(email: string, password: string): Observable<RespostaAutenticacao> {
    return this.http.post<RespostaAutenticacao>(`${API_BASE_URL}/auth/login`, { email, password });
  }

  buscarUsuarioAtual(token: string): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${API_BASE_URL}/auth/me`, {
      headers: this.authHeaders(token),
    });
  }

  atualizarPerfil(payload: DadosAtualizacaoPerfil, token: string): Observable<UsuarioLogado> {
    return this.http.put<UsuarioLogado>(`${API_BASE_URL}/auth/me`, payload, {
      headers: this.authHeaders(token),
    });
  }

  solicitarRedefinicaoSenha(email: string): Observable<RespostaMensagem> {
    return this.http.post<RespostaMensagem>(`${API_BASE_URL}/auth/password-reset/request`, {
      email,
    });
  }

  confirmarRedefinicaoSenha(
    email: string,
    code: string,
    newPassword: string,
  ): Observable<RespostaMensagem> {
    return this.http.post<RespostaMensagem>(`${API_BASE_URL}/auth/password-reset/confirm`, {
      email,
      code,
      newPassword,
    });
  }

  logout(token: string): Observable<void> {
    return this.http.post<void>(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: this.authHeaders(token),
      },
    );
  }

  criarPedido(payload: DadosCriacaoPedido, token?: string | null): Observable<ResumoPedido> {
    return this.http.post<ResumoPedido>(`${API_BASE_URL}/orders`, payload, {
      headers: token ? this.authHeaders(token) : undefined,
    });
  }

  listarMeusPedidos(token: string): Observable<ResumoPedido[]> {
    return this.http.get<ResumoPedido[]>(`${API_BASE_URL}/orders/me`, {
      headers: this.authHeaders(token),
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
