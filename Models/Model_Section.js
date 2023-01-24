const mongoose = require('mongoose')

const model = new mongoose.Schema({
  id: { type: String, required: true, default: new Date() },
  section: { type: String, required: true },
  code_Section: { type: String, required: true },
})
const valeur = mongoose.model('Section', model)
module.exports = valeur
