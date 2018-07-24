var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var ansNum = require('../models/ansNum');
var commNum = require('../models/commNum');
var tag = require('../models/tag');
var user = require('../models/user');
var ques = require('../models/ques');
var db = require('../app');

// import functions
var commonFunctions = require('../controllers/commonFunctions');
var search = require('../controllers/index/search');
var adminControls = require('../controllers/index/adminControls');
var home = require('../controllers/index/home');
var question = require('../controllers/questions/question');
var answer = require('../controllers/questions/answer');
var comment = require('../controllers/questions/comment');

// Get Questions
router.get('/', function(req, res)
{
	ques.find( {}, function( err, data)
	{
		if(err) throw err;
		data.sort(commonFunctions.compareQues);
		res.render('questions', {allQues : data});
	});
});

// Get particular question
router.get('/:qStampId', function(req, res)
{
  var qStampId = req.params.qStampId;
	ques.findOne( { "qStampId" : qStampId }, function( err, data)
	{
		if(err) throw err;
		if(data == null)
		{
			req.flash('error_msg', "Question has been removed!");
      res.redirect('/questions');
		}
		else
		{
			res.render('partQues', {
	                              qStampId : data.qStampId,
	                              qTitle : data.qTitle,
	                              qBody : data.qBody,
	                              askedBy : data.askedBy,
	                              tags : data.tags,
	                            	qUpBy : data.qUpBy,
	                            	qDownBy : data.qDownBy,
	                            	qComm : data.qComm,
	                            	qAns : data.qAns
	                            });
		}
	});
});

// post question
router.post('/ask', function(req, res)
{
	question.ask(req, res);
});

// edit a question
router.post('/editQ', function(req, res)
{
  question.edit(req, res);
});

// delete a question
router.post('/remQ', function(req, res)
{
  question.del(req, res);
});

// upvoting a question
router.post('/quesUp', function(req, res)
{
  question.up(req, res);
});

// downvoting a question
router.post('/quesDown', function(req, res)
{
  question.down(req, res);
});

// undo upvoting a question
router.post('/quesUnUp', function(req, res)
{
  question.undoUp(req, res);
});

// undo downvoting a question
router.post('/quesUnDown', function(req, res)
{
  question.undoDown(req, res);
});

// post answer to a question
router.post('/ans', function(req, res)
{
  answer.ans(req, res);
});

// edit an answer
router.post('/editA', function(req, res)
{
  answer.edit(req, res);
});

// upvoting answer to a question
router.post('/ansUp', function(req, res)
{
  answer.up(req, res);
});

// downvoting answer to a question
router.post('/ansDown', function(req, res)
{
  answer.down(req, res);
});

// accepting answer to a question
router.post('/ansAcc', function(req, res)
{
  answer.accept(req, res);
});

// post comment to a question
router.post('/comm', function(req, res)
{
  comment.comm(req, res);
});

// upvoting comment to a question
router.post('/commUp', function(req, res)
{
  comment.up(req, res);
});

// downvoting comment to a question
router.post('/commDown', function(req, res)
{
  comment.down(req, res);
});

// edit a comment
router.post('/editC', function(req, res)
{
  comment.edit(req, res);
});

module.exports = router;
