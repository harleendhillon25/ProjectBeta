const dotenv = require('dotenv/config')
const app = require('./app')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {

const PORT = process.env.PORT || 3000


// add function here to import/receive the client logs?


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

