const { register, login, verifyUser, resendVerification, updateUser, forgotPassword, verifyPasswordOTP, getUser } = require('../User Controller/UserController');
const JWT_AUTH = require('../middleware/JWT_AUTH');

const router = require('express').Router();



router.post("/register", register)

router.post("/login", login)

router.put("/updateUser", JWT_AUTH, updateUser)

router.get("/verify/:token", verifyUser)

router.get("/resendVerification/:token", resendVerification)

router.post("/resetPassword", forgotPassword)

router.post("/verifyPasswordOTP", verifyPasswordOTP)

router.get("/", JWT_AUTH, getUser)




module.exports = router