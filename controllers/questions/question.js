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

// post a question
function ask(req, res)
{
  var qTagsFinal = [];
	if( typeof( req.body.qTags ) != "undefined" )
	{
		if( typeof(req.body.qTags) == "string" )
		{
			qTagsFinal.push( req.body.qTags );
		}
		else
		{
			qTagsFinal = req.body.qTags;
		}
	}
	var qNewTags = req.body.qNewTags;
	var tmp = commonFunctions.tagsProcess(qNewTags);
	for( i = 0 ; i < tmp.length ; i++)
	{
		qTagsFinal.push( tmp[i] );
	}
	ques.find( { $or : [ { "qTitle" : req.body.qTitle }, { "qBody" : req.body.qBody } ] }, function( err, data )
	{
		if( data.length == 0 )
		{
      mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
			{
        db.collection("users").update(
        {
          "username": req.user.username
        },
        {
          $inc : { "quesAsked" : 1 },
        });
    });
  var qStampId = Date.now().toString();
	commonFunctions.mentionFunc( req.body.qTitle+" "+req.body.qBody, "question", req.user.username, req.body.qTitle, qStampId );
	new ques( { "qStampId" : qStampId,
              "qTitle" : req.body.qTitle,
							"qBody" : req.body.qBody,
							"askedBy" : req.user.username,
							"tags" : qTagsFinal } ).save( function( err, result )
							{
								if(err) throw err;
								qTagsFinal.forEach( function( toBeIn )
								{
									tag.find( { "tag" : toBeIn }, function( err, data )
									{
										if( data.length == 0 )
										{
											new tag( { "tag" : toBeIn }).save( function( err, result )
											{
												if(err) throw err;
												if( qTagsFinal[ qTagsFinal.length - 1 ] == toBeIn )
												{
													res.redirect('/questions');
												}
											});
										}
										else if( qTagsFinal[ qTagsFinal.length - 1 ] == toBeIn )
										{
											res.redirect('/questions');
										}
									});
								});
							});
		}
		else
		{
			req.flash('error_msg', 'Same question has already been asked!');
			res.redirect('/ask');
		}
	});
}

// edit a question
function edit(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var qBody = req.body.qBody;
	mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
	{
		db.collection("ques").update(
		{
			"qStampId": qStampId
		},
		{
			$set : { "qBody" : qBody }
		}, function()
		{
				res.redirect('/questions/'+qStampId);
		});
	});
}

// delete a question
function del(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
  ques.findOne({ qStampId : qStampId }, function(err, data){
    if(req.user.username == data.askedBy)
    {
      mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
    	{
    		db.collection("ques").remove(
    		{
    			"qStampId": qStampId
    		}, function()
    		{
    				res.redirect('/questions');
    		});
    	});
    }
    else
    {
      req.flash('error_msg', "You cannot delete someone else's question!");
      res.redirect('/questions/'+qStampId);
    }
  });

}

// upvote a question
function up(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
  var upBy;
  if( req.user == undefined )
  {
    upBy = "";
  }
  else
  {
    upBy = req.user.username;
  }
	var askedBy = req.body.askedBy;
	if( upBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( upBy == askedBy )
	{
		req.flash('error_msg', 'You cannot upvote your own question!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qUpBy" : upBy,
    	 							"qStampId" : qStampId }, function( err, data)
										{
    									if( data != null )
    									{
    										req.flash('error_msg', 'You have already upvoted this question!');
    										res.redirect('/questions/'+qStampId);
    									}
    									else
    									{
                        var currentdate = new Date();
                        var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                        var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                        var notBy = '<a href="/accounts/' + upBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + upBy + '</button></a>';
                        var notMsg = "<i style='color: green;'>Your question</i> " + notQues + " <i style='color: green;'>got upvoted by</i> " + notBy + "<i style='color: green;'> Karma Points increased by 10.</i> On " + time;
    										var notStampId = Date.now().toString();
                        var currentdate = new Date();
                        var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                        var notMsg = "<i style='color: green;'>Your question</i> "
                                      + notQues + " <i style='color: green;'>got upvoted by</i> " + notBy
                                      + "<i style='color: green;'> Karma Points increased by 10.</i> On " + time;
    										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
												{
    											db.collection("ques").update(
    											{
    												"qStampId": qStampId
    											},
    											{
    												$push : { "qUpBy" : upBy }
    											}, function()
													{
                            ques.findOne(
      											{
      												"qStampId": qStampId
      											},
      											{
      												"qDownBy" : upBy
      											}, function(err, data)
														{
                              var pnts = 10;
                              if(data != null)
                              {
                                pnts = 12;
                              }
                              db.collection("ques").update(
        											{
        												"qStampId": qStampId
        											},
        											{
        												$pull : { "qDownBy" : upBy }
        											}, function(){

      												db.collection("users").update(
      											  {
      													"username": askedBy
      												},
      												{
      													$inc : { "points" : pnts },
      													$push : { "nots" : { "notStampId" : notStampId,
      																						   "notMsg" : notMsg,
      																						  	"qTitle" : qTitle } }
      												}, function()
															{
      													res.redirect('/questions/'+qStampId);
      												});
                            });
    											});
                          });
    										});
    									}
                    });
	}
}

