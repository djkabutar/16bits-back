const express = require("express");

const router = express.Router();


router.get("/", (req,res)=>{
    res.send("display_profile");
});


module.exports = router;