var mongoose = require('mongoose');

var quesSchema = mongoose.Schema({

	qTitle : { type: String, default: null },
	qStampId : { type: String, default: null },
  qBody : { type: String, default: null },
  askedBy : { type: String, default: null },
  tags : [ { type: String, default: null } ],
	qUpBy : [ { type: String, default: null } ],
	qDownBy : [ { type: String, default: null } ],

	qComm : [ { qCommStampId : { type: String, default: null },
						 qCommBody : { type: String, default: null },
	 					 qCommBy : { type: String, default: null },
						 qCommUpBy : [ { type: String, default: null } ],
						 qCommDownBy : [ { type: String, default: null } ] } ],

	qAns : [ { isAccepted : { type: Boolean, default: false }, 
						qAnsStampId : { type: String, default: null },
						qAnsBody : { type: String, default: null },
		 				qAnsBy : { type: String, default: null },
						qAnsUpBy : [ { type: String, default: null } ],
						qAnsDownBy : [ { type: String, default: null } ] } ]

});

var ques = mongoose.model('ques', quesSchema);

module.exports = ques;
