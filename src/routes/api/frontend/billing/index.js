const express = require('express');
const router = express.Router();


module.exports = function() {
    router.use('/invoice', require('./invoice'));
    return router
}