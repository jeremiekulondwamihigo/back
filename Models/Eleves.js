const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  code_eleve: {
    type: String,
    required: true,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  postNom: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  prenom: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  codeTuteur: {
    type: String,
    required: false,
    default: '',
  },
  date_Naissance: {
    type: String,
    required: false,
    default: '',
  },
  lieu_naissance: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
  genre: {
    type: String,
    required: true,
    enum: ['M', 'F'],
  },
  filename: {
    type: String,
    required: false,
    default: '',
  },
  libre: {
    type: Boolean,
    required: true,
    default: true,
    //Quand il sera enregistrer dans une établissement cette valeur prendra la valeur false
  },
  codeEtablissement: {
    type: String,
    required: true,
  }, //Code de l'établissement effectuant l'enregistrement
  codeInscription: {
    type: String,
    required: true,
    //Ce code est générer automatiquement pour chaque cloture de l'année, Ce code permettra d'inscrire l'élève
  },
  nationalite: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  nomPere: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
  professionPere: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
  nomMere: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
  professionMere: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
  },
})

const model = mongoose.model('Eleve', schema)
module.exports = model
