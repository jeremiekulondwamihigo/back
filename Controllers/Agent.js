const Model_Agent = require('../Models/Model_Agent')
const asyncLib = require('async')
const {
  isEmpty,
  generateNumber,
  generateString,
} = require('../Fonctions/Static_Function')
const ErrorResponse = require('../utils/errorResponse')
const Model_User = require('../Models/Users')
const Model_DomaineAgent = require('../Models/DomaineAgent')
const fs = require('fs')
const sharp = require('sharp')
// initialeValue
module.exports = {
  Agent: (req, res, next) => {
    try {
      const {
        nom,
        postnom,
        prenom,
        dateNaissance,
        nationalite,
        matricule,
        telephone,
      } = req.body.initialeValue
      const { fonction, genre, codeDomaine, agent_save, id } = req.body
      // const { filename } = req.file

      if (
        isEmpty(agent_save) ||
        isEmpty(nom) ||
        isEmpty(postnom) ||
        isEmpty(prenom) ||
        isEmpty(telephone) ||
        isEmpty(fonction) ||
        isEmpty(codeDomaine)
      ) {
        return res.status(200).json({
          message: 'Veuillez renseigner le champs',
          error: true,
        })
      }

      const nomAgent = nom.toUpperCase()
      const postnomAgent = postnom.toUpperCase()
      const prenomAgent = prenom.toUpperCase()

      const code = generateNumber(6)
      const password = generateString(6)

      asyncLib.waterfall(
        [
          function (done) {
            Model_Agent.findOne({
              code_agent: code,
            })
              .then((response) => {
                if (response) {
                  return res.status(200).json({
                    message: "Veuillez relancer l'enregistrement",
                    error: true,
                  })
                } else {
                  done(null, true)
                }
              })
              .catch(function (error) {
                console.log(error)
              })
          },
          function (agent, done) {
            Model_Agent.create({
              agent_save,
              nom: nomAgent,
              postnom: postnomAgent,
              prenom: prenomAgent,
              dateNaissance,
              nationalite,
              matricule,
              telephone,
              //filename,
              code_agent: code,

              genre,
              fonction,
              id,
              codeDomaine,
            })
              .then((agentSave) => {
                if (agentSave) {
                  done(null, agentSave)
                }
              })
              .catch(function (error) {
                return res.status(200).json({
                  message: 'Catch : ' + error,
                  error: true,
                })
              })
          },
          function (agentSave, done) {
            Model_User.create({
              username: agentSave.telephone,
              password: password,
              _id: agentSave._id,
              fonction: 'enseignant',
            })
              .then((usercreate) => {
                done(usercreate)
              })
              .catch(function (error) {
                return res.status(200).json({
                  message: 'Catch : ' + error,
                  error: true,
                })
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json({
              message:
                'username : ' + result.username + ' password : ' + password,
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
      return next(new ErrorResponse('' + error, 200))
    }
  },
  Read_Agent: (req, res) => {
    var lookDomaine = {
      $lookup: {
        from: 'domaineagents',
        localField: 'codeDomaine',
        foreignField: 'codeDomaine',
        as: 'domaine',
      },
    }

    Model_Agent.aggregate([lookDomaine])
      .then((response) => {
        return res.status(200).json(response.reverse())
      })
      .catch(function (error) {
        console.log(error)
      })
  },

  Modification_Agent: (req, res) => {
    const { id, data } = req.body

    Model_Agent.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: data,
      },
      null,
      (error, result) => {
        if (error) {
          res.status(200).json({
            message: 'errer:' + error,
            error: true,
          })
        }
        if (result) {
          return res.status(200).json({
            message: 'Modification effectuée',
            error: false,
          })
        }
      },
    )
  },
}
