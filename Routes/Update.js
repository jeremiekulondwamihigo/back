const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { Modificate_Year } = require('../Controllers/Setting_Annee')
const { modificate_section } = require('../Controllers/Setting_Section')
const { Modification_Option } = require('../Controllers/Setting_Option')
const { Modification_Agent } = require('../Controllers/Agent')
const { ResetIdentifiant, UpdateProvince } = require('../Controllers/Province')
const { ModifierCours } = require('../Controllers/Cours')

const { AffectationOption } = require('../Controllers/AffectationOption')
const { BlocquerEtabli, AddAgent } = require('../Controllers/AddEtablissement')
const {
  BloquerEleve,
  InscriptionExistante,
} = require('../Controllers/EnregistrerEleve')
const { AffectationCours } = require('../Controllers/AffectationCours')

router.put('/updateyear', protect, Modificate_Year)
router.put('/updatesection', protect, modificate_section)
router.put('/updateoption', protect, Modification_Option)
router.put('/updateagent', protect, Modification_Agent)
router.put('/resetidentifiant/:id', protect, ResetIdentifiant)
router.put('/updatesecteur/:id', protect, UpdateProvince)
router.put('/cours', protect, ModifierCours)
router.put('/optionEtablissement', AffectationOption)
router.put('/bloquerEtablissement', protect, BlocquerEtabli)
router.put('/bloqueleve', protect, BloquerEleve)
router.put('/existantinscription', protect, InscriptionExistante)
router.put('/addenseignantetabliss', protect, AddAgent)
router.put('/affectationCours', protect, AffectationCours)

module.exports = router
