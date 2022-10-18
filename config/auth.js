// Carregar modulo de autenticação
const localStrategy = require("passport-local").Strategy;
// Carregar modulo do banco de dados
const mongoose = require("mongoose");
// Carregar modulo de criptografia
const bcrypt = require("bcryptjs");

// Model do usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function (passport) {
  // Autenticar via email
  passport.use(
    new localStrategy(
      // Campos que serão analisados
      { usernameField: "email", passwordField: "senha" },
      (email, senha, done) => {
        Usuario.findOne({ email: email }).lean().then((usuario) => {
          // Se a conta não existir
          if (!usuario) {
            return done(null, false, { message: "Esta conta não existe" });
          }
          // Se a conta existir, compara se as senhas criptografadas batem
          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              return done(null, usuario);
            } else {
              return done(null, false, { message: "Senha incorreta" });
            }
          });
        });
      }
    )
  );

  // Salva os dados do usuário na sessão
  passport.serializeUser((usuario, done) => {
    // Passa os dados do usuário para uma sessão
    done(null, usuario);
  });

  // Salva os dados do usuário na sessão
  passport.deserializeUser((id, done) => {
    // Procurar um usuário pelo o id
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario);
    });
  });
};
