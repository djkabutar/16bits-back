const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// import dependency
const user_auth = require("../../../../middleware/user_auth");
const Estimation = require("../../../../models/estimation/estimation");
const getNextSequence = require("../../../../utils/counter");
const ObjectId = mongoose.Types.ObjectId;

// get estimation by id
router.get("/", async (req, res) => {
    _id = req.query._id;
    if (!_id) return res.status(400).send({ error: "please enter _id" });

    if (!ObjectId.isValid(_id)) return res.status(400).send({ error: "invalid _id" });

    try {
        const estimation = await Estimation.findById(_id);
        if (!estimation) return res.status(404).send({ error: "estimation not found" });
        return res.status(200).send(estimation);
    } catch (error) {
        return res.status(500).send({ error: "error occured" });
    }
});

// create estimation
router.post("/", user_auth, async (req, res) => {
    const {client_email, client_name, list_of_item, discount, event_date, client_phone, date_time} = req.body;

    // check list_of_item is not array and has not elements
    if (!Array.isArray(list_of_item) || list_of_item.length == 0) {
        return res.status(400).json({
            message: "List of Item is not an array"
        });
    }

    // calculate total amount from list_of_item
    let estimation_amount = 0;
    let list_of_item_error = false;
    list_of_item.forEach(item => {
        // check if product_price is number and product_description exists
        if(!Number(item.product_price) || !item.product_description) {
            list_of_item_error = true;
            return;
        }

        estimation_amount += Number(item.product_price);
    });

    if (list_of_item_error) {
        return res.status(400).json({
            message: "Item product_price is not properly given"
        });
    }

    // check for valid email
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(client_email)) {
        return res.status(400).json({
            error: "Invalid Email Id",
            field: "client_email"
        });
    }

    const user_id = req.user._id;
    const estimation_number = await getNextSequence("estimation_number", user_id);

    // create user
    const estimation = new Estimation({
        estimation_number,
        user_id,
        estimation_amount,
        client_email,
        client_name,
        list_of_item,
        discount,
        event_date,
        client_phone,
        date_time
    });

    try {
        const newEstimation = await estimation.save();
        return res.json({
            data: newEstimation
        });
    } catch (err) {
        return res.status(400).json({
            error: "Database error occured"
        });
    }
});

// Update Estimation
router.put("/", user_auth, async (req, res) => {
    _id = req.query._id;

    // Check if id is valid
    if (!_id) {
        return res.status(400).json({
            error: "_id is required"
        });
    }

    // Check if id is ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).json({
            error: "_id is not valid"
        });
    }

    const { client_email, client_name, list_of_item, discount, event_date, client_phone, date_time } = req.body;

    // Check list_of_item is not array and has not elements
    if (!Array.isArray(list_of_item) || list_of_item.length == 0) {
        return res.status(400).json({
            message: "list_of_time is not array or has not elements"
        });
    }

    // calculate total amount from list_of_item
    let estimation_amount = 0;
    let list_of_item_err = false;
    list_of_item.forEach( item => {
        // Check item product_price is number and product_description exist
        if (!Number(item.product_price) || !item.product_description) {
            list_of_item_err = true;
            return;
        }

        estimation_amount += Number(item.product_price);
    });

    if (list_of_item_err) {
        return res.status(400).json({
            message: "item product_price is not number or product_description not exist"
        });
    }

    // Check if email is valid
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(client_email)) {
        return res.status(400).json({
            error: "Invalid Email Id",
            field: "client_email"
        });
    }

    try {
        const estimation = await Estimation.findByIdAndUpdate(_id, {
            estimation_amount,
            client_email,
            client_name,
            list_of_item,
            discount,
            event_date,
            client_phone,
            date_time
        });
        return res.json({
            data: estimation
        });
    } catch (err) {
        return res.status(500).json({
            error: "Server error occured"
        });
    }
});

// delete estimation by id
router.delete("/", user_auth, async (req, res) => {
    _id = req.query._id;

    // Check if id is valid
    if (!_id) {
        return res.status(400).json({
            error: "_id is required"
        });
    }

    // Check if id is ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).json({
            error: "_id is not valid"
        });
    }

    try {
        const estimation = await Estimation.findByIdAndDelete(_id);
        return res.json({
            data: estimation
        });
    } catch (err) {
        return res.status(500).json({
            error: "Server error occured"
        });
    }
});

module.exports = router;