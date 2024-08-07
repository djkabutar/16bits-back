const express = require("express");
const router = express.Router();

module.exports = function () {
  router.use("/auth", require("./auth")());
  router.use("/user", require("./user")());
  router.use("/estimation", require("./estimation")());
  router.use("/billing", require("./billing")());
  return router;
};
