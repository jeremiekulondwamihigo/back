'use strict'
const express = require('express')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
require("dotenv").config()

connectDB()

const readRoute = require('./Routes/Read')
const createRout = require('./Routes/Create')
const updateRoute = require('./Routes/Update')
const privateRoute = require('./Routes/private')
const DeleteRoute = require('./Routes/Delete')

const app = express()
app.use(cors())

app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(bodyParser.json())

app.use('/api/private', privateRoute)
app.use('/bulletin/update', updateRoute)
app.use('/bulletin/read', readRoute)
app.use('/bulletin/create', createRout)
app.use('/bulletin/delete', DeleteRoute)

app.use('/image', express.static(path.resolve(__dirname, 'Images')))

// Error Handler  ()
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send({ nom: 'JEREMIE MIHIGO', postNom: 'JEREMIE' })
})
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log('server running ' + PORT))
