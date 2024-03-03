const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require("path")
const cookieParser = require('cookie-parser')
const Food = require('./Models/Food')
const imageDownloader = require('image-downloader')
const app = express();
const jwt = require('jsonwebtoken')
require('dotenv').config();
const multer = require('multer')
const authController = require('./Route/auth')
const foodController = require('./Route/places')

const fs = require('fs')
app.use(express.json())
app.use('/uploads',express.static(__dirname + '/uploads') )
const allowedOrigins = ['http://localhost:3000','http://localhost:3001' ];



app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(cookieParser())

  const DB = "mongodb+srv://vaqsi24:juventus1990@shop.31bo5lw.mongodb.net/foodrecipe?w=majority";

  app.use(authController)
  app.use(foodController)
  app.post('/upload-by-link', async(req, res, next) => {
    const {link} = req.body
    const newName = Date.now() + ".jpg"
   await imageDownloader.image({
      url:link,
      dest:__dirname + '/uploads/' + newName
    })
    res.json(newName)
  })
  
  const photosMiddleWare = multer({dest:'uploads'})

  app.post('/upload', photosMiddleWare.array("photos", 50), (req, res, next) => {
    const uploadedFile = []
    for( let i = 0; i < req.files.length; i ++ ) {
      const {path, originalname} = req.files[i]
    const parts =  originalname.split('.')
    const ext = parts[parts.length - 1]
    const newPath = path + '.' + ext
      fs.renameSync(path, newPath)
      uploadedFile.push(newPath)
    }
  
    res.json(uploadedFile)
  })

  app.post('/food',  (req, res) => {
    const { token } = req.cookies;
    const {
      title,ingredients,addedPhotos,instructions,time,category
      
    } = req.body;
    jwt.verify(token, "ILOVEANNA", {}, async (err, userData) => {
  const FoodDoc =  await  Food.create({
        owner: userData.id,
        title,ingredients,instructions,time,photos:addedPhotos,category
      })
  
      res.json(FoodDoc)
    });
  })
  
  mongoose
  .connect(DB)
  .then(result => {
    app.listen(4500);
    console.log('working');
  })
  .catch(err => {
    console.log(err);
  });