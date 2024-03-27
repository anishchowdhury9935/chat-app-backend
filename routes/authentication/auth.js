const express = require("express");
require("dotenv").config();
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const authorize = require("../../middleware/authorize");
const tryCatch = require("../../helpers/trycatch");
const UserDetail = require("../../models/UserDetail");
const getHashData = require("../../helpers/gethashdata")
const getLoginSession = require("../../helpers/getloginsession");
const getAuthToken = require("../../helpers/getauthtoken");
const jwt = require("jsonwebtoken");
const secret = process.env.REACT_APP_SECRET; // secret key
router.post("/create_user", [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Name must be minimum 5 and maximum 20").isLength({
        min: 5,
        max: 20,
    }), body("password", "Password must be at least 5 characters").isLength({ min: 5, })
], async (req, res) => {
    tryCatch(async () => {
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(400).json({ error: Validation_errors.errors[0].msg });
        }
        const { name, email, password } = req.body
        const isEmailExist = await UserDetail.findOne({ email })
        if (isEmailExist) { return res.status(200).json({ msg: "This email already in use." }) };

        const secPassword = await getHashData(password)
        const loginSession = getLoginSession()
        const signInUser = await UserDetail.create({ name, email, password: secPassword, loginSession }).then(async () => {
            const userId = await UserDetail.findOne({ email }).select(["_id"])
            const authToken = getAuthToken({ user: { id: userId } })
            return res.status(200).json({ authToken, loginSession });
        })
    }, res)
});
router.post("/login", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({ min: 5, })
], async (req, res) => {
    tryCatch(async () => {
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(400).json({ error: Validation_errors.errors[0].msg });
        }
        const { email, password } = req.body
        const isEmailExist = await UserDetail.findOne({ email }).select(['password', "_id"])
        if (!isEmailExist) { return res.status(400).json({ msg: 'Email or password is wrong', shouldProceed: false }) }
        const isPasswordCorrect = await bcrypt.compare(password, isEmailExist.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ msg: 'Email or password is wrong', shouldProceed: false })
        }
        if (isPasswordCorrect) {
            const loginSession = getLoginSession()
            const authToken = getAuthToken({ user: { id: isEmailExist._id } })
            const updateLoginSession = await UserDetail.updateOne({ _id: isEmailExist._id }, { loginSession })
            return res.status(200).json({ authToken, loginSession, shouldProceed: true })
        }
    }, res)
});
router.get("/shouldlogin", authorize, async (req, res) => { // this api insures that the user is logged in with only one device
    tryCatch(async () => {
        const { loginSession } = req.body;
        const isLogin = jwt.verify(loginSession, secret, async (error) => {
            if (error) { return res.status(400).json({ mag: "LoginSession is invalid⚠️", shouldStayLogin: false }); }
            if (!error) {
                const { user } = req.user;
                const userData = await UserDetail.findById(user.id).select(['loginSession', '-_id'])
                const shouldUserLogin = userData.loginSession === loginSession;
                if (!shouldUserLogin) {
                    return res.status(400).json({ shouldStayLogin: false });
                }
                return res.status(200).json({ shouldStayLogin: true });
            }
        })
    }, res)
});

router.post("/logout", authorize, async (req, res) => {
    tryCatch(async () => {
        const { user } = req.user;
        const userData = await UserDetail.updateOne({ _id: user.id }, { loginSession: '' })
        return res.status(200).json({ msg: "User logged out" });
    }, res)
});

router.post("/resetpassword", authorize, [
    body("newPassword", "Password must be at least 5 characters").isLength({ min: 5, })
], async (req, res) => { // this api insures that the user is logged in with only one device
    tryCatch(async () => {
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(400).json({ error: Validation_errors.errors[0].msg });
        }
        const { shouldProceed,newPassword } = req.body;
        if(!shouldProceed){return res.status(400).json({ msg: 'Email or password is wrong' })}
        if(shouldProceed){
            const { user } = req.user;
            const userData = await UserDetail.findById(user.id).select(['password','-_id']);
            const passCompare = await bcrypt.compare(userData.password, newPassword)
            if(!passCompare){return res.status(200).json({msg:"this is your old password please try again" })}
            const secPassword = await getHashData(newPassword);
            const resetUserPassword = await UserDetail.updateOne({_id: user.id},{password: secPassword})
        }
        return res.status(200).json({msg:`your new password is ${newPassword}`})
    }, res)
});

module.exports = router;