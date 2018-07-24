var mongoose = require('mongoose');

var commNum = mongoose.Schema({

	commNumber : { type: Number, default: 0 }

});

var commNumber = mongoose.model('commNum', commNum);

module.exports = commNumber;
