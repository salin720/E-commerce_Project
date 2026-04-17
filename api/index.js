require('module-alias/register')

const express = require('express')
const { config } = require('dotenv')
const mongoose = require('mongoose')
const router = require('./routes')
const cors = require('cors')

config()

const app = express()

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://localhost:5173',
        'https://quickcart-front.onrender.com',
        'https://quickcart-cms.onrender.com'
    ],
    credentials: true
}))

const mongoUrl = process.env.MONGO_URL
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(router)

app.use((error, req, res, next) => {
    res.status(error.status || 400).send({
        message: error.message || 'Something went wrong',
        validation: error.validation,
    })
})

app.listen(PORT, async () => {
    console.log(`Server started as http://localhost:${PORT}`)
    console.log('Press Ctrl+C to stop')

    await mongoose.connect(mongoUrl)
    console.log('Mongodb connected')
})