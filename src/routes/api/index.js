const express = require("express");
const router = express.Router();

module.exports = function () {
  router.use("/frontend", require("./frontend")());   // for website and app
  return router;
};
