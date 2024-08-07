const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");

// import dependency
const user_auth = require("../../../../middleware/user_auth");
const User = require("../../../../models/user_management/user");
const config = require("../../../../../config");
const generate_otp = require("../../../../utils/generate_otp");
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

// register user
router.post("/register",async (req, res) => {
    const { username, password, email } = req.body;
    console.log(req.body);

    // check none
    if (!username || !password || !email) {
        return res.status(400).send({error:"please enter all fields"});
    }

    // check is valid email
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).send({error:"invalid email", field: "email"});
    }

    // check is valid username TODO: update username validation
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
        return res.status(400).send({error:"invalid username must contain alphabets and integers only", field: "username"});
    }

    // check password length min 8
    if (password.length < 8) {
        return res.status(400).send({error:"password must be at least 8 characters", field: "password"});
    }

    // check if email exist in db 
    const check_email = await User.findOne({ email: email });
    if (check_email) return res.status(400).send({error: "email already exist", field: "email"});


    // check if username exist in db
    const check_username = await User.findOne({ username: username });
    if (check_username) return res.status(400).send({error: "username already exist", field: "username"});

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // configure otp
    let otp = generate_otp(4);
    let email_otp_expiry = Date.now() + 2 * 60 * 100000;  // 2 minutes

    // create user
    const user = new User({
        username,
        email,
        password: hashedPassword,
        email_otp: otp,
        email_otp_expiry: email_otp_expiry
    });

    // save user
    try {
        const newUser = await user.save();
        return res.send({ data: { _id: newUser._id } });
    }
    catch (err) {
        res.status(400).send({error: "database error occured"});
    }
});

// verify email otp
router.post("/verify_email", async (req, res) => {
    const { _id, otp } = req.body;

    // check none
    if (!_id || !otp) {
        return res.status(400).send({error:"please enter all fields"});
    }

    // check _id valid ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({error:"invalid mongodb _id", field: "_id"});
    }

    // check is valid otp
    if (!/^[0-9]{4}$/.test(otp)) {
        return res.status(400).send({error:"invalid otp must length 4", field: "otp"});
    }

    // check if _id exist in db
    const user = await User.findOne({ _id: _id });

    // check if user exist
    if (!user) return res.status(400).send({error: "user not found", field: "_id"});

    // check if otp is not generated
    if (!user.email_otp || !user.email_otp_expiry) return res.status(400).send({error: "otp not generated"});

    // check if expiery date exceed
    if (user.otp_expiry < Date.now()) return res.status(400).send({error: "otp expired", field: "otp"});

    // check if otp match
    if (user.email_otp === otp) {        

        // check user token if not exist create new token
        if(user.token) {
            try{
                const decoded = jwt.verify(
                    user.token,
                    config.JWT_SECRET
                );
            } catch (e) {
                console.log(e);
                user.token = jwt.sign(
                  { _id: user._id },
                  config.JWT_SECRET,
                  { expiresIn: config.JWT_EXPIRE_IN }
                );
            }
        } else {
            user.token = jwt.sign(
              { _id: user._id },
              config.JWT_SECRET,
              { expiresIn: config.JWT_EXPIRE_IN }
            );
        }

        console.log('user.token', user.token);

        user.email_otp = null;
        user.email_otp_expiry = null;
        user.verify_email = true;

        // save token
        await user.save();

        // send response
        res.send({data : { token: user.token }});

    }else{
        return res.status(400).send({error: "otp not match", field: "otp"});
    }
});

// login user
router.post("/login", async (req, res) => {

    const { username, password } = req.body;

    // check none
    if (!username || !password) {
        return res.status(400).send({error:"please enter all fields"});
    }

    // check is valid username TODO: update username validation
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
        return res.status(400).send({error:"invalid username must contain alphabets and integers only", field: "username"});
    }

    // check password length min 8
    if (password.length < 8) {
        return res.status(400).send({error:"password must be at least 8 characters", field: "password"});
    }

    // check if username exist in db
    const user = await User.findOne({ username: username });
    if (!user) return res.status(400).send({error: "username not found", field: "username"});

    // check if password match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).send({error: "password not match", field: "password"});

    // check user token if not exist create new token
    if(user.token) {
        try{
            const decoded = jwt.verify(
                user.token,
                config.JWT_SECRET
            );
        } catch (e) {
            console.log(e);
            user.token = jwt.sign(
                { _id: user._id },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRE_IN }
            );
        }
    } else {
        user.token = jwt.sign(
            { _id: user._id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRE_IN }
        );
    }

    // save token
    await user.save();

    // send response
    res.send({data : { token: user.token }});
});






router.post("/logout", user_auth, async (req, res) => {
    // TODO : logout user
    // change token to array and store each user token in array
    // so we can logout from each devices seprately

    User.updateOne({ _id: req.user._id }, { token: null }, (err, _) => {
        if (err) {
        return res.status(400).send({ error: err });
        }
        return res.status(200).send({ data: "Successfully logged out" });
    });
});


module.exports = router;