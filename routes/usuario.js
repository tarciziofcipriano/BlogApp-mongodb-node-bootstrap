const express = require("express");
// Recebe o express no router
const router = express.Router();
// Carregando o MongoDB
const mongoose = require("mongoose");
// Carregar o model Usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
// Carregar módulo de criptografar as senhas
const bcrypt = require("bcryptjs");
// Carregar o model de autenticação
const passport = require("passport");

//Rotas
  router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
  });
  // Formulário de cadastrar usuário
  router.post("/registro", (req, res) => {
    // Validar todos os campos do formulário de cadastro
    var erros = [];
    if (
      !req.body.nome ||
      typeof req.body.nome == undefined ||
      req.body.nome == null
    ) {
      erros.push({ texto: "Nome inválido" });
    }
    if (
      !req.body.email ||
      typeof req.body.email == undefined ||
      req.body.email == null
    ) {
      erros.push({ texto: "Email inválido" });
    }
    if (
      !req.body.senha ||
      typeof req.body.senha == undefined ||
      req.body.senha == null
    ) {
      erros.push({ texto: "Senha inválida" });
    }
    if (req.body.senha.length < 4) {
      erros.push({ texto: "Senha muito curta" });
    }
    if (req.body.senha != req.body.senha2) {
      erros.push({ texto: "As senhas são diferentes, tente novamente" });
    }
    if (erros.length > 0) {
      res.render("usuarios/registro", { erros: erros });
    } else {
      Usuario.findOne({ email: req.body.email })
        .lean()
        .then((usuario) => {
          if (usuario) {
            req.flash(
              "error_msg",
              "Já existe uma conta com este e-mail no nosso sistema"
            );
            res.redirect("usuarios/registro");
          } else {
            // Formuário que o usuário cadastrar
            const novoUsuario = new Usuario({
              nome: req.body.nome,
              email: req.body.email,
              senha: req.body.senha,
            });

            //Encriptar senha
            bcrypt.genSalt(10, (erro, salt) => {
              bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                if (erro) {
                  req.flash(
                    "error_msg",
                    "Houve um erro durante o salvamento do usuário"
                  );
                  res.redirect("/");
                }

                // Pegando o atributo senha do novo usuário e falando que a senha do novo usuário vai ser igual o hash que foi gerado
                novoUsuario.senha = hash;

                // Salvando usuário
                novoUsuario
                  .save()
                  .then(() => {
                    req.flash("success_msg", "Usuário criado com sucesso");
                    res.redirect("/");
                  })
                  .catch((err) => {
                    req.flash(
                      "error_msg",
                      "Houve um erro ao criar o usuário, tente novamente"
                    );
                    res.redirect("/usuarios/registro");
                  });
              });
            });
          }
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro interno");
          res.redirect("/");
        });
    }
  });

  // Pagina inicial do Login
  router.get("/login", (req, res) => {
    res.render("usuarios/login");
  });

  // Rota de autenticação
  router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
      // Caminho que vai redirecionar caso a autenticação tenha acontecido com sucesso
      successRedirect: "/",
      // Caminho que vai redirecionar caso houver falha durante a autenticação
      failureRedirect: "/usuarios/login",
      failureFlash: true,
    })(req, res, next);
  });

  // Logout
  router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success_msg", "Deslogado com sucesso");
      res.redirect("/");
    });
  });

module.exports = router;
