const jwt = require("jsonwebtoken");

// import dependency
const config = require("../../config");
const User = require('../models/user_management/user');

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
    // req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({error:"A token is required for authentication"});
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    console.log("decoded", decoded);

    User.findOne({_id: decoded._id}, (err, user) => {
      if (err) {
          return res.status(403).send({error:"Server error"});
      }
      console.log("user", user);
      if (!user) {
          return res.status(403).send({error:"user not found"});
      }
      if (user.token !== token) {
          return res.status(403).send({error:"Invalid token"});
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.log("err", err);
    return res.status(401).send({error:"Invalid Token"});
  }
};

module.exports = verifyToken;


// TODO:Add block verify here