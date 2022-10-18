const express = require("express");
// Recebe o express no router
const router = express.Router();
// Carregando o MongoDB
const mongoose = require("mongoose");
// Carregar o model categoria
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
// Carregar o model postagem
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
// Carregar o helper (variavel usada para proteger rotas)
const { eAdmin } = require("../helpers/eAdmin");

// Rotas
  // Rota principal
  // A expressão 'eAdmin' foi usada para que só admin acesse a rota
  // http://localhost:8081/admin
  router.get("/", eAdmin, (req, res) => {
    res.render("admin/index");
  });

  // http://localhost:8081/admin/posts
  router.get("/posts", eAdmin, (req, res) => {
    res.send("Página de posts");
  });

  // http://localhost:8081/admin/categorias
  router.get("/categorias", eAdmin, (req, res) => {
    // Lista todas as categorias que existem direto na interface
    Categoria.find()
      .sort({ date: "desc" })
      .lean()
      .then((categorias) => {
        res.render("admin/categorias", { categorias: categorias });
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao listar categorias");
        res.redirect("/admin");
      });
  });

  // http://localhost:8081/admin/categorias/addcategorias
  router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias");
  });

  // http://localhost:8081/admin/categorias/:nova
  router.post("/categorias/nova", eAdmin, (req, res) => {
    // Validação do formulário
    var erros = [];
    if (
      (!req.body.nome && typeof req.body.nome == undefined) ||
      req.body.nome == null
    ) {
      erros.push({ texto: "Nome inválido" });
    }
    if (
      (!req.body.slug && typeof req.body.slug == undefined) ||
      req.body.slug == null
    ) {
      erros.push({ texto: "Slug inválido" });
    }
    if (req.body.nome.length < 2) {
      erros.push({ texto: "Nome da categoria é muito pequeno" });
    }
    if (erros.length > 0) {
      res.render("admin/addcategorias", { erros: erros });
    } else {
      // Dados do formulário
      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug,
      };
      // Salvar formulário
      new Categoria(novaCategoria)
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria criada com sucesso");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro ao salvar categoria, tente novamente"
          );
          res.redirect("/admin");
        });
    }
  });

  // Editar formulário
  // http://localhost:8081/admin/categorias/edit/:id
  router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id })
      .lean()
      .then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria });
      })
      .catch((err) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
      });
  });

  // Edição do formulário
  // http://localhost:8081/admin/categorias/edit/:id
  router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id })
      .then((categoria) => {
        // Pegar os campos e atribuir os valores que estão vindo do formulário de edição
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        // Salvar edição
        categoria
          .save()
          .then(() => {
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a categoria");
            res.redirect("/admin/categorias");
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
      });
  });

  // Excluir categoria
  // http://localhost:8081/admin/categorias/deletar
  router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id })
      .then(() => {
        req.flash("success_msg", "Categoria excluida com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao excluir a categoria");
        res.redirect("/admin/categorias");
      });
  });

  // Tela de postagens
  // http://localhost:8081/admin/postagens
  router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find()
      .lean()
      .populate("categoria")
      .sort({ data: "desc" })
      .then((postagens) => {
        res.render("admin/postagens", { postagens: postagens });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
      });
  });

  // Adicionar postagem
  // http://localhost:8081/admin/postagens/add
  router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find()
      .lean()
      .then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin");
      });
  });

  // Salvar nova postagem
  // http://localhost:8081/admin/postagens/nova/:id
  router.post("/postagens/nova", eAdmin, (req, res) => {
    // Validação
    var erros = [];
    if (req.body.categoria == "0") {
      erros.push({ text: "Categoria inválida, registre uma categoria" });
    }
    if (erros.length > 0) {
      res.render("/admin/addpostagem", { erros: erros });
    } else {
      // Dados do formulário
      const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug,
      };

      // Salvar formulário
      new Postagem(novaPostagem)
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem criada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro durante o salvamento da postagem"
          );
          res.redirect("/admin/postagens");
        });
    }
  });

  // Editar postagens
  // http://localhost:8081/admin/postagens/edit/:id
  router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id })
      .lean()
      .then((postagem) => {
        Categoria.find()
          .lean()
          .then((categorias) => {
            res.render("admin/editpostagens", {
              categorias: categorias,
              postagem: postagem,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens");
          });
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro ao carregar o formulário de edição"
        );
        res.redirect("/admin/postagens");
      });
  });

  // Atualizar os dados da postagem
  // http://localhost:8081/admin/postagens/edit
  router.post("/postagens/edit", eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.body.id })
      .then((postagem) => {
        // Dados do formulário
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        // Salvar formulário
        postagem
          .save()
          .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/postagens");
          })
          .catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect("/admin/postagens");
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        res.redirect("/admin/postagens");
      });
  });

  // Deletar postagem
  router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.remove({ _id: req.params.id })
      .then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/admin/postagens");
      });
  });

// Exportar a constante router
module.exports = router;
