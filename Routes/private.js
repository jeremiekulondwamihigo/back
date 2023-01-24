const express = require("express");
const router = express.Router();
const {  getPrivateData } = require("../Controllers/private")
const { protect } = require("../middleware/auth");


router.get("/private", protect, getPrivateData)


module.exports = router;