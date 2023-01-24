const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { Add_Annee } = require('../Controllers/Setting_Annee')
const { Add_Section } = require('../Controllers/Setting_Section')
const { Add_Option } = require('../Controllers/Setting_Option')
const { Add_Domaine, AddSousDomaine } = require('../Controllers/Domaine')
const { Agent } = require('../Controllers/Agent')
const { AddProvince } = require('../Controllers/Province')
const {
  Add_Periode_Province,
} = require('../Controllers/Parameter_Detail_Secteur')
const { AddEtablissement } = require('../Controllers/AddEtablissement')
const { login } = require('../Controllers/auth')
const { DomaineAgent } = require('../Controllers/DomaineAgent')
const { Tuteur } = require('../Controllers/Tuteur/Tuteur')
const { Cours } = require('../Controllers/Cours')
const { AddClasse } = require('../Controllers/Classe')
const { Imagess } = require('../Controllers/Image')

const multer = require('multer')

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images/')
  },
  filename: (req, file, cb) => {
    const image = file.originalname.split('.')

    cb(null, `${Date.now()}.${image[1]}`)
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)

    if (ext !== '.jpg' || ext !== '.png') {
      return cb(res.status(400).end('only jpg, png are allowed'), false)
    }
    cb(null, true)
  },
})
var upload = multer({ storage: storage })

//NOUVELLE VERSION
router.post('/addyear', protect, Add_Annee)
router.post('/addsection', protect, Add_Section)
router.post('/addoption', protect, Add_Option)
router.post('/adddomaine', protect, Add_Domaine)
router.post('/sousdomaine', protect, AddSousDomaine)
router.post('/agent', Agent)
router.post('/addprovince', protect, AddProvince)
router.post('/addetablissement', protect, AddEtablissement)
router.post('/domaineAgent', DomaineAgent)
const { Inscription } = require('../Controllers/EnregistrerEleve')
const { PremEnregistrement } = require('../Controllers/Eleve')

//FIN NOUVELLE VERSION

router.post('/addperiodesecteur', protect, Add_Periode_Province)

router.post('/cours', protect, Cours)

//ETABLISSEMENT
router.post('/inscription', Inscription)
router.post('/eleve', PremEnregistrement)
router.post('/classe', AddClasse)
router.put('/image', upload.single('file'), Imagess)

//TUTEUR
router.post('/tuteur', Tuteur)
//FIN TUTEUR
router.post('/login', login)

module.exports = router
