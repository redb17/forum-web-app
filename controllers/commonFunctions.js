var mongoose = require('mongoose');

// compare tags for sorting
function compare(a, b)
{
  if (a.tag < b.tag)
  {
      return -1;
  }
	else if (a.tag > b.tag)
  {
      return 1;
  }
	return 0;
}

// compare usernames for sorting
function compareUser(a, b)
{
  if (a.username < b.username)
  {
      return -1;
  }
	else if (a.username > b.username)
  {
      return 1;
  }
	return 0;
}

// compare notification stamps for sorting
function compareStamp(va, vb)
{
  var a = va.toObject();
  var b = vb.toObject();
  if (parseInt(a.notStampId) < parseInt(b.notStampId))
  {
      return 1;
  }
	else if (parseInt(a.notStampId) > parseInt(b.notStampId))
  {
      return -1;
  }
	return 0;
}

// compare questions for sorting according to upvotes
function compareQues(va, vb)
{
  var a = va.toObject();
  var b = vb.toObject();
  if (a.qUpBy.length < b.qUpBy.length)
  {
      return 1;
  }
	else if (a.qUpBy.length > b.qUpBy.length)
  {
      return -1;
  }
	return 0;
}

// remove duplicate questions while search
function contains(a, obj)
{
    var i = a.length;
    while (i--)
    {
       if (a[i].qStampId === obj.qStampId)
       {
           return true;
       }
    }
    return false;
}

// removes extra spaces between the input tags
function tagsProcess(qNewTags)
{
	var tags = [];
	for( i = 0 ; i < qNewTags.length ; )
	{
		while( i < qNewTags.length && qNewTags[i] == ' ')
		{
			i++;
		}
		var newTag = "";
		while( i < qNewTags.length && qNewTags[i] != ' ')
		{
			newTag += qNewTags[i];
			i++;
		}
		if( newTag.length > 0)
		{
			tags.push(newTag);
		}
	}
	return tags;
}

// send notifications if any user(s) mentioned somewhere
function mentionFunc( str, where, by, qTitle, qStampId )
{
	var result = [];
	for( i = 0 ; i < str.length ; )
	{
		if( str[i] == '@' )
		{
			i++;
			var mention = "";
			while( i < str.length && ( str[i] != ' ' && str[i] != '@' ) )
			{
				mention += str[i];
				i++;
			}
			result.push(mention);
		}
		else
		{
			i++;
		}
	}
	mongoose.connect('mongodb://rahulsahu:codechef@ds111430.mlab.com:11430/codechef', function(err, db)
  {
		result.forEach( function( ment )
    {
			var notStampId = Date.now().toString();
      var currentdate = new Date();
      var time = currentdate.getDay() + "/"+currentdate.getMonth()
                      + "/" + currentdate.getFullYear() + " at "
                      + currentdate.getHours() + ":"
                      + currentdate.getMinutes() + '.';
      var notQues = '<a href="/partQues/' + qStampId + '"><button style="display : inline; width: auto;" type="submit" class="btn btn-default btn-large">' + qTitle + '</button></a>';
      var notBy = '<a href="/accounts/' + by + '"><button style="display : inline;  width: auto;" type="submit" class="btn btn-default btn-large">' + by + '</button></a>';
      var notMsg = "<i style='color: blue;'>You have been mentioned in a question</i> " + notQues + " <i style='color: blue;'> by</i> " + notBy + " On " + time;
      if( where == "comment" )
      {
        notMsg = "<i style='color: blue;'>You have been mentioned in a comment to question</i> " + notQues + " <i style='color: blue;'> by</i> " + notBy + " On " + time;
      }
      else if( where == "answer" )
      {
        notMsg = "<i style='color: blue;'>You have been mentioned in an answer to question</i> " + notQues + " <i style='color: blue;'> by</i> " + notBy + " On " + time;
      }
      db.collection("users").update(
			{
				"username": ment
			},
			{
				$push : { "nots" : { "qTitle" : qTitle,
														 "notStampId" : notStampId,
														 "notMsg" : notMsg } }
			}, function()
      {
				if( result[result.length - 1] == ment )
				{
					return;
				}
			});
		});
	});
}

module.exports =
{
  compare: compare,
  compareUser: compareUser,
  compareStamp: compareStamp,
  compareQues: compareQues,
  contains: contains,
  tagsProcess: tagsProcess,
  mentionFunc: mentionFunc
}
