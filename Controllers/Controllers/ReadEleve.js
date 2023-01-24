const ModelEleve = require('../../Models/Eleves')
const ModelEleveInscrit = require('../../Models/EleveInscrit')
const ModelTuteur = require('../../Models/Tuteur')
const asyncLab = require('async')
const ModelInformation = require('../../Models/InforInscription')

module.exports = {
  ReadInformationEleve: (req, res) => {
    const { id } = req.params

    let lookEtablissement = {
      $lookup: {
        from: 'etablissements',
        localField: 'codeEtablissement',
        foreignField: 'codeEtablissement',
        as: 'etablissement',
      },
    }
    let lookClasse = {
      $lookup: {
        from: 'classes',
        localField: 'codeClasse',
        foreignField: 'codeClasse',
        as: 'classe',
      },
    }
    let lookAnnee = {
      $lookup: {
        from: 'annees',
        localField: 'code_Annee',
        foreignField: 'code_Annee',
        as: 'annee',
      },
    }
    let lookIdConcerner = {
      $lookup: {
        from: 'eleveinscrits',
        localField: 'idConcerner',
        foreignField: '_id',
        as: 'IdConcerner',
      },
    }

    asyncLab.waterfall(
      [
        function (done) {
          ModelEleve.findById(id).then((eleve) => {
            if (eleve) {
              done(null, eleve)
            } else {
              res.status(200).json([])
            }
          })
        },
        function (eleve, done) {
          const match = { $match: { code_eleve: eleve.code_eleve } }
          ModelEleveInscrit.aggregate([
            match,
            lookEtablissement,
            lookClasse,
            lookAnnee,
          ]).then((inscription) => {
            if (inscription) {
              done(null, eleve, inscription)
            } else {
              res.status(200).json([])
            }
          })
        },
        function (eleve, inscription, done) {
          ModelTuteur.findOne({
            codeTuteur: eleve.codeTuteur,
          }).then((tuteur) => {
            if (tuteur) {
              done(null, eleve, inscription, tuteur)
            } else {
              done(null, eleve, inscription, [])
            }
          })
        },
        function (eleve, inscription, tuteur, done) {
          let matchOne = { $match: { code_eleve: eleve.code_eleve } }
          ModelInformation.aggregate([
            matchOne,
            lookEtablissement,
            lookAnnee,
          ]).then((information) => {
            if (information) {
              done(eleve, inscription, tuteur, information)
            } else {
              done(eleve, inscription, tuteur, [])
            }
          })
        },
      ],
      function (eleve, inscription, tuteur, information) {
        return res.status(200).json({
          eleve,
          inscription,
          tuteur,
          information: information.reverse(),
        })
      },
    )
  },
}
