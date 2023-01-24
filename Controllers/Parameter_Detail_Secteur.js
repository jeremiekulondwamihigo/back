const Model_Annee = require('../Models/Model_Annee')
const asyncLab = require('async')
const { isEmpty } = require('../Fonctions/Static_Function')
const ModelProvince = require('../Models/ModelProvince')

module.exports = {
  Add_Periode_Province: (req, res) => {
    try {
      const { code_secteur, code_Annee, id } = req.body

      if (isEmpty(code_secteur) || isEmpty(code_Annee) || isEmpty(id)) {
        return res.status(200).json({
          message: 'Veuillez remplir le champs',
          error: true,
        })
      }

      asyncLab.waterfall(
        [
          function (done) {
            Model_Annee.findOne({
              code_Annee,
            }).then((response) => {
              if (response) {
                done(null, response)
              } else {
                return res.status(200).json({
                  message: "L'année n'existe pas",
                  error: true,
                })
              }
            })
          },
          function (response, done) {
            ModelProvince.findOne({
              code_secteur,
            }).then((secteurFound) => {
              if (secteurFound) {
                ModelProvince.findOneAndUpdate(
                  {
                    code_secteur,
                  },
                  {
                    $set: {
                      code_Annee: response.code_Annee,
                    },
                  },
                  null,
                  (error, result) => {
                    if (error) throw error
                    if (result) {
                      done(true)
                    }
                  },
                )
              }
            })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json({
              message: 'Affectation effectuée',
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
      console.log(error)
    }
  },
}
