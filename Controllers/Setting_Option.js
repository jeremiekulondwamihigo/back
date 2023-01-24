const model_Option = require('../Models/Model_Option')
const { isEmpty, generateString } = require('../Fonctions/Static_Function')
const AsyncLib = require('async')
const Model_Etablissement = require('../Models/Model_Etablissement')
const ModelEleveInscrit = require('../Models/EleveInscrit')

module.exports = {
  Add_Option: (req, res) => {
    const { option, code_Section, id, max } = req.body
    try {
      if (isEmpty(option) || isEmpty(code_Section) || isNaN(max)) {
        return res.status(200).json({
          message: 'Veuillez renseigner les champs',
          error: 'error',
        })
      }
      const valeur_id = generateString(7)
      const optionTrim = option.trim()

      AsyncLib.waterfall(
        [
          function (done) {
            model_Option
              .findOne({
                option: optionTrim,
              })
              .then((optionFound) => {
                if (optionFound) {
                  return res.status(200).json({
                    message:
                      "L'option <<<" + optionFound.option + '>>> existe déjà',
                    error: 'error',
                  })
                } else {
                  done(null, optionFound)
                }
              })
          },
          function (optionFound, done) {
            model_Option
              .findOne({ code_Option: valeur_id })
              .then((optionCodeFound) => {
                if (optionCodeFound) {
                  return res.status(200).json({
                    message: "Veuillez relancer l'enregistrement",
                    error: 'info',
                  })
                } else {
                  model_Option
                    .create({
                      id,
                      option: optionTrim,
                      code_Option: valeur_id,
                      code_Section,
                      max,
                    })
                    .then((response) => {
                      done(response)
                    })
                }
              })
          },
        ],
        function (response) {
          if (response) {
            return res.status(200).json({
              message: 'Enregistrement effectué',
              error: 'success',
            })
          } else {
            return res.status(200).json({
              message: "Erreur d'enregistrement",
              error: 'error',
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  Modification_Option: (request, response) => {
    try {
      const { _id, option_modification, max } = request.body
      if (isEmpty(option_modification) || isEmpty(_id)) {
        return response.status(200).json({
          message: 'Erreur de modification',
          error: 'error',
        })
      }
      AsyncLib.waterfall(
        [
          function (done) {
            model_Option.findOneAndUpdate(
              {
                _id: _id,
              },
              {
                $set: {
                  option: option_modification,
                  max,
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
            return response.status(200).json({
              message: 'Opération effectuée',
              error: 'success',
            })
          } else {
            return response.status(200).json({
              message: "Erreur d'enregistrement",
              error: 'error',
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  read_Option: (req, res) => {
    try {
      model_Option.find({}).then((response) => {
        return res.send(response.reverse())
      })
    } catch (error) {
      console.log(error)
    }
  },
  deleteOption: (req, res) => {
    const { code_Option } = req.params
    AsyncLib.waterfall(
      [
        function (done) {
          ModelEleveInscrit.find({ code_Option }).then((eleve) => {
            if (!isEmpty(eleve)) {
              return res.status(201).json({
                message: "Impossible d'effectuer cette opération",
                error: 'error',
              })
            } else {
              done(null, true)
            }
          })
        },
        function (eleve, done) {
          model_Option
            .remove({ code_Option: code_Option })
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
          return res.status(200).json({
            message: 'Operation effectuée',
            error: 'success',
          })
        } else {
          return res.status(400).json({
            message: 'Erreur de suppression',
            error: 'error',
          })
        }
      },
    )
  },
}
