const mongoose = require('mongoose')
const ModelInfo = require('./Eleves')
const {
  generateNumber,
  generateString,
} = require('../Fonctions/Static_Function')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  code_eleve: {
    type: String,
    required: true,
  },
  codeEtablissement: {
    type: String,
    required: true,
    ref: 'Etablissements',
  },
  code_Annee: {
    type: String,
    required: true,
  },
  codeClasse: {
    type: String,
    required: true,
    //C'est recommander si le niveau de l'élève est inferieur à 5
    ref: 'classes',
  },
  resultat: {
    type: Number,
    required: true,
    default: 0,
  },
  codeInscription: {
    type: String,
    required: true,
  },
  cotation: {
    type: mongoose.Types.ObjectId,
    ref: 'Cotation',
  },
})

schema.post('updateOne', function (doc, next) {
  console.log(doc)
})

schema.post('save', function (docs, next) {
  ModelInfo.updateOne(
    {
      code_eleve: docs.code_eleve,
    },
    {
      $set: {
        libre: false,
        codeInscription: `${generateString(2)}${generateNumber(
          3,
        )}${generateString(2)}`,
      },
    },
  )
  next()
})

const model = mongoose.model('EleveInscrit', schema)
module.exports = model
