const Domaine_Agent = require('../Models/DomaineAgent')
const { isEmpty, generateString } = require('../Fonctions/Static_Function')
const asyncLab = require('async')

module.exports = {
  DomaineAgent: async (req, res) => {
    try {
      const { domaine, id } = req.body

      if (isEmpty(domaine)) {
        return res.status(200).json({
          message: 'Veuillez renseigner le champs',
          error: true,
        })
      }
      const dom = domaine.toUpperCase()
      const code = generateString(8)

      asyncLab.waterfall(
        [
          function (done) {
            Domaine_Agent.findOne({
              title: dom,
            })
              .then((domaineFound) => {
                if (domaineFound) {
                  return res.status(200).json({
                    message: 'ce domaine existe déjà',
                    error: true,
                  })
                } else {
                  done(null, true)
                }
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
          function (domaineFound, done) {
            Domaine_Agent.findOne({
              codeDomaine: code,
            }).then((codeFound) => {
              if (codeFound) {
                return res.status(200).json({
                  message: "Veuillez relancer l'enregistrement",
                  error: true,
                })
              } else {
                done(null, true)
              }
            })
          },
          function (domaineFound, done) {
            Domaine_Agent.create({ title: dom, id, codeDomaine: code })
              .then((domaineCreer) => {
                done(domaineCreer)
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
        ],
        function (domaineCreer) {
          if (domaineCreer) {
            return res.status(200).json({
              message: 'Enregistrement effectuer',
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
        message: error,
        error: true,
      })
    }
  },
}
