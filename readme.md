## General discussion forum for posting questions, answers and comments. 
* #### A user need to create an account with ID and password. 
* #### This app uses mongoDb, nodeJs, javaScript, handleBars and a mongoDb online database(mLab).
* #### This app uses mongodb database stored at my mLab account. To change the database to any other mongoDb database, change the url in line 14 in app.js.
* #### (A few example questions/answers/comments and users have already been added.)

## Features
* ####  Register new users.
* ####  Login using username and password.
* ####  Post questions/answers/comments.
* ####  Upvote/downvote questions/answers/comments.
* ####  Tag users using "@" symbol, example @redb17. That user will be notified.
* ####  Notifications regarding different activities like upvoting/downvoting a user's answer/question/comment, etc.
* ####  A user gets notified for:
* ####  Mentioned on a question/answer/comment.
* ####  A new answer has been posted on a user's question
* ####  User's question/answer/comment has been upvoted/downvoted.
* ####  Have been awarded/deducted points by Admin.
* ####  Have been made Admin by last Admin.
* ####  Karma points system
* ####  +10 points of each upvote of an answer/question.
* ####  -2 for downvote of an answer/question.
* ####  Comments upvote/downvote offer no points.
* ####  Upvote/downvote can be changed afterwards by a user. An upvote can be 'un-upvoted' afterwards, etc.
* ####  Question author can “accept answer” on his question. This will award 20 points to author of that answer.
* ####  Questions/answers/comments are editable.
* ####  Users can search for questions based on a particular tag or multiple tags together.
* ####  Profile of every user showing his Karma Points and other relevant data.

## How to use(in windows)?
* #### Execute command "npm install" to install all dependencies stored in package.json file.
* #### Open terminal and type 'node app.js' to start the app on local port(most probably http://127.0.0.1:3000).

## Acknowledgments
* #### Login and registration system using bCrypt and passport : 'https://github.com/bradtraversy/loginapp'.
