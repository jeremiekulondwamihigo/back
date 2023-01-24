const model_Section = require('../Models/Model_Section')
const { isEmpty, generateString } = require('../Fonctions/Static_Function')
const AsyncLib = require('async')

module.exports = {
  Add_Section: (req, res) => {
    const { section } = req.body

    if (isEmpty(section)) {
      return res.status(200).json({
        message: "La section n'est pas spécifiée",
        error: true,
      })
    }
    const valeur_id = generateString(7)
    try {
      AsyncLib.waterfall(
        [
          function (done) {
            model_Section
              .findOne({
                section: section,
              })
              .then((sectionFound) => {
                if (sectionFound) {
                  return res.status(200).json({
                    message:
                      'La section ' + sectionFound.section + ' existe déjà',
                    error: true,
                  })
                } else {
                  done(null, true)
                }
              })
          },
          function (sectionFound, done) {
            model_Section
              .findOne({ code_Section: valeur_id })
              .then((response) => {
                if (response) {
                  return res.status(200).json({
                    message: "Y a un petit souci, Rélancer l'enregistrement",
                    error: true,
                  })
                } else {
                  model_Section
                    .create({
                      section,
                      code_Section: valeur_id,
                      id: new Date(),
                    })
                    .then((sectionCreate) => {
                      if (sectionCreate) {
                        done(sectionCreate)
                      } else {
                        return res.status(200).json({
                          message: "Erreur d'enregistrement",
                          error: true,
                        })
                      }
                    })
                }
              })
          },
        ],
        function (valeur) {
          if (valeur) {
            return res.status(200).json({
              message: 'Enregistrement effectuer ' + valeur_id,
              data: valeur,
              error: false,
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  Read_section: (req, res) => {
    model_Section.find({}).then((sectionFound) => {
      return res.send(sectionFound)
    })
  },
  Read_section_Option: (req, res) => {
    varLookOption = {
      $lookup: {
        from: 'options',
        localField: 'code_Section',
        foreignField: 'code_Section',
        as: 'option',
      },
    }
    model_Section.aggregate([varLookOption]).then((response) => {
      res.send(response)
    })
  },
  modificate_section: (req, res) => {
    const { section, id } = req.body
    try {
      model_Section.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            section: section,
          },
        },
        null,
        (error, result) => {
          if (error) throw error
          else {
            return res.status(200).json({
              message: 'Opération effectuée',
              error: true,
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  delete_Section: (req, res) => {
    //Cette fonction va d'abord chercher s'il y a une école qui l'utilise si oui la section
    //ne sera pas supprimer
  },
}
