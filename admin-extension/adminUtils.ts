import ApolloClient from 'apollo-boost';
import { GraphQLError } from 'graphql';

// eslint-disable-next-line import/prefer-default-export
export function getClient(sessionToken?: string): ApolloClient<never> {
    return new ApolloClient({
        // todo shop could be read from the url
        // uri: `${String(process.env.HOST)}/graphql`,
        uri: `https://8762496672f9.ngrok.io` + '/graphql',
        fetchOptions: {
            credentials: 'include',
            headers: {
                'Some-Auth-Token': sessionToken,
            },
        },
    });
}

interface ShowGraphQlErrorsParams {
    showToast: (message: string, { error }?: { error: boolean }) => void;
    errors: readonly GraphQLError[];
}

export const showGraphQlErrors = ({
    showToast,
    errors,
}: ShowGraphQlErrorsParams): void => {
    showToast(
        `Error in request: <br /> ${errors
            .map((err) => err.message)
            .join(' - ')} `,
        { error: true },
    );
};
