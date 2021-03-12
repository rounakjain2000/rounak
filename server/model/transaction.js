const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    date:{
        type: Date
    },
    username: {
        type : String,
        unique: true,
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
    }
})

const transdb = mongoose.model('transdb',schema);

module.exports= transdb;