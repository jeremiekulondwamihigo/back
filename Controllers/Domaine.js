const ErrorResponse = require('../utils/errorResponse')
const asyncLab = require('async')
const { generateString, isEmpty } = require('../Fonctions/Static_Function')
const { schemaDomaine, schemaSousDomaine } = require('../Models/Domaine')

module.exports = {
  Add_Domaine: (req, res) => {
    const { domaines, classe, id } = req.body

    if (isEmpty(domaines) || isEmpty(classe)) {
      return res.status(200).json({
        message: 'Veuillez renseigner les champs',
        error: true,
      })
    }

    const domaine = domaines.trim()

    asyncLab.waterfall(
      [
        function (done) {
          schemaDomaine
            .findOne({
              domaine: domaine.toUpperCase(),
              classe: classe,
            })
            .then((domaineFound) => {
              if (domaineFound) {
                return res.status(200).json({
                  message: 'Ce domaine existe déjà',
                  error: true,
                })
              } else {
                done(null, domaineFound)
              }
            })
        },
        function (domaineFound, done) {
          schemaDomaine
            .create({
              id,
              domaine: domaine.toUpperCase(),
              code_domaine: generateString(8),
              classe,
            })
            .then((response) => {
              done(response)
            })
        },
      ],
      function (response) {
        if (response) {
          return res.status(200).json({
            message: 'Domaine enregistré',
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
  },
  AddSousDomaine: (req, res) => {
    const { code_domaine, titre_sous_domaine, id } = req.body

    if (isEmpty(titre_sous_domaine)) {
      return res.status(200).json({
        message: 'Veuillez renseigner le sous domaine',
        error: true,
      })
    }

    const code_sous_domaine = generateString(8)

    asyncLab.waterfall(
      [
        function (done) {
          schemaSousDomaine
            .findOne({
              code_domaine: code_domaine,
              titre_sous_domaine: titre_sous_domaine,
            })
            .then((codeFound) => {
              done(null, codeFound)
            })
        },
        function (codeFound, done) {
          if (!isEmpty(codeFound)) {
            done(false)
          } else {
            schemaSousDomaine
              .create({
                code_domaine,
                titre_sous_domaine,
                code_sous_domaine,
                id,
              })
              .then((sousDomaineCreate) => {
                if (sousDomaineCreate) {
                  done(true)
                } else {
                  done(false)
                }
              })
          }
        },
      ],
      function (result) {
        if (result) {
          return res.status(200).json({
            message: 'Sous domaine enregistrer',
            error: false,
          })
        } else {
          return res.status(200).json({
            message: "Relancer l'enregistrement",
            error: true,
          })
        }
      },
    )
  },

  readDomaine: (req, res) => {
    const { code_option, niveau } = req.params

    var lookSousDomaine = {
      $lookup: {
        from: 'sousdomaines',
        localField: 'code_domaine',
        foreignField: 'code_domaine',
        as: 'sousDomaine',
      },
    }

    if (parseInt(niveau) > 5) {
      const match = { $match: { classe: parseInt(niveau) } }

      schemaDomaine.aggregate([match, lookSousDomaine]).then((response) => {
        return res.send(response)
      })
    } else {
      if (isEmpty(code_option)) {
        return res.status(200).json({
          message: "Veuillez selectionner l'option",
          error: true,
        })
      }
      const match = {
        $match: { classe: parseInt(niveau), code_Option: code_option },
      }

      schemaDomaine.aggregate([match, lookSousDomaine]).then((domaine) => {
        return res.send(domaine)
      })
    }
  },
  read_Cours: (req, res) => {
    const { code_option, niveau } = req.params

    let varLook_domaine = {
      $lookup: {
        from: 'domaines',
        localField: 'code_domaine',
        foreignField: 'code_domaine',
        as: 'domaine',
      },
    }

    let varLook_sous_domaine = {
      $lookup: {
        from: 'sous_domaines',
        localField: 'code_sous_domaine',
        foreignField: 'code_sous_domaine',
        as: 'sousDomaine',
      },
    }

    varGroup4 = {
      $project: {
        id: 1,
        cours: 1,
        'domaine.domaine': 1,
        'sousDomaine.titre_sous_domaine': 1,
        maxima: 1,
        _id: 0,
        'domaine.code_domaine': 1,
        'sousDomaine.code_sous_domaine': 1,
      },
    }

    if (parseInt(niveau) > 5) {
      varMach1 = { $match: { classe: parseInt(niveau) } }

      schemaDomaine
        .aggregate([varMach1, varLook_domaine, varLook_sous_domaine])
        .then((response) => {
          return res.send(response)
        })
    } else {
      varMach1 = {
        $match: { niveau: parseInt(niveau), code_Option: code_option },
      }

      Model_Cours.aggregate([
        varMach1,
        varLook_domaine,
        varLook_sous_domaine,
        varGroup4,
      ]).then((response) => {
        return res.send(response)
      })
    }
  },
  readSousDomaine: (req, res) => {
    const { classe } = req.params
    schemaSousDomaine
      .find({
        classe: parseInt(classe),
      })
      .then((response) => {
        if (response) {
          return res.send(response.reverse())
        }
      })
  },
}
