// import module
const express = require("express");
const cors = require("cors");
const Port = process.env.PORT || 80;
const path = require('path');

// import all routes
const router = require("./src/routes")();

// configure mongodb
require("./db/mongo");

//  configure express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.resolve(__dirname, '../16bits-app/build')));

// log all request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

router.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../16bits-app/build', 'index.html'));
});

// setup routes
app.use(router);

// catch all 404
app.use((req, res, next) => {
    res.status(404).json({
        error: "url not found"
    });
});


app.listen(Port, () => {
    console.log(`server is running at port http://localhost:${Port}`);
});
