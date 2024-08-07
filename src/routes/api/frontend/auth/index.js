const express = require('express');
const router = express.Router();


module.exports = function() {
    router.use('/user', require('./user'));
    return router
}