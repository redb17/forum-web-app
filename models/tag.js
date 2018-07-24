var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({

	tag : { type: String, default: null }

});

var tag = mongoose.model('tag', tagSchema);

module.exports = tag;
