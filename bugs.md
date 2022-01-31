- ~~When creating a comment, the comment appears like supposed to, when fetched comments is NOT divisible by 5 
(new comments are fetched in batches of 5, if current fetch is "full" the new comment doesn't "fit", and is fetched in the next batch, as in, user needs to press get more comments)~~ FIXED
- ~~If user leaves a page where voting has happened recently (< 1s ago) warning is displayer in console: Can't perform React state update on an unmounted component. 
This is because VoteButtons component sets a timeout, and if user leaves before timeout finishes, state cannot be updated, leading to this error.~~ FIXED
- ~~After visiting a discussion, and trying to change order in landing page, the first 5 discussions remain in the default order~~ FIXED
	- ~~after visiting a discussion and trying to change order, or fetch more discussions, page does another query, only containing the 5 first discussions~~
	- switched to useQuery from useLazyQuery 31.1.2022
- ~~Changing the order of posts in discussion page, and then trying to fetch more posts doesn't work, fetches only once~~ FIXED
	- switched to useQuery from useLazyQuery 31.1.2022
- ~~After visiting a post, and then trying to change order in discussion page, the first 5 posts remain in the default order~~ FIXED
	- switched to useQuery from useLazyQuery 31.1.2022