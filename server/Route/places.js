const express = require('express')
const foodController = require('../Controller/food')
const router = express.Router()

router.get('/users-food', foodController.all)

router.get('/food/:id', foodController.edit)

router.put('/food', foodController.editFood)

router.delete('/delete/:id', foodController.deleteFood)

router.get("/single/:id", foodController.singleFood)
router.post('/comments/:foodId',   foodController.addComments)

router.get('/allFood', foodController.allFood)

router.delete('/comments/:commentId',  foodController.deleteComment);

router.post('/add-to-favourite', foodController.addToFavourite)

router.delete('/remove-favourite/:favouriteId', foodController.removeFromFavourite)

router.get('/favourite', foodController.allFavourite)

router.get('/all-comments/:foodId', foodController.allComments)

module.exports = router;