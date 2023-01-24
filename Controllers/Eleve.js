const Model_EleveInscrit = require('../Models/EleveInscrit')
const Model_Eleve = require('../Models/Eleves')
const Model_Annee = require('../Models/Model_Annee')
const Model_Etablissement = require('../Models/Model_Etablissement')
const ModelClasse = require('../Models/Classe')

const asyncLab = require('async')
const { isEmpty, generateNumber } = require('../Fonctions/Static_Function')

module.exports = {
  PremEnregistrement: async (req, res) => {
    try {
      const {
        id,
        code_tuteur,
        agentSave,
        nom,
        postNom,
        prenom,
        nationalite,
        nomPere,
        professionPere,
        nomMere,
        professionMere,
        date_Naissance,
        lieu_naissance,
        genre,
      } = req.body

      if (
        isEmpty(nom) ||
        isEmpty(id) ||
        isEmpty(postNom) ||
        isEmpty(genre) ||
        isEmpty(agentSave) ||
        isEmpty(prenom) ||
        isEmpty(lieu_naissance) ||
        isEmpty(date_Naissance)
      ) {
        return res.status(200).json({
          message: "Le champs ayant l'asteriste est obligatoire",
          error: true,
        })
      }

      asyncLab.waterfall(
        [
          function (done) {
            Model_Eleve.findOne({
              nom: nom.toUpperCase(),
              postNom: postNom.toUpperCase(),
              prenom: prenom.toUpperCase(),
            }).then((response) => {
              if (response) {
                return res.status(200).json({
                  message: "L'élève " + prenom + ' existe déjà',
                  error: true,
                })
              } else {
                done(null, true)
              }
            })
          },
          function (eleve, done) {
            Model_Annee.findOne({ active: true })
              .then((anneeFound) => {
                if (anneeFound) {
                  done(null, anneeFound)
                }
              })
              .catch((error) => {
                return res.send(error)
              })
          },

          function (anneeFound, done) {
            const code = `${anneeFound.annee
              .split('-')[1]
              .trim()
              .substr(2)}${generateNumber(5)}`

            Model_Eleve.create({
              id,
              code_eleve: code,
              nom: nom,
              postNom: postNom,
              prenom: prenom,
              nationalite: nationalite,
              nomPere: nomPere,
              professionPere: professionPere,
              nomMere: nomMere,
              professionMere: professionMere,
              genre,
              codeTuteur: code_tuteur,
              date_Naissance,
              lieu_naissance: lieu_naissance,
              codeEtablissement: agentSave,
              codeInscription: code,
            })
              .then((response) => {
                if (response) {
                  done(response)
                } else {
                  done(false)
                }
              })
              .catch((error) => {
                console.log(error)
              })
          },
        ],
        function (response) {
          if (response) {
            return res.status(200).json({
              message: `Eleve ${response.nom} ${response.postNom}, code : ${response.code_eleve}`,
              error: false,
            })
          } else {
            return res
              .status(200)
              .json({ message: "Erreur d'enregistrement", error: false })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },

  ReadEleveEtablissement: async (req, res) => {
    const { codeEtablissement } = req.params
    Model_Eleve.find({ codeEtablissement })
      .then((eleveFound) => {
        return res.send(eleveFound.reverse())
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  EleveReadSelonAnnee: (req, res) => {
    const { id, codeEtablissement } = req.params

    let lookEleve = {
      $lookup: {
        from: 'eleves',
        localField: 'code_eleve',
        foreignField: 'code_eleve',
        as: 'eleve',
      },
    }
    let option = {
      $lookup: {
        from: 'options',
        localField: 'code_Option',
        foreignField: 'code_Option',
        as: 'option',
      },
    }
    let match = {
      $match: {
        code_Annee: id,
        codeEtablissement,
      },
    }
    Model_EleveInscrit.aggregate([match, lookEleve, option])
      .then((EleveFound) => {
        return res.status(200).json(EleveFound.reverse())
      })
      .catch(function (error) {
        return res.send(error)
      })
  },

  EleveRecherche: async (req, res) => {
    let eleve = {
      $lookup: {
        from: 'eleves',
        localField: 'code_eleve',
        foreignField: 'code_eleve',
        as: 'eleve',
      },
    }
    let eleveClasse = {
      $lookup: {
        from: 'classes',
        localField: 'codeClasse',
        foreignField: 'codeClasse',
        as: 'classe',
      },
    }
    let etablissement = {
      $lookup: {
        from: 'etablissements',
        localField: 'codeEtablissement',
        foreignField: 'codeEtablissement',
        as: 'etablissement',
      },
    }
    let annee = {
      $lookup: {
        from: 'annees',
        localField: 'code_Annee',
        foreignField: 'code_Annee',
        as: 'annee',
      },
    }

    asyncLab.waterfall([
      function (done) {
        Model_Annee.findOne({ active: true })
          .then((AnneeFound) => {
            if (AnneeFound) {
              done(null, AnneeFound)
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      function (AnneeFound, done) {
        let matche = {
          $match: {
            code_Annee: AnneeFound.code_Annee,
          },
        }
        const match = {
          $match: req.params,
        }

        Model_EleveInscrit.aggregate([
          match,
          matche,
          eleve,
          etablissement,
          annee,
          eleveClasse,
        ]).then((eleveFound) => {
          if (eleveFound) {
            return res.status(200).json(eleveFound.reverse())
          } else {
            return false
          }
        })
      },
    ])
  },

  Eleve_InscritEtablissement_Proved: async (req, res) => {
    try {
      const { code, codeAnnee } = req.body

      let optionFind = {
        $lookup: {
          from: 'Option',
          localField: 'code_Option',
          foreignField: 'code_Option',
          as: 'option',
        },
      }
      let match = {
        $match: {
          code_Annee: codeAnnee,
        },
      }

      await Model_Etablissement.find({ code_proved: code }).then(
        (ecoleFound) => {
          if (ecoleFound.length > 0) {
            Model_EleveInscrit.aggregate([match, optionFind]).then(
              (allEleveInscrit) => {
                let tableau = []
                let eleve
                for (let i = 0; i < ecoleFound.length; i++) {
                  eleve = allEleveInscrit.filter(
                    (e) =>
                      ecoleFound[i].codeEtablissement == e.codeEtablissement,
                  )

                  tableau = tableau.concat(eleve)
                }
                return res.send(tableau)
              },
            )
          } else {
            return res
              .status(200)
              .json({ message: 'Aucune établissement trouvée', error: true })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },

  graphiqueEleve: (req, res) => {
    const { codeEtablissement } = req.params

    Model_Annee.findOne({ active: true })
      .then((AnneeFound) => {
        if (AnneeFound) {
          Model_EleveInscrit.aggregate([
            {
              $match: {
                code_Annee: AnneeFound.code_Annee,
                codeEtablissement,
              },
            },
            {
              $unwind: '$niveau',
            },
            {
              $group: {
                _id: '$niveau',
                classe: {
                  $sum: 1,
                },
              },
            },
          ])
            .then((sta) => {
              if (sta) {
                return res.status(200).json(sta)
              }
            })
            .catch(function (error) {
              console.log(error)
            })
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  },
}
