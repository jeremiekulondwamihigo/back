const mongoose = require('mongoose')

const schemaCours = new mongoose.Schema({
  id: { type: String, required: true },
  branche: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  maxima: {
    type: Number,
    required: true,
    min: 10,
    trim: true,
  },
  classe: {
    type: Number,
    required: true,
  },
  code_Option: { type: String, required: true }, //Option ou title = Education de base
  idCours: { type: String, required: true, unique: true },
  validExamen: {
    type: Boolean,
    required: true,
    default: true,
    enum: [true, false],
  },
  identifiant: { type: String, required: false, default: undefined }, //code domaine ou sous-domaine si option = education de base
})
let valeur = mongoose.model('Cours', schemaCours)
module.exports = valeur