// downvote a question
function down(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
  var downBy;
  if( req.user == undefined )
  {
    downBy = "";
  }
  else
  {
    downBy = req.user.username;
  }
	var askedBy = req.body.askedBy;
	if( downBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( downBy == askedBy )
	{
		req.flash('error_msg', 'You cannot downvote your own question!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qDownBy" : downBy,
	 							    "qStampId" : qStampId }, function( err, data)
										{
    									if( data != null )
    									{
    										req.flash('error_msg', 'You have already downvoted this question!');
    										res.redirect('/questions/'+qStampId);
    									}
    									else
    									{
                        var currentdate = new Date();
                        var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                        var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                        var notBy = '<a href="/accounts/' + downBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + downBy + '</button></a>';
                        var notMsg = "<i style='color: red;'>Your question</i> " + notQues + " <i style='color: red;'>got downvoted by</i> " + notBy + "<i style='color: red;'>. Karma Points decreased by 2.</i> On " + time;
                        var notStampId = Date.now().toString();
    										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
												{
    											db.collection("ques").update(
    											{
    												"qStampId": qStampId
    											},
    											{
    												$push : { "qDownBy" : downBy }
    											}, function()
													{
                            ques.findOne(
                            {
                              "qStampId": qStampId
                            },
                            {
                              "qUpBy" : downBy
                            }, function(err, data)
														{
                              var pnts = -2;
                              if(data != null)
                              {
                                pnts = -12;
                              }
                              db.collection("ques").update(
                              {
                                "qStampId": qStampId
                              },
                              {
                                $pull : { "qUpBy" : downBy }
                              }, function()
															{
      												db.collection("users").update(
      											  {
      													"username": askedBy
      												},
      												{
      													$inc : { "points" : pnts },
      													$push : { "nots" : { "notStampId" : notStampId,
      																						   "notMsg" : notMsg,
      																						  	"qTitle" : qTitle } }
      												}, function()
															{
      													res.redirect('/questions/'+qStampId);
      												});
                            });
                        	});
    										});
    									});
    								}
                  });
	}
}

// undo upvoting a question
function undoUp(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var unUpBy = req.user.username;
	var askedBy = req.body.askedBy;
	if( unUpBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( unUpBy == askedBy )
	{
		req.flash('error_msg', 'You cannot undo-upvote your own question!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qUpBy" : unUpBy,
    	 							"qStampId" : qStampId }, function( err, data)
										{
                      var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                      var notBy = '<a href="/accounts/' + unUpBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + unUpBy + '</button></a>';
											var notStampId = Date.now().toString();
                      var currentdate = new Date();
                      var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                      var notMsg = "<i style='color: red;'>Your question</i> "
                                    + notQues + " <i style='color: red;'>got undo-upvoted by</i> " + notBy
                                    + "<i style='color: red;'> Karma Points decreased by 10.</i> On " + time;
  										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
											{
  											db.collection("ques").update(
  											{
  												"qStampId": qStampId
  											},
  											{
  												$pull : { "qUpBy" : unUpBy }
  											}, function()
												{
  												db.collection("users").update(
  											  {
  													"username": askedBy
  												},
  												{
  													$inc : { "points" : -10 },
  													$push : { "nots" : { "notStampId" : notStampId,
  																						   "notMsg" : notMsg,
  																						  	"qTitle" : qTitle } }
  												}, function()
													{
  													res.redirect('/questions/'+qStampId);
  												});
  											});
  										});
                    });
	}
}

// undo downvoting a question
function undoDown(req, res)
{
  var qTitle = req.body.qTitle;
  var qStampId = req.body.qStampId;
	var unDownBy = req.user.username;
	var askedBy = req.body.askedBy;
	if( unDownBy.length == 0 )
	{
		req.flash('error_msg', 'You need to be logged in to vote!');
		res.redirect('/questions/'+qStampId);
	}
	else if( unDownBy == askedBy )
	{
		req.flash('error_msg', 'You cannot undo-downvote your own question!');
		res.redirect('/questions/'+qStampId);
	}
	else
	{
		ques.findOne( { "qDownBy" : unDownBy,
    	 							"qStampId" : qStampId }, function( err, data)
										{
                      var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
                      var notBy = '<a href="/accounts/' + unDownBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + unDownBy + '</button></a>';
											var notStampId = Date.now().toString();
                      var currentdate = new Date();
                      var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
                      var notMsg = "<i style='color: green;'>Your question</i> "
                                    + notQues + " <i style='color: green;'>got undo-upvoted by</i> " + notBy
                                    + "<i style='color: green;'> Karma Points decreased by 10.</i> On " + time;
  										mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
											{
  											db.collection("ques").update(
  											{
  												"qStampId": qStampId
  											},
  											{
  												$pull : { "qDownBy" : unDownBy }
  											}, function()
												{
  												db.collection("users").update(
  											  {
  													"username": askedBy
  												},
  												{
  													$inc : { "points" : 2 },
  													$push : { "nots" : { "notStampId" : notStampId,
  																						   "notMsg" : notMsg,
  																						  	"qTitle" : qTitle } }
  												}, function()
													{
  													res.redirect('/questions/'+qStampId);
  												});
  											});
  										});
                    });
	}
}

module.exports =
{
  ask: ask,
  edit: edit,
  del: del,
  undoUp: undoUp,
  undoDown: undoDown,
  up: up,
  down: down
}
