
const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList,
} = require('graphql')

const { novels, writers } = require('./library.js');

const app = express();

const novelType = new GraphQLObjectType({
    name: 'novel',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        writerID: {type: GraphQLNonNull(GraphQLInt)},
        writer: {
            type: writerType,
            resolve: (novel) => {
                return writers.find(writer => writer.id === novel.writerID)
            }
        }
    })
})

const writerType = new GraphQLObjectType({
    name: 'writer',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        novels: { 
            type: new GraphQLList(novelType), 
            resolve: (writer) => {
                return novels.filter(novels => novels.writerID === writer.id)
            }
        }
    })
})



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        novel: {
            type: novelType,
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (__, args) => novels.find(novel => novel.id === args.id)
        },
        novels: {
            type: new GraphQLList(novelType),
            resolve: () => novels
        },
        writers: {
            type: new GraphQLList(writerType),
            resolve: () => writers
        },
        writer: {
            type: writerType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (__s, args) => writers.find(writer => writer.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addnovel: {
            type: novelType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                writerId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (__, args) => {
                const novel = {id: novels.length + 1, name: args.name, writerId: args.writerId}
                novels.push(novel)
                return novel
            }
        },
        addwriter: {
            type: writerType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (__, args) => {
                const writer = {id: writers.length + 1, name: args.name}
                novels.push(writer)
                return writer
            }
        }
    })
})


const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(1234., () => console.log(`Server Running`))