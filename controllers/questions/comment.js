var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var mongoose = require('mongoose');

// import models
var ansNum = require('../../models/ansNum');
var commNum = require('../../models/commNum');
var tag = require('../../models/tag');
var users = require('../../models/user');
var ques = require('../../models/ques');

var commonFunctions = require('../commonFunctions');

// post a comment to a question
function comm(req, res)
{
  var qStampId = req.body.qStampId;
  var qTitle = req.body.qTitle;
	var qCommBy = req.user.username;
	var qCommBody = req.body.qCommBody;
	var askedBy = req.body.askedBy;
	var qCommStampId = Date.now().toString();
  var currentdate = new Date();
  var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
  var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
  var notBy = '<a href="/accounts/' + qCommBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + qCommBy + '</button></a>';
  var notMsg = "<i style='color: orange;'>Your question</i> " + notQues + " <i style='color: orange;'>got a new comment by</i> " + notBy + " On " + time;
  var newComm = { "qCommBy" : qCommBy,
									"qCommBody" : qCommBody,
								  "qCommStampId" : qCommStampId };
  commonFunctions.mentionFunc( qCommBody, "comment", qCommBy, req.body.qTitle, qStampId );
	mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
	{
    db.collection("users").update(
    {
      "username": qCommBy
    },
    {
      $inc : { "commMade" : 1 },
    });
		db.collection("ques").update(
		{
			"qStampId" : qStampId
		},
		{
			$push : { "qComm" : newComm }
		}, function()
		{
			var notStampId = Date.now().toString();
			db.collection("users").update(
		  {
				"username": askedBy
			},
			{
				$push : { "nots" : { "notStampId" : notStampId,
													   "notMsg" : notMsg,
													  	"qTitle" : qTitle } }
			}, function()
			{
				res.redirect('/questions/'+qStampId);
			});
		});
	});
}

// edit a comment
function edit(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qCommBody = req.body.qCommBody;
  var qCommStampId = req.body.qCommStampId;
  if( qCommBody.length == 0 )
	{
		req.flash('error_msg', 'You have not written any comment!');
		res.redirect('/questions/'+qStampId);
	}
  else
  {
    mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
		{
  		db.collection("ques").update(
  		{
  			"qStampId": qStampId,
        "qComm.qCommStampId" : qCommStampId
  		},
  		{
  			$set : { "qComm.$.qCommBody" : qCommBody }
  		}, function()
			{
  				res.redirect('/questions/'+qStampId);
  		});
  	});
  }
}

// upvote a comment
function up(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qCommBy = req.body.qCommBy;
  var upBy;
  if( req.user == undefined )
  {
    upBy = "";
  }
  else
  {
    upBy = req.user.username;
  }
	var qCommBody = req.body.qCommBody;
	var qCommStampId = req.body.qCommStampId;
	if( upBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( upBy == qCommBy )
	{
		req.flash('error_msg', 'You cannot upvote your own comment!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qStampId" : qStampId,
                    "qComm": {
                              "$elemMatch": {
                                  "qCommStampId": qCommStampId,
                                  "qCommUpBy": upBy
                                  }
                              }
                  }, function( err, data)
										 {
      									if( data != null )
      									{
      										req.flash('error_msg', 'You have already upvoted this comment!');
      										res.redirect('/questions/'+qStampId);
      									}
      									else
      									{
                          var currentdate = new Date();
                          var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                          var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                          var notBy = '<a href="/accounts/' + upBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + upBy + '</button></a>';
                          var notBody = '<p style=" width: auto;" >' + qCommBody + '</p>';
                          var notMsg = "<i style='color: green;'>Your comment</i> " + notBody + " <i style='color: green;'>on question</i> " + notQues + " <i style='color: green;'>got upvoted by</i> " + notBy + " On " + time;
                          var notStampId = Date.now().toString();
      										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
  												{
      											db.collection("ques").update(
      											{
      												"qStampId" : qStampId,
      												"qComm.qCommStampId" : qCommStampId
      											},
      											{
      												$push : { "qComm.$.qCommUpBy" : upBy }
      											}, function()
  													{
      												db.collection("users").update(
      											  {
      													"username": qCommBy
      												},
      												{
      													$push : { "nots" : { "notStampId" : notStampId,
      																						   "notMsg" : notMsg,
      																						  	"qTitle" : qTitle } }
      												}, function()
  														{
      													res.redirect('/questions/'+qStampId);
      												});
      											});
      										});
      									}
                  		});
	}
}

// downvote a comment
function down(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qCommBy = req.body.qCommBy;
  var downBy;
  if( req.user == undefined )
  {
    downBy = "";
  }
  else
  {
    downBy = req.user.username;
  }
	var qCommBody = req.body.qCommBody;
	var qCommStampId = req.body.qCommStampId;
	if( downBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( downBy == qCommBy )
	{
		req.flash('error_msg', 'You cannot downvote your own comment!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qStampId" : qStampId,
                    "qComm": {
                              "$elemMatch": {
                                  "qCommStampId": qCommStampId,
                                  "qCommDownBy": downBy
                                  }
                              }
                   }, function( err, data)
									 		{
	    									if( data != null )
	    									{
	    										req.flash('error_msg', 'You have already downvoted this comment!');
	    										res.redirect('/questions/'+qStampId);
	    									}
	    									else
	    									{
                          var currentdate = new Date();
                          var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
	                        var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
	                        var notBy = '<a href="/accounts/' + downBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + downBy + '</button></a>';
	                        var notBody = '<p style="width: auto;" >' + qCommBody + '</p>';
	                        var notMsg = "<i style='color: red;'>Your comment</i> " + notBody + " <i style='color: red;'>on question</i> " + notQues + " <i style='color: red;'>got downvoted by</i> " + notBy + " On " + time;
	                        var notStampId = Date.now().toString();
	    										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
													{
	    											db.collection("ques").update(
	    											{
	    												"qStampId" : qStampId,
	    												"qComm.qCommStampId" : qCommStampId
	    											},
	    											{
	    												$push : { "qComm.$.qCommDownBy" : downBy }
	    											}, function()
														{
	    												db.collection("users").update(
	    											  {
	    													"username": qCommBy
	    												},
	    												{
	    													$push : { "nots" : { "notStampId" : notStampId,
	    																						   "notMsg" : notMsg,
	    																						  	"qTitle" : qTitle } }
	    												}, function()
															{
	    													res.redirect('/questions/'+qStampId);
	    												});
	    											});
	    										});
	    									}
                  		});
	}
}

module.exports =
{
  comm: comm,
  edit: edit,
  up: up,
  down: down
}
