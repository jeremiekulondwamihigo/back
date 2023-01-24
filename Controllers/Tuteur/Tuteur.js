const Model_Tuteur = require('../../Models/Tuteur')
const asyncLab = require('async')
const {
  generateString,
  isEmpty,
  generateNumber,
} = require('../../Fonctions/Static_Function')
const Model_Users = require('../../Models/Users')

module.exports = {
  Tuteur: async (req, res) => {
    try {
      const { nom, telephone, id } = req.body
      const codeTuteur = generateNumber(5)
      const password = generateNumber(6)

      if (isEmpty(nom) || isEmpty(telephone)) {
        return res.status(200).json({
          message: 'Veuillez remplir les champs',
          error: true,
        })
      }
      await asyncLab.waterfall(
        [
          function (done) {
            Model_Tuteur.findOne({
              codeTuteur,
            })
              .then((codeFound) => {
                if (codeFound) {
                  return res.status(200).json({
                    message: "Veuillez relancer l'enregistrement",
                    error: true,
                  })
                } else {
                  done(null, true)
                }
              })
              .catch(function (error) {
                return res.status(200).json(error)
              })
          },
          function (codeFound, done) {
            Model_Tuteur.find({})
              .then((t) => {
                Model_Tuteur.create({
                  codeTuteur: t.length + 1,
                  nom,
                  telephone,
                  id,
                })
                  .then((tuteurCreate) => {
                    if (tuteurCreate) {
                      done(null, tuteurCreate)
                    } else {
                      done(tuteurCreate)
                    }
                  })
                  .catch(function (error) {
                    return res.status(200).json(error)
                  })
              })
              .catch(function (error) {
                return res.status(200).json(error)
              })
          },
          function (tuteurCreate, done) {
            Model_Users.create({
              username: tuteurCreate.telephone,
              password,
              fonction: 'tuteur',
            }).then((UserCreate) => {
              if (UserCreate) {
                done(UserCreate)
                //Le systeme envoie le message contenant l'identification dans le systeme
              } else {
                return res.status(200).json({
                  message: "Erreur d'enregistrement",
                  error: true,
                })
              }
            })
          },
        ],
        function (response) {
          if (response) {
            return res.status(200).json({
              message:
                'Tuteur enregistrer code ' +
                codeTuteur +
                ' password ' +
                password +
                ' phone ' +
                telephone,
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
      console.log(error)
    }
  },
}
