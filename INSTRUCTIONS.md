# Instruções para Configuração do Projeto

Siga os passos abaixo para rodar a aplicação e o banco de dados localmente.

### Pré-requisitos
- Docker e Docker Compose
- Node.js e npm

### 1. Iniciar o Banco de Dados
Para subir o container do PostgreSQL, execute o seguinte comando na raiz do projeto:
```bash
docker-compose up -d
```

### 2. Instalar Dependências
Instale as dependências do Node.js:
```bash
npm install
```

### 3. Rodar Migrations e Seeds
Para criar as tabelas e popular o banco de dados com dados iniciais, execute:
```bash
# Para rodar as migrations (criar tabelas)
npx knex migrate:latest

# Para rodar as seeds (popular tabelas)
npx knex seed:run
```

### Script de Reset (Opcional)
Para resetar o banco de dados (apagar tabelas, recriá-las e repopulá-las) de uma só vez, use o script:
```bash
npm run db:reset
```

### 4. Iniciar a Aplicação
Com o banco de dados rodando e configurado, inicie o servidor da API:
```bash
npm start
```
A API estará disponível em `http://localhost:3000`.