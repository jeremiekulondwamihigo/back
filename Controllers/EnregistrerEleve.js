const ModelEtablissement = require('../Models/Model_Etablissement')
const ModelEleveInscrit = require('../Models/EleveInscrit')
const ModelAnnee = require('../Models/Model_Annee')
const ModelInfoEleve = require('../Models/Eleves')
const ModelClasse = require('../Models/Classe')
const asyncLab = require('async')
const { isEmpty } = require('../Fonctions/Static_Function')
const ModelInformation = require('../Models/InforInscription')

module.exports = {
  Inscription: async (req, res) => {
    try {
      const {
        niveau,
        codeEtablissement,
        codeInscription,
        code_Option,
        id,
      } = req.body

      if (
        isEmpty(niveau) ||
        isEmpty(codeInscription) ||
        isEmpty(codeEtablissement) ||
        isEmpty(code_Option) ||
        isEmpty(id)
      ) {
        return res
          .status(200)
          .json({ message: 'Veuillez remplir les champs', error: true })
      }

      const classe = parseInt(niveau)
      const code = codeInscription.trim()
      if (classe < 5 && isEmpty(code_Option)) {
        return res
          .status(200)
          .json({ message: "L'option est indéfinie", error: true })
      }

      function showMessage(message, type) {
        return res.status(200).json({
          message: message,
          error: type,
        })
      }

      asyncLab.waterfall(
        [
          function (done) {
            ModelEtablissement.findOne({
              codeEtablissement,
              active: true,
            })
              .then((etablissement) => {
                if (etablissement) {
                  done(null, etablissement)
                } else {
                  showMessage('Service non autorisé', true)
                }
              })
              .catch(function (error) {
                console.log(error)
              })
          },
          function (etablissement, done) {
            ModelAnnee.findOne({
              active: true,
            })
              .then((anneeFound) => {
                if (anneeFound) {
                  done(null, etablissement, anneeFound)
                } else {
                  showMessage('Année scolaire non définie', true)
                }
              })
              .catch((error) => console.log(error))
          },
          //Verification de la disponibilité de la place
          function (etablissement, anneeFound, done) {
            ModelClasse.findOne({
              niveau: classe,
              code_Option,
            })
              .then((classeFound) => {
                if (classeFound) {
                  done(null, etablissement, anneeFound, classeFound)
                } else {
                  showMessage('Classe non parametrée', true)
                }
              })
              .catch(function (error) {
                console.log(error)
              })
          },
          function (etablissement, anneeFound, classeFound, done) {
            ModelEleveInscrit.find({
              codeEtablissement: etablissement.codeEtablissement,
              code_Annee: anneeFound.code_Annee,
              codeClasse: classeFound.codeClasse,
            }).then((eleveListeFound) => {
              if (
                eleveListeFound &&
                eleveListeFound.length >= classeFound.effectif
              ) {
                showMessage("Vous avez atteint la limite d'inscription", true)
              } else {
                done(null, etablissement, anneeFound, classeFound)
              }
            })
          },
          //Fin verification place
          function (etablissement, anneeFound, classeFound, done) {
            ModelInfoEleve.findOne({
              codeInscription: code,
              libre: true,
            })
              .then((inforEleve) => {
                if (inforEleve) {
                  done(null, etablissement, anneeFound, classeFound, inforEleve)
                } else {
                  showMessage('Inscription non autorisée', true)
                }
              })
              .catch(function (error) {
                console.log(error)
              })
          },
          //Verification si l'eleve existe ou pas
          function (etablissement, anneeFound, classeFound, inforEleve, done) {
            ModelEleveInscrit.findOne({
              code_eleve: inforEleve.code_eleve,
              codeEtablissement: etablissement.codeEtablissement,
              code_Annee: anneeFound.code_Annee,
            }).then((response) => {
              if (response) {
                showMessage('Enregistrement déjà effectuer', true)
              } else {
                done(null, etablissement, anneeFound, classeFound, inforEleve)
              }
            })
          },
          //Fin verification
          function (etablissement, anneeFound, classeFound, inforEleve, done) {
            if (classe > 5 && classe < 8) {
              ModelEleveInscrit.findOne({
                code_eleve: inforEleve.code_eleve,
                niveau: 7,
                resultat: {
                  $gt: parseInt(classeFound.resultat) + 1,
                },
              }).then((response) => {
                if (response) {
                  showMessage(
                    `L'élève doit etre inscrit en huitieme annee`,
                    true,
                  )
                } else {
                  ModelEleveInscrit.create({
                    id,
                    code_eleve: inforEleve.code_eleve,
                    codeEtablissement,
                    code_Annee: anneeFound.code_Annee,
                    codeInscription,
                    codeClasse: classeFound.codeClasse,
                  })
                    .then((eleveCreate) => {
                      if (eleveCreate) {
                        done(eleveCreate)
                      } else {
                        showMessage("Erreur d'enregistrement")
                      }
                    })
                    .catch(function (error) {
                      showMessage(error.message, true)
                    })
                }
              })
            } else {
              done(null, etablissement, anneeFound, classeFound, inforEleve)
            }
          },
          //Chercher la classe précédente
          function (etablissement, anneeFound, classeFound, inforEleve, done) {
            ModelEleveInscrit.find({
              code_eleve: inforEleve.code_eleve,
            })
              .sort('-_id')
              .limit(1)
              .then((derniereCl) => {
                if (derniereCl.length > 0) {
                  done(
                    null,
                    etablissement,
                    anneeFound,
                    classeFound,
                    inforEleve,
                    derniereCl[0],
                  )
                } else {
                  showMessage("L'élève doit reprendre la classe précédente")
                }
              })
              .catch(function (error) {
                console.log(error)
              })
          },
          function (
            etablissement,
            anneeFound,
            classeFound,
            inforEleve,
            derniereCl,
            done,
          ) {
            ModelClasse.findOne({
              codeClasse: derniereCl.codeClasse,
            }).then((response) => {
              if (
                parseInt(response.resultat) <= parseInt(derniereCl.resultat)
              ) {
                ModelEleveInscrit.create({
                  id,
                  code_eleve: inforEleve.code_eleve,
                  codeEtablissement: etablissement.codeEtablissement,
                  code_Annee: anneeFound.code_Annee,
                  codeInscription: inforEleve.codeInscription,
                  codeClasse: classeFound.codeClasse,
                })
                  .then((eleveCreate) => {
                    done(eleveCreate)
                  })
                  .catch(function (error) {
                    console.log(error)
                  })
              } else {
                showMessage(
                  "L'élève doit obtenir " +
                    response.resultat +
                    '% dans la classe précédente',
                  true,
                )
              }
            })
          },
        ],
        function (eleveCreate) {
          if (eleveCreate) {
            showMessage('Enregistrement effectuer', false)
          } else {
            showMessage("Erreur d'enregistrement", true)
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  //Bloquer ou débloquer un élève

  BloquerEleve: async (req, res) => {
    const { id, valeur } = req.body
    ModelInfoEleve.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { libre: valeur },
      },
      null,
      (error, result) => {
        if (error) {
          return res.status(200).json({
            message: error,
            error: true,
          })
        }
        if (result) {
          return res.status(200).json({
            message: 'Opération effectuée',
            error: false,
          })
        }
      },
    )
  },
  InscriptionExistante: (req, res) => {
    const { codeEleve, codeEtablissement, id } = req.body
    if (isEmpty(codeEleve)) {
      return res.status(200).json({
        message: 'Code introuvable',
        error: true,
      })
    }

    asyncLab.waterfall([
      function (done) {
        ModelAnnee.findOne({ active: true })
          .then((anneeFound) => {
            done(null, anneeFound)
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      function (anneeFound, done) {
        ModelEleveInscrit.aggregate([
          {
            $match: {
              code_eleve: codeEleve,
              code_Annee: anneeFound.code_Annee,
            },
          },
          {
            $lookup: {
              from: 'classes',
              localField: 'codeClasse',
              foreignField: 'codeClasse',
              as: 'ClasseFound',
            },
          },
          {
            $lookup: {
              from: 'eleves',
              localField: 'code_eleve',
              foreignField: 'code_eleve',
              as: 'eleveInfo',
            },
          },
          {
            $lookup: {
              from: 'options',
              localField: 'ClasseFound.code_Option',
              foreignField: 'code_Option',
              as: 'OptionClasse',
            },
          },
        ]).then((response) => {
          if (response.length > 0) {
            done(null, anneeFound, response)
          } else {
            return res.status(200).json({
              message: 'Elève introuvable',
              error: true,
            })
          }
        })
      },
      function (anneeFound, eleveFound, done) {
        var match = {
          $match: { codeEtablissement: codeEtablissement, active: true },
        }
        var lookOption = {
          $lookup: {
            from: 'options',
            localField: 'code_option',
            foreignField: 'code_Option',
            as: 'OptionFounds',
          },
        }
        var project = {
          $project: {
            OptionFounds: 1,
          },
        }
        try {
          ModelEtablissement.aggregate([match, lookOption, project]).then(
            (optionFound) => {
              if (optionFound.length > 0) {
                done(null, anneeFound, eleveFound, optionFound)
              } else {
                return res.status(200).json({
                  message: 'Etablissement introuvable',
                  error: true,
                })
              }
            },
          )
        } catch (error) {
          console.log(error)
        }
      },
      //Vérification place
      function (anneeFound, eleve, optionAutoriser, done) {
        ModelEleveInscrit.aggregate([
          {
            $match: {
              codeEtablissement: codeEtablissement,
              code_Annee: eleve[0].code_Annee,
            },
          },
          {
            $count: 'elevedejainscrit',
          },
        ])
          .then((TotalInscrit) => {
            if (
              parseInt(eleve[0].ClasseFound[0].effectif) <=
              (TotalInscrit.length < 1
                ? 0
                : parseInt(TotalInscrit[0].elevedejainscrit))
            ) {
              return res.status(200).json({
                message: 'Place non disponible',
                error: true,
              })
            } else {
              done(null, anneeFound, eleve, optionAutoriser)
            }
          })
          .catch(function (err) {
            console.log(err)
          })
      },
      //Test
      function (anneeFound, eleve, optionAutoriser, done) {
        if (eleve[0].ClasseFound[0].niveau > 5) {
          done(null, anneeFound, eleve[0])
        }
        if (
          optionAutoriser[0].OptionFounds.length > 0 &&
          eleve[0].ClasseFound[0].niveau < 5
        ) {
          let valid = optionAutoriser[0].OptionFounds.filter(
            (x) => x.code_Option === eleve[0].OptionClasse[0].code_Option,
          )
          if (valid.length > 0) {
            done(null, anneeFound, eleve[0])
          } else {
            return res.status(200).json({
              message: 'Option non disponible',
              error: true,
            })
          }
          //si valid = [] donc l'établissement n'a pas l'option de l'élève
        } //sinon donc l'établissement n'a pas d'options
      },
      function (anneeFound, eleveFound, done) {
        ModelEleveInscrit.updateOne(
          {
            code_eleve: eleveFound.code_eleve,
            code_Annee: anneeFound.code_Annee,
          },
          {
            $set: { codeEtablissement: codeEtablissement },
          },
          null,
          (err, result) => {
            if (err) {
              throw err
            }
          },
        )
        done(null, anneeFound, eleveFound, done)
      },
      function (anneeFound, eleveFound, done) {
        ModelInformation.create({
          code_Annee: anneeFound.code_Annee,
          idConcerner: eleveFound._id,
          codeEtablissement,
          code_eleve: eleveFound.code_eleve,
          id,
        })
          .then((response) => {
            console.log(eleveFound)
            if (response) {
              ModelInfoEleve.updateOne(
                {
                  _id: eleveFound.eleveInfo[0]._id,
                },
                {
                  $set: { libre: false },
                },
              ).then((response) => {
                if (response.ok) {
                  return res.status(200).json({
                    message: 'Opération effectuée',
                    error: false,
                  })
                } else {
                  return res.status(200).json({
                    message: 'Veuillez reessayer',
                    error: true,
                  })
                }
              })
            }
          })
          .catch(function (err) {
            console.log(err)
          })
      },
    ])
  },
}
