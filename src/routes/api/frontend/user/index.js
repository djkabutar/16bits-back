const express = require('express');
const router = express.Router();


module.exports = function() {
    router.use('/display_profile', require('./display_profile'));
    return router
}