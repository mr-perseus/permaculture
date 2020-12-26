import { useToast } from '@shopify/argo-admin-react';
import ApolloClient from 'apollo-boost';
import { GraphQLError } from 'graphql';

export function getClient(sessionToken?: string): ApolloClient<never> {
    return new ApolloClient({
        // todo shop could be read from the url
        // uri: `${String(process.env.HOST)}/graphql`,
        uri: 'https://9f655a61f1b7.ngrok.io/graphql',
        fetchOptions: {
            credentials: 'include',
            headers: {
                'Some-Auth-Token': sessionToken,
            },
        },
    });
}

export function useGraphQLErrorToast(): (
    errors: readonly GraphQLError[],
) => void {
    const toast = useToast();

    return (errors: readonly GraphQLError[]) => {
        toast.show(
            `Error in request: <br /> ${errors
                .map((err) => err.message)
                .join(' - ')} `,
            { error: true },
        );
    };
}
