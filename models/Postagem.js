const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Cadastrar postagens no MongoDB
const postagem = new Schema({
  titulo: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  conteudo: {
    type: String,
    required: true,
  },
  // Chamar model categorias
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    required: true,
  },
  data: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("postagens", postagem)