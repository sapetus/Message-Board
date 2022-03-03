*This list is not exhaustive and is subject to change*

# TODO

## backend:
- Comment more!
- ~~pagination, relay-style pagination (probably a must)~~ (first, after -pagination implemented)
- better solution for keeping track of likes/dislikes per user, post, and discussion?
- ~~users total likes/dislikes across all posts and comments~~ (DONE)
- possible to breakdown long functions in to reusable helper functions?
- admin status for the creator of a discussion?
- total amount of comments/post
- enable alerts for users
- ~~comments for comments? (as in, comment can reference another comment)~~ (DONE)
- ~~**tests!**~~ (DONE, for now)
- ~~Make different messages for post and comment replies!~~ (DONE)

## frontend:
- ~~cleanup function for VoteButtons~~ (DONE)
- Comment more!
- MAKE IT LOOK BETTER!
- CSS is a MESS! Extremely unorganized.
  - organize it! don't make a new class or id for everything
- why does input field with password type give an error on submit?
  - 'Uncaught (in promise) Error: Something went wrong. Please check back shortly. at g (content.js:X:XXXXXXX)
  - error doesn't seem to break anything, as page keeps functioning normally
- ~~ordering to be done on server or client side? (probably server, modify queries)~~ (DONE)
- ~~Search/Filter bar for discussions~~ (DONE)
- ~~Search/Filter bar for posts~~ (DONE)
- Search/Filter bar for users?
- create a show more button for discussions description, if it is too long.
- ~~ONLY allow references to an image (URL), unsafe to save and send images to users without actually making sure the file is clean~~ (DONE)
- ~~Send an alert to user when someone comments their post or comment~~ (DONE)
- ~~Implement FAQ page~~ (DONE)
- Hide 'show more' and 'show less' buttons when nothing can be fetched anymore
	- or implement infinite scroll
- ~~Clicking a message should take to the NEW comment~~ (DONE)
- ~~Control amount buttons for messages (show more, show less)~~ (DONE)
- **tests!**
- ~~Error messages when creating: post, comment, discussion~~ (DONE)

## app:
- start using branches!
- e2e tests
- ~~CI/CD pipeline~~(DONE)
- ~~push to heroku or somewhere similar~~ (DONE, app deployed to heroku)
  - ~~backend and frontend to separate places?~~ (DONE, backend serves static files from frontend)