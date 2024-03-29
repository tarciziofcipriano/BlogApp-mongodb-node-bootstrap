# BlogApp-with-mongodb-node-bootstrap


Um simples blog, com o objetivo de mostrar uma interação entre um frontend desenvolvido com Bootstrap e um banco de dados MongoDB. Também foram utilizadas ferramentas de autenticação, criptografia de senhas e criação de rotas do back para o front. 

No projeto foram adicionados alguns comentários para o melhor entendimento do desenvolvedor.  

## Tecnologias utilizadas:
- MongoDB (Banco de dados)
- Mongosh (Terminal do MongoDB)
- Bcryptjs (Criptografar a senha do usuário)
- Passport (Sistema de autenticação)
- Bootstrap (Frontend)
- Node.js / Express.js

### Instalando as dependências

Na pasta do raiz do projeto execute:

```bash
yarn install
# ou
npm install
```

> Este passo só precisa ser feito na primeira vez que rodar o projeto

## Iniciando o servidor:
- Abra o terminal [Mongosh](https://www.mongodb.com/docs/mongodb-shell/install/#std-label-mdb-shell-install) e digite a porta que deseja que o servidor se conecte (Exemplo: 8090)

## Rodando o projeto
- Após iniciar o servidor, abra o terminal do vsCode e rode o comando: yarn start
- Acesse a url http://localhost:8081/ para renderizar o projeto

## Alguns comandos para acessar os dados no MongoDB via mongosh:
- show databases;
- use blogapp;
- show collections;
- db.categorias.find() ou db.postagens.find() ou db.usuarios.find();


### O projeto foi desenvolvido a partir do curso: [Curso de NodeJS](https://www.youtube.com/watch?v=LLqq6FemMNQ&list=PLJ_KhUnlXUPtbtLwaxxUxHqvcNQndmI4B&index=1)
