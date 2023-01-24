const ModelProvince = require('../Models/ModelProvince')
const { isEmpty, generateString } = require('../Fonctions/Static_Function')
const asyncLab = require('async')
const ErrorResponse = require('../utils/errorResponse')
const Model_Agent = require('../Models/Model_Agent')
const Model_User = require('../Models/Users')

module.exports = {
  AddProvince: (req, res, next) => {
    try {
      if (
        isEmpty(req.body.valeur) ||
        isEmpty(req.body.valeur.code_province) ||
        isEmpty(req.body.valeur.code_agent) ||
        isEmpty(req.body.valeur.denomination)
      ) {
        return next(new ErrorResponse('Veuillez remplir les champs', 200))
      }
      const { code_province, code_agent, denomination } = req.body.valeur
      const { id } = req.body

      const nomSecteur = denomination.toUpperCase().trim()
      const username = `${generateString(5)}@gmail.com`
      const password = generateString(6)

      asyncLab.waterfall(
        [
          function (done) {
            Model_Agent.findOne({
              code_agent,
            })
              .then((AgentFound) => {
                if (AgentFound) {
                  done(null, AgentFound)
                } else {
                  return next(new ErrorResponse('Agent non identifier', 200))
                }
              })
              .catch(function (error) {
                return next(new ErrorResponse('Catch : ' + error, 200))
              })
          },
          function (agent, done) {
            ModelProvince.create({
              code_province,
              code_agent: agent.code_agent,
              denomination: nomSecteur,
              id,
            })
              .then((secteurCreate) => {
                if (secteurCreate) {
                  done(null, secteurCreate)
                } else {
                  done(false)
                }
              })
              .catch(function (error) {
                return next(new ErrorResponse('Catch : ' + error, 200))
              })
          },
          function (secteurCreate, done) {
            Model_User.create({
              username,
              password,
              _id: secteurCreate._id,
              fonction: 'province',
            })
              .then((usercreate) => {
                if (usercreate) {
                  done(null, usercreate)
                } else {
                  done(null, false)
                }
              })
              .catch(function (error) {
                return next(new ErrorResponse('Catch : ' + error, 200))
              })
          },
          function (usercreate, done) {
            //cette fonction permettra d'envoyer le message à l'agent concerner
            done(usercreate)
          },
        ],
        function (result) {
          if (result) {
            return next(
              new ErrorResponse(
                'username ' + result.username + ' password ' + password,
                200,
              ),
            )
          } else {
            return next(new ErrorResponse("Erreur d'enregistrement", 200))
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ResetIdentifiant: (req, res, next) => {
    try {
      const { id } = req.params
      const username = generating(5)
      const password = generating(5)

      asyncLab.waterfall(
        [
          function (done) {
            ModelProvince.findOne({
              _id: id,
            }).then((secteur_Found) => {
              if (secteur_Found) {
                done(null, secteur_Found)
              } else {
                return next(new ErrorResponse('Secteur non introuvable', 200))
              }
            })
          },
          function (secteur_Found, done) {
            Model_Agent.findOne({
              code_agent: secteur_Found.code_agent,
            }).then((Agent_Found) => {
              if (Agent_Found) {
                done(null, Agent_Found)
              } else {
                return next(new ErrorResponse('Agent introuvable', 200))
              }
            })
          },
          function (Agent_Found, done) {
            ModelProvince.findOneAndUpdate(
              {
                _id: id,
              },
              {
                $set: {
                  username: username,
                  password: password,
                },
              },
              null,
              (error, result) => {
                if (error) throw error
                if (result) {
                  done(null, result, Agent_Found)
                }
              },
            )
          },
          function (result, Agent_Found, done) {
            //Ici j'envoie le message de modification de l'utilisateur
            done(true)
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json({
              message: 'Modification effectuée',
              error: false,
            })
          } else {
            return next(new ErrorResponse('Erreur de modification', 200))
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  UpdateProvince: (req, res) => {
    const { id } = req.params
    const { data } = req.body
    try {
      ModelProvince.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: data,
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
    } catch (error) {
      console.log(error)
    }
  },
  readProvince: (req, res) => {
    ModelProvince.find({}).then((response) => {
      if (response) {
        return res.status(200).json(response.reverse())
      }
    })
  },
  read_one_Province: (req, res) => {
    const { code_secteur } = req.params

    var look_Agent = {
      $lookup: {
        from: 'agents',
        localField: 'code_agent',
        foreignField: 'code_agent',
        as: 'agent',
      },
    }
    var look_Annee = {
      $lookup: {
        from: 'annees',
        localField: 'code_Annee',
        foreignField: 'code_Annee',
        as: 'annee',
      },
    }

    var match = { $match: { code_secteur } }

    var project = {
      $project: {
        'agent.nom': 1,
        denomination: 1,
        code_secteur: 1,
        code_province: 1,
        'agent.filename': 1,
        'annee.annee': 1,
      },
    }

    ModelProvince.aggregate([match, look_Agent, look_Annee, project]).then(
      (secteurFound) => {
        return res.status(200).json(secteurFound)
      },
    )
  },
}
