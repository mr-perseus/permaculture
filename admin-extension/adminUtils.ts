import ApolloClient from 'apollo-boost';

// eslint-disable-next-line import/prefer-default-export
export function getClient(sessionToken?: string): ApolloClient<never> {
    return new ApolloClient({
        // todo shop could be read from the url
        // uri: `${String(process.env.HOST)}/graphql`,
        uri: `https://perma-subs.eu.ngrok.io/graphql`,
        fetchOptions: {
            credentials: 'include',
            headers: {
                'Some-Auth-Token': sessionToken,
            },
        },
    });
}
