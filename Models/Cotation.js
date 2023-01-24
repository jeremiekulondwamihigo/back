const mongoose = require('mongoose')

const model = new mongoose.Schema({
  idInscription: {
    type: mongoose.Types.ObjectId,
    required: true,
    trim: true,
  },
  cotation: {
    type: Array,
  },
})
const schema = mongoose.model('Cotation', model)
module.exports = schema
