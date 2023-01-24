const modelCours = require('../Models/Cours')
const { isEmpty } = require('../Fonctions/Static_Function')
const { response } = require('express')

module.exports = {
  Cours: (req, res) => {
    try {
      const { branche, maxima } = req.body.valeur
      const { classe, id, validExamen, identifiant, code_Option } = req.body

      const date = new Date(id).getTime()
      if (
        isEmpty(branche) ||
        isEmpty(maxima) ||
        isEmpty(classe) ||
        isEmpty(date) ||
        isEmpty(code_Option)
      ) {
        return res.status(200).json({
          message: 'Veuillez remplir les champs',
          error: true,
        })
      }

      modelCours
        .findOne({
          branche: branche,
          classe: classe,
          code_Option,
        })
        .then((BrancheFound) => {
          if (BrancheFound) {
            return res.status(200).json({
              message: 'Ce cours existe déjà',
              error: true,
            })
          }
          if (!BrancheFound) {
            modelCours
              .create({
                branche,
                maxima,
                classe,
                id,
                code_Option,
                idCours: date,
                validExamen,
                identifiant,
              })
              .then((Save) => {
                if (Save) {
                  return res.status(200).json({
                    message: 'Enregistrement effectuer ' + branche,
                    error: false,
                  })
                } else {
                  return res.status(200).json({
                    message: "Erreur d'enregistrement",
                    error: true,
                  })
                }
              })
              .catch(function (error) {
                return res.status(200).json({
                  message: 'error : ' + error,
                  error: true,
                })
              })
          }
        })
        .catch(function (error) {
          return res.status(200).json({
            message: 'error : ' + error,
            error: true,
          })
        })
    } catch (error) {
      return res.status(200).json({
        message: 'error : ' + error,
        error: true,
      })
    }
  },

  ModifierCours: (req, res) => {
    const { valeur, validExamen, id } = req.body

    const { branche, maxima } = valeur
    if (isEmpty(branche) || isEmpty(maxima)) {
      return res.status(200).json({
        message: 'Veuillez remplir les champs',
        error: true,
      })
    }

    modelCours
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            branche,
            maxima,
            validExamen,
          },
        },
        null,
        (error, result) => {
          if (error) throw error
          if (result) {
            return res.status(200).json({
              message: 'Modification effectuée',
              error: false,
            })
          }
        },
      )
      .catch(function (error) {
        return res.status(200).json({
          message: 'Catch : ' + error,
          error: true,
        })
      })
  },
  ReadCoursSimple: (req, res) => {
    const { classe, code_Option } = req.params
    modelCours
      .find({ classe: parseInt(classe), code_Option })
      .then((response) => {
        if (response) {
          return res.status(200).json(response.reverse())
        }
      })
      .finally(() => {
        req.params = null
      })
  },
}
