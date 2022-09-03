const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const passport = require('./config/passport');
const session = require('express-session');
const winston = require('winston');
const expressWinston = require('express-winston');
require('dotenv/config');

const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect(process.env.MONGO_DB_CONN_STRING,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }
).then(()=>{
    console.log("connected to db");
});

//configuring the express app
app.use(cookieParser(process.env.SECRET));
app.use(passport.initialize());

//configuring routers
app.use('/test', express.static(__dirname+'/tests'));
app.use('/post', require('./routes/postRoute'));
app.use('/', require('./routes/userRoute'));

app.listen(process.env.PORT, console.log((process.env.ENVIORNMENT==="DEV")?`listening on http://localhost:${process.env.PORT}/`:"https://bll-webd-select.herokuapp.com/"))