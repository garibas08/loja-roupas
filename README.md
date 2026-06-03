# Garibas Store

Projeto full stack de ecommerce para uma loja de roupas. A aplicacao permite navegar pelo catalogo, filtrar produtos por categoria, favoritar itens, montar carrinho, finalizar pedidos, criar conta, fazer login, editar perfil e recuperar senha.

## Tecnologias

- Frontend: Angular 21, TypeScript, Angular Router, Reactive Forms e CSS.
- Backend: Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA e Bean Validation.
- Banco de dados: MySQL 8.4 em desenvolvimento e H2 nos testes.
- Build e testes: npm, Angular CLI, Vitest e Maven.

## Estrutura

```text
loja-roupas/
  backend/   API REST, entidades, servicos, seguranca e persistencia
  frontend/  Aplicacao Angular, paginas, componentes, assets e estado da loja
```

## Funcionalidades

- Catalogo com produtos semeados automaticamente no primeiro start do backend.
- Busca por nome, descricao ou categoria.
- Filtros por categorias: Masculino, Feminino, Acessorios e Infantil.
- Carrinho com persistencia local.
- Lista de favoritos com persistencia local.
- Cadastro, login, logout e sessao por token persistido no banco.
- Login administrativo com permissao para cadastrar e excluir produtos, incluindo imagem por clique, URL/caminho ou arrastar e soltar.
- Edicao de perfil do usuario autenticado.
- Recuperacao de senha por codigo temporario.
- Checkout com calculo de frete por UF e suporte a Cartao, Pix e Boleto.
- Historico de pedidos para usuarios autenticados.

## Requisitos

- Node.js compativel com Angular 21.
- npm 11 ou superior.
- Java 21.
- Docker, caso queira subir o MySQL pelo `docker-compose.yml`.

## Como rodar localmente

Para rodar o projeto localmente, deixe tres terminais abertos: um para o banco de dados, um para o backend e um para o frontend.

### 1. Banco de dados local

O banco usado em desenvolvimento e o MySQL. Para iniciar pelo Docker, deixe o Docker Desktop aberto e rode:

```powershell
cd backend
docker compose up -d
```

Para conferir se o container subiu:

```powershell
cd backend
docker compose ps
```

O banco fica disponivel em `localhost:3306`, com database `loja_roupas`, usuario `root` e senha `root`.

Se preferir usar um MySQL ja instalado na maquina, crie o banco `loja_roupas` e confira se as credenciais batem com estas variaveis:

```properties
DB_USERNAME=root
DB_PASSWORD=root
```

Para parar o banco:

```powershell
cd backend
docker compose down
```

### 2. Backend local

Depois que o banco estiver rodando, inicie a API:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
cd backend
./mvnw spring-boot:run
```

O backend fica disponivel em `http://localhost:8080/api`.

### 3. Frontend local

Na primeira vez, instale as dependencias:

```powershell
cd frontend
npm install
```

Depois, inicie o Angular:

```powershell
cd frontend
npm start
```

O frontend fica disponivel em `http://localhost:4200`.

### 4. Acesso local

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080/api`
- Admin local: email `admin@garibas.com`, senha `admin123`

## Configuracao

O backend le as credenciais do banco pelas variaveis abaixo. Os valores padrao estao alinhados ao `backend/docker-compose.yml`.

```properties
DB_URL=jdbc:mysql://localhost:3306/loja_roupas?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo
DB_USERNAME=root
DB_PASSWORD=root
```

O usuario administrador inicial pode ser ajustado por variaveis de ambiente antes de iniciar o backend:

```properties
APP_ADMIN_EMAIL=admin@garibas.com
APP_ADMIN_PASSWORD=admin123
```

Para enviar o codigo real de recuperacao de senha por email, configure um SMTP antes de iniciar o backend:

```properties
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app
MAIL_FROM=seu-email@gmail.com
MAIL_FROM_NAME=Garibas Store
```

No Gmail, gere uma senha de app na conta Google e use essa senha em `MAIL_PASSWORD`. A senha normal do email geralmente nao funciona para SMTP.

A URL da API usada pelo frontend fica em:

```text
frontend/src/app/utils/api.config.ts
```

## Endpoints principais

- `GET /api/products`: lista produtos.
- `GET /api/products/{id}`: busca produto por id.
- `GET /api/products/categories`: lista categorias.
- `POST /api/products`: cadastra produto, exige usuario admin.
- `DELETE /api/products/{id}`: exclui produto, exige usuario admin.
- `POST /api/auth/register`: cria usuario.
- `POST /api/auth/login`: autentica usuario.
- `GET /api/auth/me`: retorna usuario autenticado.
- `PUT /api/auth/me`: atualiza perfil.
- `POST /api/auth/password-reset/request`: solicita codigo de recuperacao.
- `POST /api/auth/password-reset/confirm`: altera senha usando o codigo.
- `POST /api/auth/logout`: revoga token.
- `POST /api/orders`: cria pedido.
- `GET /api/orders/me`: lista pedidos do usuario autenticado.

## Testes e build

Frontend:

```bash
cd frontend
npm test -- --watch=false
npm run build
```

Backend:

```bash
cd backend
./mvnw test
```

No Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd test
```
### Resumo inicialização

# PowerShell como administrador
Start-Service MySQL80

# Terminal 1
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2
cd frontend
npm start
