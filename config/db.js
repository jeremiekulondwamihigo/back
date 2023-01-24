const mongoose = require('mongoose')

const URL = 'mongodb://localhost:27017/node_auth'
const Uri =
  'mongodb+srv://jeremie:fTW7dD8iSZ9k3A82@cluster0.s4t55zp.mongodb.net/?retryWrites=true&w=majority'
const URL_ON_LINE =
  'mongodb+srv://jeremie:unU82Epc6PsmN9jS@cluster0.jdnjp.mongodb.net/?retryWrites=true&w=majority'
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })

  console.log('MongoDB connect')
}

// const { MongoClient, ServerApiVersion } = require('mongodb')
// const uri =
//   'mongodb+srv://jeremie:<password>@cluster0.s4t55zp.mongodb.net/?retryWrites=true&w=majority'
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// })
// client.connect((err) => {
//   const collection = client.db('test').collection('devices')
//   // perform actions on the collection object
//   client.close()
// })

module.exports = connectDB
