require ('dotenv').config()
const express = require('express')
//const rendertron = require('rendertron-middleware');
const sequelize = require('./db')
const PORT = process.env.PORT || 5000
const models = require('./models/models')
//const fileUpload = require('express-fileupload')
const cors = require('cors')
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandleMiddleware')
const path = require('path')
const cookieParser = require("cookie-parser");
global.tweetStat = {}

const app = express()
app.use(cors())
app.use(express.json())
/*
app.use(
    rendertron.makeMiddleware({
        proxyUrl: 'http://192.168.21.194:3000/render',
    })
);

 */
app.use(express.static(path.resolve(__dirname,'static')))
app.use(cookieParser());
//app.use(fileUpload({}))
app.use('/api',router)

// обработка ошибок. последний миддлваре
app.use(errorHandler)
const start = async() =>{
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`))
    }catch(e){
        console.log(e)
    }
}
start()