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
| 13.1.2022  | 0.5  | created a new database to use during development, fixed UserPage not showing username or total likes/dislikes |
|            | 0.5  | findDiscussionsUserHasSubscribedTo, findCommentsByUser, and findPostsByUser now support simple first, after pagination |
|            | 0.5  | changed more queries to support first-after pagination, updated queries in the frontend to allow these variables; spent time creating more data to development db |
| 17.1.2022  | 1    | implemented fetching more data on frontend (currently only users subscriptions can be fetched more, will implement rest) |
|            | 1.5  | user page now shows 5 first comment, post, and subsription. More (5) of each can be fetched by clicking a button. TOBEFIXED: when user re-enters the same users page, multiple button clicks are needed to fetch new data (problem in read function?) |
|            | 0.5  | Trying to fix problem mentioned in the last commit, problem is most likely in querys read-function, as on revisit backend returns only the first few items |
| 18.1.2022  | 1.5  | Partially fixed problem mentioned previously, data still persists bethween visits, but user can now fetch new data without the need to click the button multiple times |
|            | 0.5  | pagination now works in landing page (discussions can be fetched in batches) and in discussion page (posts in given discussion can be fetched in batches) |
| 19.1.2022  | 0.5  | Comments are now paginated |
|            | 1.5  | backend: got tests working using supertest |
| 20.1.2022  | 1    | User now has value creationDate. Show this date in user's page |
|            | 1    | Comments now have links to comments creators user page. FIX: before, when voting on a comment, page would fetch ALL comments after. New bug: newly fetched comments don't update when voted on |
|            | 1    | Fix: newly fetched comments can now be voted on, and the change happens without the need to reset the page (problem wasm that the update method's return didn't have a new list to replace the old list) |
|            | 1.5  | Fix: When switching from user page to another user page, data doesn't persist anymore. Creating a comment or post appends it to their existing list. |
| 21.1.2022  | 1.5  | When discussion is created, it is now appended to the existing list, similarly to comments and posts. In UserPage, data now 'resets' when revisiting same user twice, 'show less' -button added |
|            | 1    | comments and discussions now have the functionality to show more and less. Creating a post/discussion redirects to created posts/discussions page |
| 24.1.2022  | 1.5  | Comments can now be commented, and comment shows the comment it responded to |
|            | 0.5  | Comment form now has a 'hide' button, to only show the form when needed. Created bugs.md | 
|            | 0.5  | Created comments now appear properly. |
|            | 1    | Cleaned up VoteButtons component. FIX: when leaving a page quickly after voting, 'Can't perform state update on an unmounted componen' -error would apear. |
| 25.1.2022  | 2    | Started writing tests |
|            | 2    | Continued writing tests |
| 26.1.2022  | 1.5  | tests for queries written |
|            | 2    | Created a helper function to create a log in token when needed for tests. Mutation tests written for discussions, and partially for posts |
| 27.1.2022  | 3.5  | Wrote tests for backend |
| 28.1.2022  | 1    | Started working on CI/CD pipeline with github actions |
|            | 1    | Created basic sorting for discussions (new first, old first, most members first) |
| 31.1.2022  | 2    | Sorting of posts and discussions works, fixed associated bugs (more info in bugs.md) |
|            | 2    | Added sorting to other queries, filtering for discussions added |
| 1.2.2022   | 1    | Filtering added to posts in a given discussion. Users subscription now appear in alphabetical order |
|            | 3    | possible to upload an image when creating a post |
| 2.2.2022   | 1    | Post cannot be created if file being uploaded isn't valid (too large, isn't an image), log-in page now shows messages if credentials are wrong etc. |
|            | 2    | When creating a discussion, a description of the discussion is needed. Started designing frontend and working on styling, fixed hours.md (had one hour too much) |
| 3.2.2022   | 4    | Worked on styling frontend |
| 4.2.2022   | 3    | Worked on styling frontend. Landing page is now in acceptable condition. |
|            | 1    | Worked on userPage visuals, started to refactor code in userPage (started to break it down to smaller components) |
| 7.2.2022   | 3    | Finished refactoring UserPage. UserPage is now in acceptable condition (visually) |
| 8.2.2022   | 1    | Organized index.css (Still quite a mess) |
|            | 3    | Worked on frontend. Discussion page is now in an acceptable condition. |
| 9.2.2022   | 4    | Still working on styling the app. Posts now keep count of the amount of comments in them. |
| 10.2.2022  | 1    | Fixed backend tests. |
|            | 2    | Kept working on frontend. (Everything is now in acceptable condition visually, some work to be done later) |
| 11.2.2022  | 3    | Small fixes to frontends visuals. Started to write tests for frontend |
| 14.2.2022  | 4    | Continued writing tests for frontend (got queries working with MockedProvider) |
| 15.2.2022  | 2    | Writing tests for frontend, pipeline changes |
| 16.2.2022  | 3    | Working on tests for frontend |
| 17.2.2022  | 4    | Wrote tests for frontend (almost done) |
| 18.2.2022  | 3    | Tests for frontend done. Backend now serves static files when started |
|            | 1    | Started working on getting the app online |
| 21.2.2022  | 4    | Created workflow to deploy app to Heroku on successful push. Made required changes to the app for this to work. Created readme.md |
| 22.2.2022  | 1    | Added the possibility to upload image URLs when creating a post |
|            | 1    | Fixed image showing too small in posts, small fixes to css, created FAQ-page |
|            | 1    | Fixed frontend tests, small css tweaks, when filtering and nothing is found, show nothing found message, tweaks to FAQ, changing pages resets scroll |
| 23.2.2022  | 2    | Started working on messages (alert user when someone comments their comment/post) |
|            | 1    | Working on messages |
| 24.2.2022  | 4    | Got messages partially working, fixed tests, small visual changes associated with messages, separate messages page created |
|            | 2    | working on getting messages working |
| 25.2.2022  | 2    | Messages now redirect correctly (redirecting to a comment scrolls to that comment) |
| 28.2.2022  | 1    | MessagePage now have show more/less buttons, fixed test |
|            | 3    | Wrote tests for MessagePage, started writing backend tests for message |
|            | 1    | continued to write tests |
| 1.3.2022   | 1.5  | Finished writing tests |
|            | 2    | Visual changes to site, changed how messages look |
|            | 0.5  | Fixed tests, changed form placement across the site |
| 2.3.2022   | 1    | Visual changes to messages (can't seem to figure out a good look...) |
|            | 1    | Messages now redirect correctly, some changes to message schema, fixed tests |
| 3.3.2022   | 4    | Look of the messages is now done (required some changes to ), created a modal for errors, some visual fixes, fixed broken tests |
| total      | 161  | |