const UserModel = require('../Models/UserModel')
const otp_generator = require('otp-generator')
const bcrypt = require('bcrypt')
const sendEmail = require('../Email Service/Email')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {

    try {

        console.log(req.body);


        const isUserExisting = await UserModel.findOne({ email: req.body.email })

        if (isUserExisting) {
            console.log("user already exists");
            return res.status(400).json({ message: `User with ${req.body.email} already exists` })
        }


        const verficationToken = otp_generator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false
        })

        const expires = new Date

        expires.setMinutes(expires.getMinutes() + 5)

        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = await UserModel({
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            verficationToken: {
                token: verficationToken,
                expires: expires
            }
        })

        console.log(newUser);

        await newUser.save()


        const emailBody = `<p>Please click on the link to verify your account. <b>https://mern-auth-v4lx.onrender.com/user/verify/${verficationToken}</b></p>`

        const subject = `Verification Email`

        await sendEmail(req.body.email, subject, emailBody)


        res.json({ message: "Verfication link sent to your email." });
    } catch (error) {
        res.json({ message: "Something went wrong" })
    }

}



const login = async (req, res) => {

    try {
        console.log(req.body);


        const isUserExisting = await UserModel.findOne({ email: req.body.email })



        console.log(isUserExisting);


        if (!isUserExisting) {

            if (req.body.autoGenerated) {

                const password = otp_generator.generate(12) + "!1"


                const hashedPassword = await bcrypt.hash(password, 10)
                const newUser = await UserModel({
                    email: req.body.email,
                    username: req.body.username,
                    password: hashedPassword,
                    isVerified: true

                })

                console.log(newUser);

                await newUser.save()

                const jwtPayload = {
                    id: newUser._id
                }


                const token = jwt.sign(jwtPayload, process.env.SECRET, { expiresIn: '10m' })

                const emailBody = `<p>Account Created Successfully. Your password is <b>${password}<b> <br> Please Change it. </p>`

                const subject = `Account Created VIA Social`

                await sendEmail(req.body.email, subject, emailBody)

                return res.status(200).json({ message: "Logged in via social", token })

            }

            return res.status(400).json({ message: `User with ${req.body.email} don't exists` })
        }


        if (!isUserExisting.isVerified) {
            return res.status(400).json({ message: `User is not verified, Please click the link in your email to verify` })

        }

        if (!req.body.autoGenerated) {



            const isPasswordCorrect = await bcrypt.compare(req.body.password, isUserExisting.password)

            if (!isPasswordCorrect) {
                return res.status(400).json({ message: `Invalid Credentials` })

            }
        }

        // creata a JWT


        const jwtPayload = {
            id: isUserExisting._id
        }


        const token = jwt.sign(jwtPayload, process.env.SECRET, { expiresIn: '12h' })


        console.log(token);



        res.json({ message: `User Logged in successfully`, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Something went wrong` })
    }

}


const verifyUser = async (req, res) => {
    try {
        console.log(req.params);

        const { token } = req.params

        const isTokenValid = await UserModel.findOne(
            {
                'verficationToken.token': token,
                'verficationToken.expires': { $gt: new Date() }
            })




        console.log(isTokenValid);





        if (!isTokenValid) {
            return res.send(`<p>Token Invalid or Expired.</p> <a href="http://localhost:3000/user/resendVerification/${token}">Resend Verification Mail</a>`)

        }

        if (isTokenValid.isVerified) {
            return res.send("Account already verified successfully. Please Login")

        }

        isTokenValid.isVerified = true

        await isTokenValid.save()

        res.send("Account verified successfully")
    } catch (error) {
        console.log(error);
    }
}



const resendVerification = async (req, res) => {
    try {


        const { token } = req.params

        const user = await UserModel.findOne(
            {
                'verficationToken.token': token,
                'isVerified': false
            })



        const verficationToken = otp_generator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false
        })

        const expires = new Date

        expires.setMinutes(expires.getMinutes() + 5)


        user.verficationToken = {
            expires: expires,
            token: verficationToken
        }


        await user.save()


        const emailBody = `<p>Please click on the link to verify your account. <b>http://localhost:3000/user/verify/${verficationToken}</b> Valid For 5 mins.</p>`

        const subject = `Verification Email`

        await sendEmail(user.email, subject, emailBody)



        res.send('Please check your email for a new verification link')

    } catch (error) {
        res.send('Something went wrong')

    }
}


const updateUser = async (req, res) => {
    try {

        const { id } = req.decodedData

        const { type } = req.body

        console.log(id);
        console.log(req.body);

        const user = await UserModel.findById(id)

        console.log(user);

        switch (type) {
            case "username": {
                user.username = req.body.newUserData.username
                await user.save()

                const emailBody = `<p>Username updated.</p>`

                const subject = `User Updated Successfully`

                await sendEmail(user.email, subject, emailBody)
                break
            }

            case "email": {
                user.email = req.body.newUserData.email
                await user.save()

                const emailBody = `<p>Email updated.</p>`

                const subject = `Email Updated Successfully`

                await sendEmail(user.email, subject, emailBody)
                break
            }

            case "password": {

                const hashedPassword = await bcrypt.hash(req.body.newUserData.password, 10)
                user.password = hashedPassword
                await user.save()

                const emailBody = `<p>Password updated.</p>`

                const subject = `Password Updated Successfully`

                await sendEmail(user.email, subject, emailBody)
                break
            }

        }

        console.log(user);

        res.json({ message: "User Updated Successfully" })
    } catch (error) {
        res.json({ message: `Something went wrong` })
    }

}



const forgotPassword = async (req, res) => {

    try {


        console.log(req.body);
        const isUserExisting = await UserModel.findOne({ email: req.body.email })

        if (!isUserExisting) {
            return res.status(400).json({ message: `User with ${req.body.email} don't exists` })
        }

        if (req.body.isOTPVerified) {

            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            isUserExisting.password = hashedPassword

            await isUserExisting.save()


            const emailBody = `<p>Your password reset was successful.</p>`

            const subject = `Password Reset Successfully`

            await sendEmail(isUserExisting.email, subject, emailBody)

            return res.status(200).json({ message: "Password Reset Successfully" })

        }

        const OTP = otp_generator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false
        })

        const expires = new Date

        expires.setMinutes(expires.getMinutes() + 5)

        isUserExisting.OTP_VerficationToken = {
            OTP,
            expires
        }


        await isUserExisting.save()


        const emailBody = `<p>Your OTP for password reset request is <b>${OTP}</b> <br> OTP expires in 5 mins</p>`

        const subject = `Password Reset Email`

        await sendEmail(isUserExisting.email, subject, emailBody)

        res.status(200).json({ message: "OTP Sent Successfully" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Something went wrong` })
    }
}



const verifyPasswordOTP = async (req, res) => {

    try {

        console.log(req.body);
        const { OTP } = req.body

        console.log(OTP)

        const isOtpValid = await UserModel.findOne(
            {
                'OTP_VerficationToken.OTP': OTP,
                'OTP_VerficationToken.expires': { $gt: new Date() }
            })

        console.log(isOtpValid);

        if (!isOtpValid) {
            return res.status(400).json({ message: "OTP Expired" })
        }

        res.status(200).json({ message: "OTP Verified Successfully" })
    } catch (error) {

        res.status(500).json({ message: `Something went wrong` })
    }

}


const getUser = async (req, res) => {
    try {

        console.log(req.decodedData);

        const { id } = req.decodedData


        const data = await UserModel.findById(id)

        console.log(data);

        const user = {
            email: data.email,
            username: data.username
        }


        res.json({ user: user });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
}


module.exports = { register, login, verifyUser, resendVerification, updateUser, forgotPassword, verifyPasswordOTP, getUser }