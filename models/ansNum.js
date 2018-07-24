var mongoose = require('mongoose');

var ansNum = mongoose.Schema({

	ansNumber : { type: Number, default: 0 }

});

var ansNumber = mongoose.model('ansNum', ansNum);

module.exports = ansNumber;
