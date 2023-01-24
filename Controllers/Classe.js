const ModelClasse = require('../Models/Classe')
const { generateNumber, isEmpty } = require('../Fonctions/Static_Function')
const asyncLab = require('async')

module.exports = {
  AddClasse: (req, res) => {
    try {
      const { niveau, code_Option, resultat, effectif } = req.body
      const codeClasse = generateNumber(5)
      if (
        isEmpty(niveau) ||
        isEmpty(code_Option) ||
        isEmpty(resultat) ||
        isEmpty(effectif)
      ) {
        return res.status(200).json({
          message: 'Veuillez remplir les champs',
          error: true,
        })
      }

      asyncLab.waterfall(
        [
          function (done) {
            ModelClasse.findOne({
              niveau: niveau,
              code_Option: code_Option,
            }).then((classeFound) => {
              done(null, classeFound)
            })
          },
          function (classeFound, done) {
            if (classeFound) {
              ModelClasse.findOneAndUpdate(
                {
                  _id: classeFound._id,
                },
                {
                  $set: {
                    resultat,
                    effectif,
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
            } else {
              ModelClasse.create({
                niveau,
                code_Option,
                resultat,
                effectif,
                codeClasse,
              }).then((classeCreate) => {
                done(classeCreate)
              })
            }
          },
        ],
        function (resultat) {
          if (resultat) {
            return res.status(200).json({
              message: 'Opération effectuée',
              error: false,
            })
          } else {
            return res.status(200).json({
              message: "Erreur d'enregistrement",
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
  ReadClasse: async (req, res) => {
    const { code_Option, niveau } = req.params
    ModelClasse.findOne({
      code_Option,
      niveau,
    })
      .then((response) => {
        return res.send(response)
      })
      .catch(function (error) {
        console.log(error)
      })
  },
}
