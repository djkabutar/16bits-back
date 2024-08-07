const express = require("express");
const mongoose = require("mongoose");

// import dependency
const user_auth = require("../../../../middleware/user_auth");
const Invoice = require("../../../../models/billing/invoice");
const getNextSequence = require("../../../../utils/counter");
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

// get invoice by id passed in query
router.get("/", async (req,res)=>{
    _id = req.query._id;

    // check if _id is valid
    if (!_id) {
        return res.status(400).send({error:"_id is required"});
    }

    // check if _id is ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({error:"_id is not valid"});
    }

    try{
        const invoice = await Invoice.findById(_id);
        if (!invoice) {
            return res.status(404).send({error:"Invoice not found"});
        }
        
        return res.send({ data: invoice });
    }
    catch(err){
        console.log(err);
        res.status(500).send({error:"Server error"});
    }
});

// create invoice
router.post("/", user_auth, async (req,res)=>{

    const { client_email, client_name, list_of_item, discount, event_date, client_phone, date_time } = req.body;

    // check list_of_item is not array and has not elements
    if(!Array.isArray(list_of_item) || list_of_item.length === 0){
        return res.status(400).json({
            message: "list_of_item is not array or has not elements"
        });
    }

    //  calculate total amount from list_of_item
    let invoice_amount = 0;
    let list_of_item_error = false;
    list_of_item.forEach(item=>{
        // check item product_price is number and product_description exist
        if(!Number(item.product_price) || !item.product_description){
            console.log('Number(item.product_price)', Number(item.product_price), 'item.product_description', item.product_description);
            console.log("error", item);
            list_of_item_error = true;
            return;
        }

        invoice_amount += Number(item.product_price);
    });

    if(list_of_item_error){
        return res.status(400).json({
            message: "item product_price is not number or product_description not exist"
        });
    }


    // check is valid email
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(client_email)) {
        return res.status(400).send({error:"invalid email", field: "client_email"});
    }

    
    const user_id = req.user._id;
    const invoice_number = await getNextSequence("invoice_number", user_id);
    console.log("invoice_number", invoice_number);

    // create user
    const invoice = new Invoice({
        invoice_number,
        user_id,
        invoice_amount,
        client_email,
        client_name,
        list_of_item,
        discount,
        event_date,
        client_phone,
        date_time
    });

    try {
        const newInvoice = await invoice.save();
        return res.send({ data: newInvoice });
    }
    catch (err) {
        console.log(err);
        res.status(400).send({error: "database error occured"});
    }
});

// update invoice
router.put("/", user_auth, async (req,res)=>{

    _id = req.query._id;

    // check if _id is valid
    if (!_id) {
        return res.status(400).send({error:"_id is required"});
    }

    // check if _id is ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({error:"_id is not valid"});
    }

    const { client_email, client_name, list_of_item, discount, event_date, client_phone, date_time } = req.body;

    // check list_of_item is not array and has not elements
    if(!Array.isArray(list_of_item) || list_of_item.length === 0){
        return res.status(400).json({
            message: "list_of_item is not array or has not elements"
        });
    }

    //  calculate total amount from list_of_item
    let invoice_amount = 0;
    let list_of_item_error = false;
    list_of_item.forEach(item=>{
        // check item product_price is number and product_description exist
        if(!Number(item.product_price) || !item.product_description){
            console.log('Number(item.product_price)', Number(item.product_price), 'item.product_description', item.product_description);
            console.log("error", item);
            list_of_item_error = true;
            return;
        }

        invoice_amount += Number(item.product_price);
    });

    if(list_of_item_error){
        return res.status(400).json({
            message: "item product_price is not number or product_description not exist"
        });
    }

    // check is valid email
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(client_email)) {
        return res.status(400).send({error:"invalid email", field: "client_email"});
    }

    try{
        const invoice = await Invoice.findByIdAndUpdate(_id, {
            invoice_amount,
            client_email,
            client_name,
            list_of_item,
            discount,
            event_date,
            client_phone,
            date_time
        });
        return res.send({ data: "ok" });
    }
    catch(err){
        console.log(err);
        res.status(500).send({error:"Server error"});
    }
});

// delete invoice by id
router.delete("/", user_auth, async (req,res)=>{
    _id = req.query._id;

    // check if _id is valid
    if (!_id) {
        return res.status(400).send({error:"_id is required"});
    }

    // check if _id is ObjectId
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({error:"_id is not valid"});
    }

    try{
        const invoice = await Invoice.findByIdAndDelete(_id);
        return res.send({ data: invoice });
    }
    catch(err){
        console.log(err);
        res.status(500).send({error:"Server error"});
    }
});


module.exports = router;