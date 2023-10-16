const { hashPassword, comparePassword } = require("../helpers/authHelper");
const UserModel = require("../models/UserModel");
const JWT = require("jsonwebtoken");
const registerController = async (req, res) => {
    try {
        const { name, email, phone, address, answer, password } = req.body;
        ///validation
        if (!name) {
            return res.send({ message: "Name is Required" });
        } if (!email) {
            return res.send({ message: "Email is Required" });
        } if (!phone) {
            return res.send({ message: "Phone is Required" });
        } if (!address) {
            return res.send({ message: "Address is Required" });
        } if (!answer) {
            return res.send({ message: "Answer is Required" });
        } if (!password) {
            return res.send({ message: "Password is Required" });
        }
        //check use
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Registered !! please Login"
            });
        }
        //register user 
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new UserModel({ name, email, phone, address, answer, password: hashedPassword }).save();
        res.status(201).send({
            success: true,
            message: "User Registered SuccessFully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Registration",
            error
        });
    }
};
//POST LOGIN 
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid Email!! or Password",
            });
        }
        //check user 
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email not Registered Yet!"
            });
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password",
            });
        }
        //token 
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.status(200).send({
            success: true,
            message: "Logged in SuccessFully !!!",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Login",
            error
        });
    }
};

//forgot password Controller 

const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email is Required" });
        }
        if (!answer) {
            return res.status(400).send({ message: "Answer is Required" });
        }
        if (!newPassword) {
            return res.status(400).send({ message: "New Password is Required" });
        }
        // check email and answer 
        const user = await UserModel.findOne({ email, answer });
        //validation 
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            });
        }
        const hashedPassword = await hashPassword(newPassword);
        await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
        return res.status(200).send({
            success: true,
            message: "Password Reset SuccessFully !! Now you can login"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something Went Wrong",
            error
        });
    }
};















//Test controller 
const testController = (req, res) => {
    res.send("Protected Route");
};







module.exports = {
    registerController, loginController, testController, forgotPasswordController
};