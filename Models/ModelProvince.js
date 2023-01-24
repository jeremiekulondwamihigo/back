const mongoose = require('mongoose')

const province = new mongoose.Schema({
  code_province: { type: String, required: true, unique: true }, //Ici c'est pour toute les fonctions
  code_agent: { type: String, required: true }, //Agent titulaire
  denomination: { type: String, required: true, unique: true }, // Dénomination de l'entité

  id: { type: String, required: true, unique: true },
  code_Annee: { type: String, required: false, default: '' },
})

const model = mongoose.model('Province', province)
module.exports = model
