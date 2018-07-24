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

// answer a question
function ans(req, res)
{
  var qStampId = req.body.qStampId;
  var qTitle = req.body.qTitle;
	var qAnsBy = req.user.username;
	var qAnsBody = req.body.qAnsBody;
	var askedBy = req.body.askedBy;
	var qAnsStampId = Date.now().toString();
  var currentdate = new Date();
  var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
  var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
  var notBy = '<a href="/accounts/' + qAnsBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + qAnsBy + '</button></a>';
  var notMsg = "<i style='color: blue;'>Your question</i> " + notQues + " <i style='color: blue;'>got a new answer by</i> " + notBy + " On " + time;
  var newAns = { "qAnsBy" : qAnsBy,
									"qAnsBody" : qAnsBody,
								  "qAnsStampId" : qAnsStampId };
    commonFunctions.mentionFunc( qAnsBody, "answer", qAnsBy, req.body.qTitle, qStampId );
		mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
		{
      db.collection("users").update(
      {
        "username": qAnsBy
      },
      {
        $inc : { "quesAnswered" : 1 },
      });
			db.collection("ques").update(
			{
				"qStampId" : qStampId
			},
			{
				$push : { "qAns" : newAns }
			}, function()
			{
				var NotStampId = Date.now().toString();
				db.collection("users").update(
			  {
					"username": askedBy
				},
				{
					$push : { "nots" : { "NotStampId" : NotStampId,
														   "notMsg" : notMsg,
														  	"qTitle" : qTitle } }
				}, function()
				{
					res.redirect('/questions/'+qStampId);
				});
			});
		});
}

// edit an answer
function edit(req, res)
{
  var qStampId = req.body.qStampId;
  var qTitle = req.body.qTitle;
	var qAnsBody = req.body.qAnsBody;
  var qAnsStampId = req.body.qAnsStampId;
  if( qAnsBody.length == 0 )
	{
		req.flash('error_msg', 'You have not written any answer!');
		res.redirect('/questions/'+qTitle);
	}
  else
  {
    mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
		{
  		db.collection("ques").update(
  		{
  			"qStampId": qStampId,
        "qAns.qAnsStampId" : qAnsStampId
  		},
  		{
  			$set : { "qAns.$.qAnsBody" : qAnsBody }
  		}, function()
			{
  				res.redirect('/questions/'+qStampId);
  		});
  	});
  }
}

