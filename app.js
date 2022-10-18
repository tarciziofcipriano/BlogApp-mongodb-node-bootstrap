// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
// Recebe a função que vem do express
const app = express();
// Importa as rotas do arquivo admin
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
// Renderizar as mensagens de sucesso e erro apenas uma vez, desaparece ao atualizar a página
const flash = require("connect-flash");
// Carregar o model de postagens
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
// Carregar o model de categorias
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
// Carregar rotas de usuarios
const usuarios = require("./routes/usuario");
// Carregar o model de autenticação
const passport = require("passport");
require("./config/auth")(passport);

// Configurações
// Sessao
// Criação e configuração de Middleware (autenticação)
app.use(
  session({
    secret: "stringsecret",
    resave: true,
    saveUninitialized: true,
  })
);
// Autenticação do usuário
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Middleware (Valida cada requisição feita pelo usuário, autenticação)
app.use((req, res, next) => {
  // Mensagens de sucesso e falha
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  // Renderizar mensagem de erro caso a autenticação do login falhe
  res.locals.error = req.flash("error")
  // A variavel user vai armazenar os dados do usuário autenticado
  res.locals.user = req.user || null;
  // Finaliza o Middleware
  next();
});
// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Handlebars
app.engine("handlebars", handlebars.engine({ defaulyLayout: "main" }));
app.set("view engine", "handlebars");
// Mongoose
// Conectando com o MongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.log("Erro ao se conectar", err);
  });
// Public
// Setar que a pasta que está guardando todos os arquivos estáticos é a pasta public
app.use(express.static(path.join(__dirname, "public")));

// Rotas
// Rota principal
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});
// Pesquisar a postagem pelo o slug dela
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});
// Pesquisar as categorias disponíveis
app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno a0 listar as categorias");
      res.redirect("/");
    });
});
// Link para cada categoria pelo o slug
app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      // Checar se achou a categoria
      if (categoria) {
        // Pesquisar a categoria por id
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect("/");
    });
});
// Rota de erro 404
app.get("/404", (req, res) => {
  res.send("Erro 404");
});
// Rota das postagens
app.get("/posts", (req, res) => {
  res.send("Lista de postagens");
});

// Rota administrativa
app.use("/admin", admin);

// Rota do usuário
app.use("/usuarios", usuarios);

// Setar porta
const PORT = 8081;

// Iniciando servidor
app.listen(PORT, () => {
  console.log("Servidor rodando");
});
