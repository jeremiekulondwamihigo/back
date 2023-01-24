const Model_Year = require('../Models/Model_Annee')
const { isEmpty, generateString } = require('../Fonctions/Static_Function')
const AsyncLib = require('async')
const Model_Secteur = require('../Models/ModelProvince')
const Model_Eleve = require('../Models/EleveInscrit')

module.exports = {
  Add_Annee: (req, res) => {
    const { annee, id } = req.body

    try {
      if (isEmpty(annee)) {
        return res
          .status(200)
          .json({ message: 'Veuillez remplir le champs', error: true })
      }
      let year = annee.trim()
      AsyncLib.waterfall(
        [
          function (done) {
            Model_Year.findOne({ annee: year }).then((response) => {
              if (response) {
                return res.status(200).json({
                  message: "L'année " + year + ' existe déjà',
                  error: true,
                })
              } else {
                done(null, response)
              }
            })
          },
          function (response, done) {
            Model_Year.create({
              annee,
              code_Annee: generateString(5),
              id,
            }).then((anneeCreate) => {
              done(anneeCreate)
            })
          },
        ],
        function (anneeCreate) {
          if (anneeCreate) {
            return res.status(200).json({
              message: 'Année ' + year + ' enregistrée',
              error: false,
            })
          } else {
            return res
              .status(200)
              .json({ message: "Erreur d'enregistrement", error: true })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  Modificate_Year: (req, res) => {
    const { id, valeur } = req.body
    try {
      AsyncLib.waterfall(
        [
          function (done) {
            if (JSON.parse(valeur)) {
              Model_Year.findOne({ active: true }).then((anneActifFound) => {
                if (anneActifFound) {
                  return res.status(200).json({
                    message:
                      "L'année " + anneActifFound.annee + ' est en cours',
                    error: true,
                  })
                } else {
                  done(null, true)
                }
              })
            } else {
              done(null, false)
            }
          },
          function (anneeCreate, done) {
            Model_Year.findOneAndUpdate(
              {
                _id: id,
              },
              {
                $set: {
                  active: anneeCreate,
                },
              },
              null,
              (error, result) => {
                if (error) throw error
                else {
                  done(result)
                }
              },
            )
          },
        ],
        function (result) {
          if (result) {
            return res
              .status(200)
              .json({ message: 'Opération effectuée', error: 'success' })
          } else {
            return res
              .status(200)
              .json({ message: "Erreur d'enregistrement", error: true })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  Read_Year: (req, res) => {
    Model_Year.find({}).then((anneeFound) => {
      const annee = Array.from(anneeFound).find((a) => a.active)
      return res.status(200).json({ all_year: anneeFound, year_actif: annee })
    })
  },

  Year_Use: (req, res) => {
    AsyncLib.waterfall(
      [
        function (done) {
          Model_Year.findOne({ active: true }).then((response) => {
            if (response) {
              done(null, response)
            }
          })
        },
        function (response, done) {
          Model_Secteur.find({ code_Annee: response.code_Annee }).then(
            (secteur) => {
              if (secteur) {
                done(secteur)
              }
            },
          )
        },
      ],
      function (result) {
        return res.status(200).json(result)
      },
    )
  },
  DeleteYear: (req, res) => {
    const { code } = req.params

    AsyncLib.waterfall(
      [
        function (done) {
          Model_Eleve.find({ code_Annee: code }).then(function (eleve) {
            if (!isEmpty(eleve)) {
              return res
                .status(200)
                .json({
                  error: true,
                  message: 'Impossible de supprimer cette année',
                })
            } else {
              done(null, eleve)
            }
          })
        },
        function (eleve, done) {
          Model_Year.remove({ code_Annee: code, active: false })
            .exec()
            .then((response) => {
              if (response) {
                done(response)
              }
            })
        },
      ],
      function (response) {
        if (response) {
          return res
            .status(200)
            .json({ error: false, message: 'Opération effectuée' })
        } else {
          return res
            .status(200)
            .json({ error: true, message: 'Erreur de suppression' })
        }
      },
    )
  },
}
