const express = require('express')
const authController = require('../Controller/auth')
const router = express.Router()

router.post("/register",    authController.register)
router.post("/login", authController.login)

router.post('/reset',   authController.postReset)

router.get('/profile', authController.profile)

router.post('/logout', authController.logout)

router.post('/new-password', authController.NewPassword)

module.exports = router;