const express = require("express");
const router = express.Router();

module.exports = function () {
  router.use("/api", require("./api")());
  return router;
};