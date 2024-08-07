const Counter = require('../models/utils/counter');

async function getNextSequence (name, _id) {
    let ret = await Counter.findOneAndUpdate(
        { 
            name: name,
            user_id: _id
        },
        { $inc: { seq: 1 } },
        { new: true }
    );

    if (!ret) {
        ret = await Counter.create({
            name: name,
            user_id: _id,
            seq: 1
        });
    }
    return ret.seq;
 }

 module.exports = getNextSequence;