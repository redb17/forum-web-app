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

// process seach query
function search(req, res)
{
  var sQues = [];
	var qTags = [];
	if( typeof(req.body.qTags) == "string" )
	{
		qTags.push( req.body.qTags );
	}
	else
	{
		qTags = req.body.qTags;
	}
	qTags.forEach( function( tagF )
  {
		ques.find( { "tags" : tagF }, function( err, found )
    {
      if(found.length > 0)
      {
        found.forEach( function( toBeInQ )
        {
          if(!commonFunctions.contains(sQues, toBeInQ))
          {
            sQues.push( toBeInQ );
          }
  				if( qTags[ qTags.length - 1 ] == tagF && found[ found.length - 1 ]==toBeInQ)
  				{
  					sQues.sort(commonFunctions.compareQues);
  					res.render("searchResults", { allQues : sQues });
  				}
  			});
      }
      else if( qTags[ qTags.length - 1 ] == tagF )
      {
        if( sQues.length > 0)
        {
          sQues.sort(commonFunctions.compareQues);
          res.render('searchResults', { allQues : sQues });
        }
        else
        {
          tag.find( {}, function( err, data )
          {
        		data.sort(commonFunctions.compare);
        		res.render('search', {allTags : data,
                                  errMsg : "Questions with these tags have been removed! Try a different search." });
        	});
        }
      }
		});
	});
};

module.exports =
{
  search: search
}
