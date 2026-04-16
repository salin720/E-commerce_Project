require('module-alias/register')

const express = require('express')
const {config} = require('dotenv')
const mongoose = require('mongoose')
const router = require('./routes')
const cors = require('cors')

config()

const app = express()

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://localhost:5173'
    ],
    credentials: true
}))

const mongoUrl = process.env.MONGO_URL

app.use(express.json())
app.use(express.urlencoded())

app.use(router)

app.use((error, req, res, next) => {
    res.status(error.status || 400)
        .send({
            message: error.message || 'Something went wrong',
            validation: error.validation,
        })
})

app.listen(5000, async() => {
    console.log('Server started as http://localhost:5000')
    console.log('Press Ctrl+C to stop')

    await mongoose.connect(mongoUrl)
    console.log('Mongodb connected')
})