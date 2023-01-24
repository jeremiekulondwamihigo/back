const Model_Agent = require('../Models/Model_Agent')
const DomaineAgent = require('../Models/DomaineAgent')

module.exports = {
  One_agent: (req, res) => {
    const { codeagent } = req.params

    Model_Agent.findOne({ code_agent: codeagent }).then((response) => {
      if (response) {
        return res.send(response)
      } else {
        return res.send(false)
      }
    })
  },

  ReadAgentDomaine: (req, res) => {
    var look = {
      $lookup: {
        from: 'agents',
        localField: 'codeDomaine',
        foreignField: 'codeDomaine',
        as: 'domaine',
      },
    }

    DomaineAgent.aggregate([look]).then((response) => {
      let valeur = []
      let id = 0
      for (let i = 0; i < response.length; i++) {
        valeur.push({
          total:
            response[i].domaine.length < 100
              ? '00' + response[i].domaine.length
              : response[i].domaine.length,
          title: response[i].title,
          codeDomaine: response[i].codeDomaine,
          id: response[i]._id,
        })
      }

      return res.send(valeur.reverse())
    })

    // DomaineAgent.find({}).then(response =>{
    //     return res.send(response.reverse())
    // })
  },
  etablissementRead: (req, res) => {
    Model_Etablissement.find().then((response) => {
      res.send(response)
    })
  },
}
