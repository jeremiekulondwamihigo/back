const mongoose = require('mongoose')

const model = new mongoose.Schema({
  id: { type: String, required: true },
  option: { type: String, required: true },
  code_Option: { type: String, required: true },
  code_Section: { type: String, required: true, ref: 'Section' },
  max: { type: Number, required: true, default: 0 },
})
const valeur = mongoose.model('Option', model)
module.exports = valeur
