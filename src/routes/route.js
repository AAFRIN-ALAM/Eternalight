const express = require("express")
const { createUser, login, updateUser, getUserProfile, logout } = require("../controller/userController")
const { authentication } = require("../middleware/authentication")
const router = express.Router()


router.post('/signup', createUser)
router.post('/signin', login)
router.put('/user/:id', authentication, updateUser)
router.get('/user/:id', authentication, getUserProfile)
router.get('/logout', authentication, logout)



module.exports = router