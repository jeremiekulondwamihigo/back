const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  idConcerner: { type: mongoose.Types.ObjectId, required: true },
  codeEtablissement: { type: String, required: true },
  id: { type: Date, required: true },
  code_Annee: { type: String, required: true },
  code_eleve: { type: String, required: true },
})

const model = mongoose.model('InfoInscription', schema)
module.exports = model

schema.post('init', function (init, next) {
  console.log(init)
  next()
})
