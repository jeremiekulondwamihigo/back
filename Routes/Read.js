const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { Read_Year, Year_Use } = require('../Controllers/Setting_Annee')
const { Read_section_Option } = require('../Controllers/Setting_Section')

const {
  AffichageOption,
  effectifInscrit,
  EffectifChaqueOption,
} = require('../Controllers/AffectationOption')
const { read_Option } = require('../Controllers/Setting_Option')
const {
  readDomaine,
  read_Cours,
  readSousDomaine,
} = require('../Controllers/Domaine')
const { Read_Agent } = require('../Controllers/Agent')
const { readProvince, read_one_Province } = require('../Controllers/Province')
const { ReadEtablissement } = require('../Controllers/AddEtablissement')
const { One_agent, ReadAgentDomaine } = require('../Controllers/Other_Read')
const { readUser } = require('../Controllers/Read')
const {
  ReadEleveEtablissement,
  EleveRecherche,
  graphiqueEleve,
  EleveReadSelonAnnee,
  Eleve_InscritEtablissement_Proved,
} = require('../Controllers/Eleve')
const { ReadCoursSimple } = require('../Controllers/Cours')
const { ReadClasse } = require('../Controllers/Classe')
const { ReadInformationEleve } = require('../Controllers/Controllers/ReadEleve')
const { CoursEnseignant } = require('../Controllers/AffectationCours')

//NOUVELLE VERSION
router.get('/readyear', protect, Read_Year)
router.get('/readsectionoption', protect, Read_section_Option)
router.get('/readdomaine/:codeoption/:niveau', protect, readDomaine)
router.get('/readcours/:codeoption/:niveau', protect, read_Cours)
router.get('/readagent', protect, Read_Agent)
router.get('/readsecteur', protect, readProvince)
router.get('/readonesecteur/:codesecteur', protect, read_one_Province)
router.get('/option', protect, read_Option)
//FIN NOUVELLE VERSION

router.get('/yearuse', protect, Year_Use)
router.get('/oneAgent/:codeagent', protect, One_agent)

router.get('/user', readUser)

//NATIONALE
router.get('/domaine', protect, ReadAgentDomaine)
router.get('/sousdomaine/:classe', protect, readSousDomaine)
router.get('/coursimple/:classe/:code_Option', protect, ReadCoursSimple)
router.get('/autres/:code_Option/:niveau', protect, ReadClasse)
//FIN NATIONALE

//DIVISION
router.get('/readetablissement/:code_province', protect, ReadEtablissement)

router.get('/optionEtablissement/:id', protect, AffichageOption)
router.get('/effectifEtablissement/:etablissement', protect, effectifInscrit)

//FIN DIVISION

//ETABLISSEMENT
router.get('/readEleve/:codeEtablissement', protect, ReadEleveEtablissement)
router.get('/singlerecherche/:codeEtablissement', protect, EleveRecherche)
router.get(
  '/readEleveSelonAnnee/:id/:codeEtablissement',
  protect,
  EleveReadSelonAnnee,
)
router.get('/eleveproved', protect, Eleve_InscritEtablissement_Proved)
router.get('/readGraphique/:codeEtablissement', protect, graphiqueEleve)
router.get('/informationEleve/:id', ReadInformationEleve)
router.get('/effectifOption/:codeEtablissement', protect, EffectifChaqueOption)
router.get('/coursenseignant/:codeAgent', protect, CoursEnseignant)
//FIN ETABLISSEMENT

module.exports = router
