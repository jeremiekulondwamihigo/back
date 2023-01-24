const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  agent_save: { type: String, required: true },
  nom: { type: String, required: true },
  postnom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: String, required: false, default: '' },
  nationalite: { type: String, required: false, default: '' },
  matricule: { type: String, required: false, default: '' },
  telephone: { type: String, required: true, unique: true },
  filename: { type: String, required: false },
  code_agent: { type: String, required: true, unique: true },
  etat: { type: String, required: false, default: '' },
  id: { type: String, required: true },
  fonction: { type: String, required: true },
  genre: { type: String, required: true },
  codeDomaine: { type: String, required: true, ref: 'DomaineAgent' },
  active: { type: Boolean, required: true, default: true },
  cours: { type: Array, required: false },
})

const User = mongoose.model('Agent', UserSchema)
module.exports = User
