import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs, resolvers } from '@/server/graphql';

function getYoga() {
    return createYoga({
        schema: createSchema({
            typeDefs,
            resolvers,
        }),
        graphqlEndpoint: '/api/graphql',
        fetchAPI: { Response },
    });
}

export async function GET(request: Request) {
    const { handleRequest } = getYoga();
    return handleRequest(request, {});
}

export async function POST(request: Request) {
    const { handleRequest } = getYoga();
    return handleRequest(request, {});
}
