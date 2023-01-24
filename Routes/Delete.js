const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { DeleteYear } = require('../Controllers/Setting_Annee')
const { deleteOption } = require('../Controllers/Setting_Option')

router.delete('/year/:code', DeleteYear)
router.delete('/option/:code_Option', protect, deleteOption)

module.exports = router
