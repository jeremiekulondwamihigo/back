const Model_Etablissement = require('../Models/Model_Etablissement')
const Model_Agent = require('../Models/Model_Agent')
const Model_Users = require('../Models/Users')
const {
  isEmpty,
  generateString,
  generateNumber,
} = require('../Fonctions/Static_Function')
const asyncLab = require('async')

module.exports = {
  AddEtablissement: async (req, res) => {
    try {
      const { etablissement, id, code_province, code_agent } = req.body

      const code_etablissement = generateString(8)

      if (
        isEmpty(etablissement) ||
        isEmpty(id) ||
        isEmpty(code_province) ||
        isEmpty(code_agent)
      ) {
        return res.status(200).json({
          message: 'Veuillez renseigner les champs',
          error: true,
        })
      }
      const nom_etablissement = etablissement.toUpperCase()
      const password = generateNumber(7)

      await asyncLab.waterfall(
        [
          function (done) {
            Model_Agent.findOne({
              code_agent: code_agent,
              active: true,
            })
              .then((agentFound) => {
                if (agentFound) {
                  done(null, agentFound)
                } else {
                  return res.status(200).json({
                    message: 'Agent introuvable',
                    error: true,
                  })
                }
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
          function (agentFound, done) {
            Model_Etablissement.findOne({
              code_etablissement: code_etablissement,
            })
              .then((codeFound) => {
                if (codeFound) {
                  return res.status(200).json({
                    message: "Veuillez Relancer l'enregistrement",
                    error: true,
                  })
                } else {
                  done(null, agentFound)
                }
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
          function (agentFound, done) {
            Model_Etablissement.findOne({
              code_province,
              etablissement: nom_etablissement,
            })
              .then((ecoleFound) => {
                if (ecoleFound) {
                  return res.status(200).json({
                    message: 'Cette école est enregistrée',
                    error: true,
                  })
                } else {
                  done(null, agentFound)
                }
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
          function (agentFound, done) {
            Model_Etablissement.create({
              etablissement: nom_etablissement,
              code_province,
              id,
              code_agent: agentFound.code_agent,
              codeEtablissement: code_etablissement,
            })
              .then((etablissementCreate) => {
                if (etablissementCreate) {
                  done(null, etablissementCreate)
                } else {
                  done(false)
                }
              })
              .catch(function (error) {
                return res.status(200).json({ message: error, error: true })
              })
          },
          function (etablissementCreate, done) {
            Model_Users.create({
              username: `schooldrc${generateNumber(5)}@gmail.com`,
              password: password,
              fonction: 'etablissement',
              _id: etablissementCreate._id,
            }).then((userCreate) => {
              if (userCreate) {
                done(userCreate)
              } else {
                done(false)
              }
            })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json({
              message:
                'Etablissement username :' +
                result.username +
                ' password ' +
                password,
              error: false,
            })
          } else {
            return res.status(200).json({
              message: 'Un erreur est survenu',
              error: true,
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  ReadEtablissement: (req, res) => {
    const { code_province } = req.params

    var lookagent = {
      $lookup: {
        from: 'agents',
        localField: 'code_agent',
        foreignField: 'code_agent',
        as: 'agent',
      },
    }

    var project = {
      $project: {
        'agent.nom': 1,
        'agent.postnom': 1,
        'agent.prenom': 1,
        'agent.telephone': 1,
        'secteur.denomination': 1,
        code_option: 1,
        _id: 1,
        etablissement: 1,
        id: 1,
        code_etablissement: 1,
        active: 1,
        codeEtablissement: 1,
      },
    }
    var match = { $match: { code_province: code_province } }

    Model_Etablissement.aggregate([match, lookagent, project]).then(
      (response) => {
        return res.send(response)
      },
    )
  },
  BlocquerEtabli: (req, res) => {
    try {
      const { id, value } = req.body

      Model_Etablissement.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            active: value,
          },
        },
        null,
        (error, result) => {
          res.send(result)
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  AddAgent: (req, res) => {
    try {
      const { codeEtablissement, action, code_agent } = req.body

      if (isEmpty(codeEtablissement) || isEmpty(code_agent)) {
        return res.status(200).json({
          message: 'Veuillez remplir les champs',
          error: true,
        })
      }
      asyncLab.waterfall(
        [
          function (done) {
            Model_Etablissement.findOne({
              _id: codeEtablissement,
              active: true,
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
                  message: 'Une erreur est survenue' + error,
                  error: true,
                })
              })
          },
          function (ecoleFound, done) {
            Model_Agent.findOne({ code_agent, active: true }).then(
              (agentFound) => {
                if (isEmpty(agentFound)) {
                  return res.status(200).json({
                    message: 'Agent introuvable',
                    error: true,
                  })
                } else {
                  done(null, ecoleFound, agentFound)
                }
              },
            )
          },
          function (ecoleFound, agentFound, done) {
            if (action === 'add') {
              Model_Etablissement.updateOne(
                { _id: ecoleFound._id },
                { $addToSet: { code_enseignant: agentFound.code_agent } },
              ).then((optionUpdate) => {
                if (optionUpdate.ok) {
                  done(optionUpdate)
                } else {
                  done(false)
                }
              })
            }
            if (action === 'delete') {
              Model_Etablissement.updateOne(
                { _id: ecoleFound._id },
                { $pull: { code_enseignant: agentFound.code_agent } },
              ).then((optionUpdate) => {
                if (optionUpdate.ok) {
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
              message: 'Opération effectuée',
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
}
