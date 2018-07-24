var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var mongoose = require('mongoose');

// import models
var ansNum = require('../models/ansNum');
var commNum = require('../models/commNum');
var tag = require('../models/tag');
var users = require('../models/user');
var ques = require('../models/ques');

// import functions
var commonFunctions = require('../controllers/commonFunctions');
var search = require('../controllers/index/search');
var adminControls = require('../controllers/index/adminControls');
var home = require('../controllers/index/home');

// Get Homepage
router.get('/', function(req, res)
{
	home.home(req, res);
});

//get user account page
router.get('/accounts/:username', function(req, res)
{
  var username = req.params.username;
  users.findOne({"username" : username}, function(err, data)
  {
		if(data == null)
		{
			req.flash('error_msg', "Username does not exist!");
      res.redirect('/');
		}
		else
		{
			res.render('userInfo', {info : data});
		}
  });
});

// Get ask page
router.get('/ask', ensureAuthenticated, function(req, res)
{
	tag.find( {}, function( err, data )
  {
		data.sort(commonFunctions.compare);
		res.render('ask', {allTags : data});
	});
});

// Get search page
router.get('/search', function(req, res)
{
	tag.find( {}, function( err, data )
  {
		data.sort(commonFunctions.compare);
		res.render('search', {allTags : data});
	});
});

// Get notifications
router.get('/notifications/:username', ensureAuthenticated, function(req, res)
{
	var username = req.params.username;
	if(username == req.user.username)
	{
		users.findOne( { "username" : username}, { "nots" : 1 }, function( err, nots)
	  {
	    var notsArr = nots.nots;
			notsArr.sort(commonFunctions.compareStamp);
			res.render('notifications', { nots : notsArr } );
		});
	}
	else
	{
		req.flash('error_msg', "You cannot access someone else's notifications!");
		res.redirect('/');
	}
});

// Get admin page
router.get('/admin', ensureAuthenticated, function(req, res)
{
	users.find( {}, function( err, data )
  {
		data.sort(commonFunctions.compareUser);
		users.findOne( { "isAdmin" : true }, function( err, currAdminData )
    {
			res.render('admin', {currAdmin : currAdminData.username,
												 	 allUsers : data});
		});
	});
});

// post search
router.post('/search', function(req, res)
{
	search.search(req, res);
});

// admin reward points
router.post('/adminReward', function(req, res)
{
	adminControls.reward(req, res);
});

// admin deduct points
router.post('/adminDeduct', function(req, res)
{
	adminControls.deduct(req, res);
});

// admin change
router.post('/adminChange', function(req, res)
{
	adminControls.change(req, res);
});

// check if a user is logged in
function ensureAuthenticated(req, res, next)
{
	if(req.isAuthenticated())
  {
		return next();
	}
  else
  {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;
