const jwt = require('jsonwebtoken')
const Model_Agent = require('../Models/Model_Agent')
const Model_secteur = require('../Models/ModelProvince')
const ErrorResponse = require('../utils/errorResponse')
const Model_Etablissement = require('../Models/Model_Etablissement')

module.exports = {
  protect: async (req, res, next) => {
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
      const user = await Model_Agent.findById({ _id: decoded.id })
      const secteur = await Model_secteur.findById({ _id: decoded.id })
      const etablissement = await Model_Etablissement.findById({
        _id: decoded.id,
      })

      if (!user && !secteur && !etablissement && !division) {
        return next(new ErrorResponse('No user found with this id', 200))
      }

      req.user = user
        ? user
        : secteur
        ? secteur
        : etablissement
        ? etablissement
        : null
      next()
    } catch (error) {
      return next(new ErrorResponse('Not authorization to access this id', 200))
    }
  },
}
