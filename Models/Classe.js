const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  niveau: {
    type: Number,
    min: 1,
    max: 8,
    required: true,
  },
  code_Option: { type: String, required: true },
  resultat: { type: Number, required: true, default: 0 },
  effectif: { type: Number, required: true },
  codeClasse: { type: String, required: true, unique: true },
})
const model = mongoose.model('Classe', schema)
module.exports = model
