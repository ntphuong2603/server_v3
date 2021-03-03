const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

require('dotenv').config()

const { checkToken } = require('./middleware/auth')

const mongooUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7oxv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(mongooUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
})

const server = express()
server.use(bodyParser.json())
server.use(cors())
server.use(checkToken)

const user = require('./routes/api/user')
server.use('/api/users', user)

const article = require('./routes/api/article')
server.use('/api/articles', article)


const port = process.env.PORT || 5000

server.listen(port,()=>{
    console.log(`Node server is running on port ${port}`);
})