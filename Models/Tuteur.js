const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  codeTuteur: {
    type: String,
    required: true,
    unique: true,
  },
  telephone: {
    type: String,
    required: true,
    unique: true,
  },
  fonction: {
    type: String,
    required: false,
  }, //Le travail du tuteur
})
schema.pre('save', function (next) {
  const name = this.nom
  const second = name.toUpperCase().trim()
  this.nom = second
  next()
})
const model = mongoose.model('Tuteur', schema)
module.exports = model
