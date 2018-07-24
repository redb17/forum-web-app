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

// reward points
function reward(req, res)
{
  var rewUser = req.body.rewUser;
	var rewPoints = parseInt( req.body.rewPoints );
	var rewBy = req.user.username;
  var currentdate = new Date();
  var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
  var notBy = '<a href="/accounts/' + rewBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + rewBy + '</button></a>';
  var notMsg = "<i style='color: green;'>You have been awarded " + rewPoints + " karma points by</i> " + notBy + " On " + time;
  var NotStampId = Date.now().toString();
	mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
  {
		db.collection("users").update(
	  {
			"username": rewUser
		},
		{
			$inc : { "points" : rewPoints },
			$push : { "nots" : { "NotStampId" : NotStampId,
												   "notMsg" : notMsg } }
		}, function()
    {
			res.redirect('/admin');
		});
	});
}

// deduct points
function deduct(req, res)
{
  var dedUser = req.body.dedUser;
	var dedPoints = parseInt( req.body.dedPoints );
	var dedBy = req.user.username;
  var currentdate = new Date();
  var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
  var notBy = '<a href="/accounts/' + dedBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + dedBy + '</button></a>';
  var notMsg = "<i style='color: red;'>You got " + dedPoints + " karma points deducted by</i> " + notBy + " On " + time;
  var notStampId = Date.now().toString();
	mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
  {
		db.collection("users").update(
	  {
			"username": dedUser
		},
		{
			$inc : { "points" : - dedPoints },
			$push : { "nots" : { "notStampId" : notStampId,
												   "notMsg" : notMsg } }
		}, function()
    {
			res.redirect('/admin');
		});
	});
}

// change admin
function change(req, res)
{
  var newAdmin = req.body.newAdmin;
	var changeBy = req.user.username;
	if( newAdmin == changeBy )
	{
		req.flash('error_msg', 'You are already the Admin!');
		res.redirect('/admin');
	}
	else
	{
    var currentdate = new Date();
    var time = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + " at " + currentdate.getHours() + ":" + currentdate.getMinutes() + '.';
    var notBy = '<a href="/accounts/' + changeBy + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + changeBy + '</button></a>';
    var notMsg = "<i style='color: green;'>You have been made admin by</i> " + notBy + " On " + time;
    var notStampId = Date.now().toString();
		mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
    {
			db.collection("users").update(
		  {
				"username": newAdmin
			},
			{
				$set : { "isAdmin" : true },
				$push : { "nots" : { "notStampId" : notStampId,
													   "notMsg" : notMsg } }
			}, function()
      {
				db.collection("users").update(
			  {
					"username": changeBy
				},
				{
					$set : { "isAdmin" : false }
				}, function()
        {
					res.redirect('/admin');
				});
			});
		});
	}
}

module.exports =
{
  reward: reward,
  deduct: deduct,
  change: change
}
