const ModelAgent = require('../Models/Model_Agent')
const ModelCours = require('../Models/Cours')
const ModelEtablissement = require('../Models/Model_Etablissement')
const asyncLab = require('async')
const { isEmpty, Message } = require('../Fonctions/Static_Function')

module.exports = {
  AffectationCours: (req, res) => {
    try {
      const { code_agent, idCours, codeEtablissement, action } = req.body
      if (
        isEmpty(code_agent) ||
        isEmpty(idCours) ||
        isEmpty(codeEtablissement)
      ) {
        Message('Veuillez remplir les champs', true, res)
      }
      asyncLab.waterfall(
        [
          function (done) {
            ModelAgent.findOne({
              code_agent,
              active: true,
            })
              .then((agentFound) => {
                if (isEmpty(agentFound)) {
                  Message('Agent introuvable', true, res)
                } else {
                  done(null, agentFound)
                }
              })
              .catch(function (error) {
                Message(' Catch : ' + error, true, res)
              })
          },
          function (agent, done) {
            ModelCours.findOne({ idCours }).then((existe) => {
              if (isEmpty(existe)) {
                Message("Ce cours n'existe pas", true, res)
              } else {
                done(null, agent)
              }
            })
          },
          function (agent, done) {
            ModelEtablissement.findOne({
              codeEtablissement,
              active: true,
            }).then((etablissement) => {
              if (!isEmpty(etablissement)) {
                if (etablissement.code_enseignant.includes(agent.code_agent)) {
                  done(null, agent, etablissement)
                } else {
                  Message('Agent non enregistrer', true, res)
                }
              }
            })
          },
          function (agent, etablissement, done) {
            if (action === 'add') {
              ModelAgent.updateOne(
                { code_agent: agent.code_agent, active: true },
                {
                  $addToSet: {
                    cours: {
                      etablissement: etablissement.codeEtablissement,
                      cours: idCours,
                    },
                  },
                },
              )
                .then((optionUpdate) => {})
                .catch(function (error) {
                  console.log(error)
                })
            }
            if (action === 'delete') {
              ModelAgent.updateOne(
                { code_agent: agent.code_agent, active: true },
                {
                  $pull: {
                    cours: {
                      etablissement: etablissement.codeEtablissement,
                      cours: idCours,
                    },
                  },
                },
              )
                .then((optionUpdate) => {
                  if (optionUpdate.ok) {
                    done(true)
                  } else {
                    done(false)
                  }
                })
                .catch(function (error) {
                  console.log(error)
                })
            }
          },
        ],
        function (result) {
          if (result) {
            Message('Opération effectuée', false, res)
          } else {
            Message("Erreur d'enregistrement", true, res)
          }
        },
      )
    } catch (error) {
      Message('Catch :' + error, true, res)
    }
  },
  CoursEnseignant: (req, res) => {
    try {
      const { codeAgent } = req.params
      ModelAgent.aggregate([
        { $match: { code_agent: codeAgent } },
        {
          $lookup: {
            from: 'cours',
            localField: 'cours.cours',
            foreignField: 'idCours',
            as: 'listCours',
          },
        },
        {
          $lookup: {
            from: 'etablissements',
            localField: 'cours.etablissement',
            foreignField: 'codeEtablissement',
            as: 'etablissement',
          },
        },

        {
          $project: {
            listCours: 1,
            etablissement: 1,
            cours: 1,
          },
        },
      ])
        .then((result) => {
          if (!isEmpty(result)) {
            let data = {
              cours: result[0].cours,
              listeCours: result[0].listCours,
              etablissement: result[0].etablissement,
            }
            let donner = []
            for (let i = 0; i < data.cours.length; i++) {
              donner.push({
                cours: data.listeCours.filter(
                  (cour) => cour.idCours === data.cours[i].cours,
                ),
                etablissement: data.etablissement.filter(
                  (etab) =>
                    etab.codeEtablissement === data.cours[i].etablissement,
                ),
              })
            }
            let resultat = []

            for (let y = 0; y < donner.length; y++) {
              resultat.push({
                _id: donner[y].cours[0]._id,
                validExamen: donner[y].cours[0].validExamen,
                branche: donner[y].cours[0].branche,
                maxima: donner[y].cours[0].maxima,
                classe: donner[y].cours[0].classe,
                id: donner[y].cours[0].id,
                code_Option: donner[y].cours[0].code_Option,
                idCours: donner[y].cours[0].idCours,
                etablissement: donner[y].etablissement[0].etablissement,
                codeEtablissement: donner[y].etablissement[0].codeEtablissement,
              })
            }
            res.send(resultat)
          }
        })
        .catch(function (error) {
          Message('Catch :' + error, true, res)
        })
    } catch (error) {
      Message('Catch :' + error, true, res)
    }
  },
}