// upvote an answer
function up(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qAnsBy = req.body.qAnsBy;
  var upBy;
  if( req.user == undefined )
  {
    upBy = "";
  }
  else
  {
    upBy = req.user.username;
  }
	var qAnsBody = req.body.qAnsBody;
	var qAnsStampId = req.body.qAnsStampId;
	if( upBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( upBy == qAnsBy )
	{
		req.flash('error_msg', 'You cannot upvote your own answer!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qStampId" : qStampId,
                    "qAns": {
                              "$elemMatch": {
                                  "qAnsStampId": qAnsStampId,
                                  "qAnsUpBy": upBy
                                  }
                                }
                  }, function( err, data)
										{
    									if( data != null )
    									{
    										req.flash('error_msg', 'You have already upvoted this answer!');
    										res.redirect('/questions/'+qStampId);
    									}
    									else
    									{
                        var currentdate = new Date();
                        var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                        var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                        var notBy = '<a href="/accounts/' + upBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + upBy + '</button></a>';
                        var notBody = '<p style="width: auto;">' + qAnsBody + '</p>';
                        var notMsg = "<i style='color: green;'>Your answer</i> " + notBody + " <i style='color: green;'>to question</i> " + notQues + " <i style='color: green;'>got upvoted by</i> " + notBy + " <i style='color: green;'>Karma points increased by 10.</i> On " + time;
                        var notStampId = Date.now().toString();
    										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
												{
    											db.collection("ques").update(
    											{
    												"qStampId" : qStampId,
    												"qAns.qAnsStampId" : qAnsStampId
    											},
    											{
    												$push : { "qAns.$.qAnsUpBy" : upBy }
    											}, function()
													{
    												db.collection("users").update(
    											  {
    													"username": qAnsBy
    												},
    												{
                               $inc : { "points" : 10 },
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

// downvote an answer
function down(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qAnsBy = req.body.qAnsBy;
  var downBy;
  if( req.user == undefined )
  {
    downBy = "";
  }
  else
  {
    downBy = req.user.username;
  }
	var qAnsBody = req.body.qAnsBody;
	var qAnsStampId = req.body.qAnsStampId;
	if( downBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( downBy == qAnsBy )
	{
		req.flash('error_msg', 'You cannot downvote your own answer!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qStampId" : qStampId,
                    "qAns": {
                              "$elemMatch": {
                                  "qAnsStampId": qAnsStampId,
                                  "qAnsDownBy": downBy
                                  }
                              }
                  }, function( err, data)
										{
    									if( data != null )
    									{
    										req.flash('error_msg', 'You have already downvoted this answer!');
    										res.redirect('/questions/'+qStampId);
    									}
    									else
    									{
                        var currentdate = new Date();
                        var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                        var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                        var notBy = '<a href="/accounts/' + downBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + downBy + '</button></a>';
                        var notBody = '<p style="  width: auto;" >' + qAnsBody + '</p>';
                        var notMsg = "<i style='color: red;'>Your answer</i> " + notBody + " <i style='color: red;'>to question</i> " + notQues + " <i style='color: red;'>got downvoted by</i> " + notBy + " <i style='color: red;'>Karma points decreased by 2.</i> On " + time;
                        var notStampId = Date.now().toString();
    										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
												{
    											db.collection("ques").update(
    											{
    												"qStampId" : qStampId,
    												"qAns.qAnsStampId" : qAnsStampId
    											},
    											{
                            $inc : { "points" : -2 },
    												$push : { "qAns.$.qAnsDownBy" : downBy }
    											}, function()
													{
    												db.collection("users").update(
    											  {
    													"username": qAnsBy
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

// accept an answer
function accept(req, res)
{
  var qTitle = req.body.qTitle;
  var askedBy = req.body.askedBy;
  var qStampId = req.body.qStampId;
	var qAnsBy = req.body.qAnsBy;
	var accBy = req.user.username;
	var qAnsBody = req.body.qAnsBody;
	var qAnsStampId = req.body.qAnsStampId;
	ques.findOne( { "qStampId" : qStampId,
                    "qAns": {
                              "$elemMatch": {
                                  "qAnsStampId": qAnsStampId,
                                  "isAccepted": true
                                  }
                                }
                }, function( err, data)
									{
  									if( data != null )
  									{
  										req.flash('error_msg', 'You have already accepted this answer!');
  										res.redirect('/questions/'+qStampId);
  									}
  									else
  									{
                      var currentdate = new Date();
                      var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                      var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                      var notBy = '<a href="/accounts/' + accBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + accBy + '</button></a>';
                      var notBody = '<p style="width: auto;">' + qAnsBody + '</p>';
                      var notMsg = "<i style='color: green;'>Your answer</i> " + notBody + " <i style='color: green;'>to question</i> " + notQues + " <i style='color: green;'>got accepted by</i> " + notBy + " <i style='color: green;'>Karma points increased by 20.</i> On " + time;
                      var notStampId = Date.now().toString();
  										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
											{
  											db.collection("ques").update(
  											{
  												"qStampId" : qStampId,
  												"qAns.qAnsStampId" : qAnsStampId
  											},
  											{
  												$set : { "qAns.$.isAccepted" : true }
  											}, function()
												{
  												db.collection("users").update(
  											  {
  													"username": qAnsBy
  												},
  												{
                             $inc : { "points" : 20, "ansAccepted" : 1 },
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

module.exports =
{
  ans: ans,
  edit: edit,
  up: up,
  down: down,
  accept: accept
}
