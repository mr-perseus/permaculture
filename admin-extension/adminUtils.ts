import ApolloClient from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
export function getClient(sessionToken?: string): ApolloClient<never> {
    return new ApolloClient({
        uri: `${String(process.env.HOST)}/graphql`,
        fetchOptions: {
            credentials: 'include',
            headers: {
                'Some-Auth-Token': sessionToken,
            },
        },
    });
}
