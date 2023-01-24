const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  etablissement: {
    type: String,
    required: true,
  },
  code_province: {
    type: String,
    required: true,
  },
  code_agent: {
    type: String,
    required: true,
  },
  codeEtablissement: {
    type: String,
    required: true,
    minlength: 7,
    unique: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
    enum: [true, false],
  },

  code_option: { type: Array, required: false, default: [] },
  code_enseignant: { type: Array, required: false, default: [] },
})

const model = mongoose.model('Etablissement', schema)
module.exports = model
