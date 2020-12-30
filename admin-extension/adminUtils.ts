import { useToast } from '@shopify/argo-admin-react';
import ApolloClient, { FetchResult } from 'apollo-boost';
import { GraphQLError } from 'graphql';
import {
    ADD_PRODUCT_TO_SELLING_PLAN_GROUP,
    ADD_VARIANT_TO_SELLING_PLAN_GROUP,
    SellingPlanGroupAddProductResult,
    SellingPlanGroupAddProductVariantResult,
} from '../lib/sellingPlanGraphQL';

export function getClient(sessionToken?: string): ApolloClient<never> {
    const HOST = process.env.HOST || 'https://permaculture-app.herokuapp.com';
    return new ApolloClient({
        // todo shop could be read from the url
        uri: `${HOST}/graphql`,
        headers: {
            'auth-token': sessionToken,
        },
    });
}

export function useGraphQLErrorToast(): (
    errors: readonly (GraphQLError | string)[],
) => void {
    const toast = useToast();

    return (errors: readonly (GraphQLError | string)[]) => {
        toast.show(
            `Error in request: <br /> ${errors
                .map((err: GraphQLError | string): string => {
                    if (err instanceof GraphQLError) {
                        return err.message;
                    }
                    return err;
                })
                .join(' - ')} `,
            { error: true },
        );
    };
}

export async function addProductToSellingPlan(
    token: string | undefined,
    selectedPlans: string[],
    productId: string,
    variantId?: string,
): Promise<
    FetchResult<
        | SellingPlanGroupAddProductResult
        | SellingPlanGroupAddProductVariantResult
    >
> {
    if (variantId) {
        return getClient(token).mutate<
            SellingPlanGroupAddProductVariantResult,
            { id: string; sellingPlanGroupIds: string[] }
        >({
            mutation: ADD_VARIANT_TO_SELLING_PLAN_GROUP,
            variables: {
                id: variantId,
                sellingPlanGroupIds: selectedPlans,
            },
        });
    }

    return getClient(token).mutate<
        SellingPlanGroupAddProductResult,
        { id: string; sellingPlanGroupIds: string[] }
    >({
        mutation: ADD_PRODUCT_TO_SELLING_PLAN_GROUP,
        variables: {
            id: productId,
            sellingPlanGroupIds: selectedPlans,
        },
    });
}
