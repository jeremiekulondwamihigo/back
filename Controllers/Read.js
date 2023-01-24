const jwt = require('jsonwebtoken')
const ErrorResponse = require('../utils/errorResponse')
const Model_secteur = require('../Models/ModelProvince')
const Model_Etablissement = require('../Models/Model_Etablissement')

module.exports = {
  readUser: async (req, res, next) => {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(
        new ErrorResponse('Not authorization to access this route', 200),
      )
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      var matched = { $match: { active: true } }

      const look_Etablissement = {
        $lookup: {
          from: 'etablissements',
          localField: 'code_province',
          foreignField: 'code_province',
          as: 'etablissement',
        },
      }
      const look_agent = {
        $lookup: {
          from: 'agents',
          localField: 'code_agent',
          foreignField: 'code_agent',
          as: 'agent',
        },
      }
      const lookDivision = {
        $lookup: {
          from: 'secteurs',
          localField: 'code_province',
          foreignField: 'code_province',
          as: 'division',
        },
      }

      if (decoded.fonction === 'nationale') {
        Model_secteur.aggregate([look_agent])
          .then((login) => {
            const data = login.filter((c) => c._id == decoded.id)
            console.log(login, decoded.id)

            return res.status(200).json({
              fonction: decoded.fonction,
              data,
            })
          })
          .catch(function (error) {
            console.log(error)
          })
      }

      if (decoded.fonction === 'province') {
        Model_secteur.aggregate([look_agent, look_Etablissement])
          .then((login) => {
            const data = login.filter((c) => c._id == decoded.id)

            return res.status(200).json({
              fonction: decoded.fonction,
              data,
            })
          })
          .catch(function (error) {
            console.log(error)
          })
      }

      if (decoded.fonction === 'etablissement') {
        Model_Etablissement.aggregate([matched, look_agent, lookDivision])
          .then((login) => {
            const data = login.filter((c) => c._id == decoded.id)

            return res.status(200).json({
              fonction: decoded.fonction,
              data: data,
            })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
      if (decoded.fonction === 'enseignant') {
      }
      if (decoded.fonction === 'tuteur') {
      }
    } catch (error) {
      return next(new ErrorResponse('Not authorization to access this id', 200))
    }
  },
}
