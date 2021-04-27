const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    userid: {
        type : String,
        // unique: true,
        required : true
    },
    stockName : {
        type : String,
        required: true
    },
    quantity :{
        type : Number
    },
    price:{
        type: Number
    },
    type:{
        type: String
    },
    date:{
        type: Date,
        default : Date.now
    }
})

const transdb = mongoose.model('transdb',schema);

module.exports= transdb;