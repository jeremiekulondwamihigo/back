const { isEmpty } = require('../Fonctions/Static_Function')
const modelEleve = require('../Models/Eleves')
const modelAgent = require('../Models/Model_Agent')

module.exports = {
  Imagess: (req, res) => {
    const { filename } = req.file
    const { code_agent, action, code_eleve } = req.body
    console.log(req.file)
    if (isEmpty(filename) || isEmpty(code_agent)) {
      return res.status(200).json({
        message: 'Veuillez remplir les champs',
        error: true,
      })
    }
    if (action === 'eleve') {
      console.log('je suis eleve')
      modelEleve
        .updateOne({ code_eleve: code_eleve }, { $set: { filename: filename } })
        .then((response) => {
          if (response.ok) {
            return res.status(200).json({})
          }
        })
        .catch(function (error) {
          return res.status(200).json({
            message: 'Error : ' + error,
            error: true,
          })
        })
    }
    if (action === 'agent') {
      console.log('je suis agent')
      modelAgent
        .updateOne({ code_agent: code_agent }, { $set: { filename: filename } })
        .then((response) => {
          if (response.ok) {
            return res.status(200).json({
              message: 'Modification effectuée',
              error: true,
            })
          }
        })
        .catch(function (error) {
          return res.status(200).json({
            message: 'Error : ' + error,
            error: true,
          })
        })
    }
  },
}
