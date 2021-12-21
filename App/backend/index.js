const { ApolloServer, gql, UserInputError } = require('apollo-server')
const { v1: uuid } = require('uuid')

let posts = [
  {
    id: "9ifd9fasj90gj09",
    title: "Nothing grows",
    text: "I recently started gardening, but it seems that everything I plant dies shortly after. What to do?",
    likes: 15,
    dislikes: 3,
    discussionName: "Gardening"
  },
  {
    id: "55151g1tg1g",
    title: "Just got a new puppy!",
    text: "I have wanted my own dog for as long as I can remember, and now it finally happened! Just picked her up and she's an angel <3",
    likes: 55,
    dislikes: 10,
    discussionName: "Pets"
  },
  {
    id: "jijjigjigaag",
    title: "Mario is nightmare fuel",
    text: "His unblinking eyes stare right through me. The image of his moustache has burned in to the depths of my mind, and i can't get rid of it.",
    likes: 1515,
    dislikes: 161,
    discussionName: "Games"
  },
  {
    id: "90i9j9gjg",
    title: "Saab help",
    text: "My Saab 95 from -61 is missing it's bumber, where can I buy a new one?",
    likes: 15,
    dislikes: 0,
    discussionName: "Cars"
  },
  {
    id: "99g9gsg",
    title: "Sekiro is bullshit!",
    text: "Goddammit! I'm so tired of this bs! I keep losing to this big nosed dude on a horse! I almost broke my controller in rage!",
    likes: 4,
    dislikes: 45,
    discussionName: "Games"
  },
  {
    id: "97878afgafa",
    title: "My parrot learned to speak!",
    text: "I have been teaching her for the past 3 months and finally she managed to say 'hello'! I'm so happy I could cry...",
    likes: 55,
    dislikes: 1,
    discussionName: "Pets"
  }
]

let discussions = [
  {
    name: "Gardening",
    members: 642
  },
  {
    name: "Games",
    members: 5515
  },
  {
    name: "Cars",
    members: 915
  },
  {
    name: "Pets",
    members: 1514
  }
]

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    text: String!
    likes: Int!
    dislikes: Int!,
    discussionName: String!
  }

  type Discussion {
    name: String!
    members: Int!
    posts: [Post!]!
  }

  type Query {
    allDiscussions: [Discussion!]!
    findDiscussion(name: String!): Discussion
    findPost(id: ID!): Post
  }

  type Mutation {
    createDiscussion (
      name: String!
    ): Discussion
    createPost (
      title: String!
      text: String!
      discussionName: String!
    ): Post
    likePost (
      id: ID!
    ): Post
    dislikePost (
      id: ID!
    ): Post
  }
`

const resolvers = {
  Query: {
    allDiscussions: () => discussions,
    findDiscussion: (root, args) => discussions.find(discussion => discussion.name === args.name),
    findPost: (root, args) => posts.find(post => post.id === args.id)
  },
  Mutation: {
    createDiscussion: (root, args) => {
      const discussionNames = discussions.map(discussion => discussion.name)
      if (discussionNames.includes(args.name)) {
        throw new UserInputError('Name of the discussion must be unique', {
          invalidArgs: args.name
        })
      }

      const newDiscussion = { ...args, members: 0, posts: [] }
      discussions = discussions.concat(newDiscussion)
      return newDiscussion
    },
    createPost: (root, args) => {
      const discussionNames = discussions.map(discussion => discussion.name)
      if (!discussionNames.includes(args.discussionName)) {
        throw new UserInputError('Discussion name must exist')
      }

      const newPost = { ...args, likes: 0, dislikes: 0, id: uuid() }
      posts = posts.concat(newPost)
      return newPost
    },
    likePost: (root, args) => {
      const postToUpdate = posts.find(post => post.id === args.id)

      if (!postToUpdate) {
        throw new UserInputError('Post does not exist')
      }
      
      postToUpdate.likes++
      return postToUpdate
    },
    dislikePost: (root, args) => {
      const postToUpdate = posts.find(post => post.id === args.id)

      if (!postToUpdate) {
        throw new UserInputError('Post does not exist')
      }

      postToUpdate.dislikes++
      return postToUpdate
    }
  },
  Discussion: {
    posts: (root) => {
      const filter = (post) => {
        if (post.discussionName === root.name) return post
      }

      const postsInDiscussion = posts.filter(filter)

      return postsInDiscussion
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})