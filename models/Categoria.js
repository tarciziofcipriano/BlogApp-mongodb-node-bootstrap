const mongoose = require("mongoose")
const schema = mongoose.Schema;

// Cadastrar categoria no MongoDB
const categoria = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("categorias", categoria)