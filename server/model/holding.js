const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    username: {
        type : String,
        unique: true,
        required : true
    },
    stockName : {
        type : String,
        required: true
    },
    quantity : {
        type : Number
    },
    price:{
        type: Number
    }
})

const holding = mongoose.model('holding',schema);

module.exports= holding;