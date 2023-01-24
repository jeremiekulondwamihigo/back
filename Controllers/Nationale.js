const Model_Nationale = require('../Models/Nationale')
const Model_Agent = require('../Models/Model_Agent')
const asyncLab = require('async')
const { isEmpty, generateNumber } = require('../Fonctions/Static_Function')
const Model_Users = require('../Models/Users')

module.exports = {
  Ajouter: async (req, res) => {
    try {
      const { id, code_agent } = req.body

      if (isEmpty(code_agent) || isEmpty(fonction)) {
        return res.status(200).json({
          error: true,
          message: "Veuillez renseigner le code de l'agent sa fonction",
        })
      }
      const username = generateNumber(5)
      const password = generateNumber(5)

      await asyncLab.waterfall([
        function (done) {
          Model_Agent.findOne({
            code_agent: code_agent,
          })
            .then((agentFound) => {
              if (agentFound) {
                done(null, agentFound)
              } else {
                return res.status(200).json({
                  message: 'Code agent introuvable',
                  error: true,
                })
              }
            })
            .catch(function (error) {
              console.log(error)
            })
        },
        function (agentFound, done) {
          Model_Nationale.create({
            id,
            code_agent,
            fonction,
          })
        },
      ])
    } catch (error) {}
  },
}
