const express = require('express')
const router = express.Router()

module.exports = function() {
    router.use('/', require('./estimation'));
    return router;
}