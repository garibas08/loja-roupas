import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class CadastroComponent {

  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  cadastrar(){
      alert("clicou");
    const usuario = {
      nome: this.nome,
      email: this.email,
      senha: this.senha
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));

    alert("Cadastro salvo!");
  }

}
