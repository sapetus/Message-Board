| day        | time | things done |
| :--------: | :--: | :---------- |
| 16.12.2021 | 2    | designing app |
| 17.12.2021 | 2    | frontend and backend created, neither works yet |
| 20.12.2021 | 4    | basic front- and backend, discussions and posts can now be viewed and posts can be created |
| 21.12.2021 | 1    | discussions can now be created, posts can be liked and disliked |
|            | 3    | converted backend to use MongoDB, frontend works with backend, frontend refreshes when post is liked/disliked |
| 27.12.2021 | 3    | created a comment model and associated queries and mutations, posts can now we commented, comments can be liked/disliked |
| 29.12.2021 | 1    | separated typeDefs and resolvers from index.js in backend, started to write tests, none currently work |
| 31.12.2021 | 2    | Got tests working using easygraphql-tester, created basic tests | 
| 3.1.2022   | 1    | Backend supports user creation and logging in |
|            | 2    | Frontend now supports logging in, only logged in users can create discussions, posts, comments, and likes |
|            | 1    | users can now register through frontend, only show forms to logged in users | 
| 4.1.2022   | 1    | Posts and comments save the user who created them, users can now subscribe to discussions (only backend) |
|            | 1    | Created a page for user to view their own account |
|            | 1    | Users can now view other users pages, user page now contains links to users posts and comments etc. |
| 5.1.2022   | 2.5  | subscribe and unsubscribe now possible from frontend, show button depending on subscription status, changed backend to allow these changes |
|            | 1    | backend now keeps track what posts user has liked or disliked |
|            | 0.5  | backend now keeps track what users have liked or disliked a specific post (each user can only like or dislike once per post) |
| 6.1.2022   | 1    | splitted resolvers and type definitions to separate files in backend |
|            | 2    | user can now unlike and undislike posts, registration form gives appropriate message when creating a new user |
| 7.1.2022   | 0.5  | refactored postPage, separated comments and vote buttons to their own separate components | 
|            | 1    | user now keeps track what comments it has liked/disliked, comment now keeps track of users who have liked, disliked it |
|            | 0.5  | changed VoteButtons component to disable button for a while while voting |
| 10.1.2022  | 1    | Fix: backend didn't save comment likes/dislikes correctly |
|            | 0.5  | Created unlike and undislike mutations for comments | 
|            | 2    | frontend now supports liking/disliking/unliking/undisliking of comments, made appropriate changes to backend |
| 11.1.2022  | 1    | moved reusable code to a helper function in backend (backend/GraphQL/utils/checkUserAction) |
|            | 0.5  | backend now uses express and httpServer |
|            | 0.5  | created todo.md with list of tasks to do |
|            | 1    | each user now has total likes/dislikes, which increase/decrease when someone likes/dislikes that user's created comments/posts |
| 12.1.2022  | 1    | read up on pagination, trying to figure out how to implement |
|            | 0.5  | cleaned up backend |
|            | 1    | chopped up getUserByName query to many smaller queries (maybe easier to paginate?) |
| total      | 43   | |