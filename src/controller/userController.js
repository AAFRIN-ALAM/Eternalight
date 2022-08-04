const userModel = require("../model/userModel")
const { isValid } = require("../validator/validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")



//******************************************** Sign Up API ***************************************************

const createUser = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, msg: "Bad request, No data provided." }) };

        let { fullName, email, password } = data

        // Validation for Name :
        if (!isValid(fullName)) { return res.status(400).send({ status: false, msg: "fullName is required" }) }

        // Email validation :
        if (!isValid(email)) { return res.status(400).send({ status: false, msg: "email is required" }) }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) { return res.status(400).send({ status: false, msg: "Please provide a valid email" }) };

        // Duplicate email check :
        let duplicateEmail = await userModel.findOne({ email: email })
        if (duplicateEmail) return res.status(400).send({ status: false, msg: 'Email is already exist' })

        // Password Validation :
        if (!isValid(password)) { return res.status(400).send({ status: false, msg: "password is required" }) }
        if (!(password.length >= 8 && password.length <= 15)) { return res.status(400).send({ status: false, message: "Password length should be 8 to 15 characters" }) }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) { return res.status(400).send({ status: false, msg: "please provide atleast one uppercase letter ,one lowercase, one character and one number " }) }

        // Hashing the password before storing in the database :
        let securePassword = await bcrypt.hash(password, 4)
        data.password = securePassword

        // create a user after checking all the validation :
        let userCreated = await userModel.create(data);
        res.status(201).send({ status: true, message: "User created successfully", data: userCreated })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}



//******************************************** Sign in API ***************************************************

const login = async function (req, res) {
    try {
        // Getting data from user :
        const data = req.body
        const { email, password } = data

        // Input Validation :
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "Bad Request, No data provided" })

        // Email Validation :
        if (!isValid(email)) { return res.status(400).send({ status: false, msg: "Email is required" }) }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email.trim()))) { return res.status(400).send({ status: false, msg: "Please enter a valid Email." }) };

        // Password Validation :
        if (!isValid(password)) { return res.status(400).send({ status: false, msg: "Password is required" }) };
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) { return res.status(400).send({ status: false, msg: "Email or Password is incorrect" }) }

        // Searching provided email in database :
        let user = await userModel.findOne({ email: email })
        if (!user) { return res.status(400).send({ status: false, msg: "Email or Password is incorrect" }) }

        // Compare the provided paasword using bcrypt : 
        let checkPass = user.password
        let checkUser = await bcrypt.compare(password, checkPass)
        if (checkUser == false) return res.status(400).send({ status: false, msg: "Email or Password is incorrect" })

        // Token generate using JWT :
        const token = jwt.sign({
            userId: user._id,
        }, "secret-key", { expiresIn: "120m" })
        res.cookie("token", token, {
            maxAge: 3.6e+6,
            httpOnly: true
        })
        return res.status(200).send({ status: true, msg: "You are successfully logged in" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}




//******************************************** Update User API ***************************************************

const updateUser = async (req, res) => {
    try {
        // Taking user id from url or params :
        let userId = req.params.id;

        // Authorisation :
        if (req.userId != userId) { return res.status(403).send({ status: false, msg: "You are not Authorised to update this user" }) }

        // Data to update, getting from user :
        let data = req.body
        let { fullName, password } = data

        // full name Validation :
        if (fullName == 0) { return res.status(400).send({ status: false, msg: "First name cannot be empty" }) }

        // Password Validation :
        if (password == 0) { return res.status(400).send({ status: false, msg: "Password Cannot be empty" }) }
        if (password) if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password.trim()))) { return res.status(400).send({ status: false, msg: "Please provide a valid password,   Example :Abcd@452" }) }

        // Update User :
        let updatedUser = await userModel.findOneAndUpdate({ _id: userId },
            {
                $set:
                {
                    fullName: fullName,
                    password: password
                }
            }, { new: true })
        return res.status(201).send({ status: true, msg: "User Updated Succesfully", updatedUser: updatedUser })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//****************************************  Get User Details API *************************************************

const getUserProfile = async (req, res) => {
    try {
        // Getting Details from URL or params
        let userId = req.params.id;

        // Authorisation
        if (req.userId != userId) { return res.status(403).send({ status: false, msg: "You are not Authorised to fetch the data" }) }

        // User Validation with fetch the Data
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) return res.status(404).send({ status: false, message: "No user found according to your search" })

        // Fetch Data
        let getUser = await userModel.findOne({ _id: userId })
        return res.status(200).send({ status: true, message: "User Profile Details", data: getUser });
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//******************************************** Logout API ***************************************************

const logout = async function (req, res) {
    try {
        res.clearCookie("token")
        return res.status(200).send({ status: true, msg: "logout successfully" })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports = {
    createUser,
    login,
    updateUser,
    getUserProfile,
    logout
}