const mongoose = require("mongoose");


const invoiceSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    invoice_number: {
        type: Number,
        unique: true,
        required: true
    },
    invoice_amount: {
        type: Number,
        required: true
    },
    client_email: {
        type: String
    },
    client_name: {
        type: String
    },
    list_of_item: [{
        // product_name: {
        //     type: String
        // },
        product_description: {
            type: String
        },
        product_price: {
            type: Number
        },
        // product_quantity: {
        //     type: Number
        // },
    }],
    discount: {
        type: String
    },
    event_date: {
        type: Date
    },
    client_phone: {
        type: String
    },
    date_time: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
}
);


const invoice = new mongoose.model("invoice", invoiceSchema);
module.exports = invoice;
