const ModelEtablissement = require('../Models/Model_Etablissement')
const asyncLab = require('async')
const { isEmpty } = require('../Fonctions/Static_Function')
const ModelEleveInscrits = require('../Models/EleveInscrit')
const ModelAnnee = require('../Models/Model_Annee')

module.exports = {
  AffectationOption: (req, res) => {
    try {
      const { id, codeOption, action } = req.body

      if (isEmpty(id) || isEmpty(codeOption)) {
        return res.status(200).json({
          message: "Erreur d'affectation",
          error: true,
        })
      }
      asyncLab.waterfall(
        [
          function (done) {
            ModelEtablissement.findOne({
              codeEtablissement: id,
            })
              .then((ecoleFound) => {
                if (ecoleFound) {
                  done(null, ecoleFound)
                } else {
                  return res.status(200).json({
                    message: 'Ecole introuvable',
                    error: true,
                  })
                }
              })
              .catch(function (error) {
                return res.status(200).json({
                  message: 'Une erreur est survenue',
                  error: true,
                })
              })
          },
          function (ecoleFound, done) {
            if (action === 'add') {
              ModelEtablissement.updateOne(
                { _id: ecoleFound._id },
                { $addToSet: { code_option: codeOption } },
              )
                .then((optionUpdate) => {
                  if (optionUpdate) {
                    done(optionUpdate)
                  } else {
                    done(false)
                  }
                })
                .catch(function (error) {})
            }
            if (action === 'delete') {
              ModelEtablissement.updateOne(
                { _id: ecoleFound._id },
                { $pull: { code_option: codeOption } },
              ).then((optionUpdate) => {
                if (optionUpdate) {
                  done(optionUpdate)
                } else {
                  done(false)
                }
              })
            }
          },
        ],
        function (resultat) {
          if (resultat) {
            return res.status(200).json({
              message: 'Opération effectuée : ' + codeOption,
              error: false,
            })
          } else {
            return res.status(200).json({
              message: "Erreur d'affectation",
              error: true,
            })
          }
        },
      )
    } catch (error) {
      return res.status(200).json({
        message: 'Catch : ' + error,
        error: true,
      })
    }
  },
  AffichageOption: (req, res) => {
    const { id } = req.params

    var lookOption = {
      $lookup: {
        from: 'options',
        localField: 'code_option',
        foreignField: 'code_Option',
        as: 'Option',
      },
    }
    var match = { $match: { codeEtablissement: id } }
    var project = { $project: { Option: 1 } }
    try {
      ModelEtablissement.aggregate([match, lookOption, project]).then((r) => {
        if (r.length > 0) {
          return res.send(r[0].Option)
        } else {
          return []
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  effectifInscrit: (req, res) => {
    const { etablissement } = req.params

    let Annee = {
      $lookup: {
        from: 'annees',
        localField: '_id',
        foreignField: 'code_Annee',
        as: 'annee',
      },
    }

    var mat = { $match: { codeEtablissement: etablissement } }
    var donner = { $unwind: '$code_Annee' }
    var count = { $group: { _id: '$code_Annee', count: { $sum: 1 } } }
    var project = {
      $project: {
        count: 1,
        'annee.annee': 1,
        annees: 1,
      },
    }

    try {
      ModelEleveInscrits.aggregate([mat, donner, count, Annee, project]).then(
        (response) => {
          if (response) {
            let elementAnnee = {
              annee: [],
              effectif: [],
            }

            for (let i = 0; i < response.length; i++) {
              elementAnnee.annee.push(response[i].annee[0].annee)
              elementAnnee.effectif.push(response[i].count)
            }
            res.send(elementAnnee)
          }
        },
      )
    } catch (error) {}
  },
  EffectifChaqueOption: (req, res) => {
    const { codeEtablissement } = req.params
    try {
      asyncLab.waterfall([
        function (done) {
          ModelEtablissement.findOne({ codeEtablissement })
            .then((etablissement) => {
              if (isEmpty(etablissement)) {
                return res
                  .status(200)
                  .json({ message: 'Ecole introuvable', error: true })
              } else {
                done(null, etablissement)
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (etablissement, done) {
          ModelAnnee.findOne({ active: true })
            .then((anneeFound) => {
              if (!isEmpty(anneeFound)) {
                done(null, etablissement, anneeFound)
              }
            })
            .catch(function (err) {
              console.log(err)
            })
        },
        function (etablissement, anneeFound, done) {
          let lookClasse = {
            $lookup: {
              from: 'classes',
              localField: 'codeClasse',
              foreignField: 'codeClasse',
              as: 'Classe',
            },
          }
          let addField = {
            $addFields: {
              option: '$Classe.code_Option',
            },
          }
          let lookOption = {
            $lookup: {
              from: 'options',
              localField: '_id',
              foreignField: 'code_Option',
              as: 'option',
            },
          }

          let match = {
            $match: { codeEtablissement, code_Annee: anneeFound.code_Annee },
          }
          let groupPush = {
            $group: {
              _id: '$Classe.code_Option',
              eleve: { $push: '$code_eleve' },
            },
          }
          ModelEleveInscrits.aggregate([
            match,
            lookClasse,
            addField,
            groupPush,
            lookOption,
          ]).then((response) => {
            let data = []
            for (let i = 0; i < response.length; i++) {
              data.push({
                title:
                  response[i].option.length < 1
                    ? response[i]._id[0]
                    : response[i].option[0].option,
                nombre: response[i].eleve.length,
              })
            }

            res.send(data)
          })
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  DeleteOptionEtablissement: (req, res) => {
    try {
    } catch (error) {}
  },
}
