const mongoose = require("mongoose")

const valeur_Annee = new mongoose.Schema({
    annee: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    code_Annee: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
})

const model = mongoose.model("Annee", valeur_Annee)
module.exports = model
