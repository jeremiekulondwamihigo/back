const modelClasse = require('../Models/Classe')
const modelCours = require('../Models/Cours')
const ModelAgent = require('../Models/Model_Agent')
const modelEleve = require('../Models/EleveInscrit')
const { isEmpty } = require('../Fonctions/Static_Function')
const modelCotation = require('../Models/Cotation')
const asyncLab = require('async')

module.exports = {
  Cotation: (req, res) => {
    try {
      const {} = req.body
    } catch (error) {
      console.log(error)
    }
  },
}
