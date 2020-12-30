import { gql } from 'apollo-boost';
import {
    Checkbox,
    ResourceItem,
    ResourceList,
    Text,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
    useToast,
} from '@shopify/argo-admin-react';
import React, { useEffect, useMemo, useState } from 'react';
import { GraphQLError } from 'graphql';
import { translations, Translations } from './adminTranslations';
import {
    addProductToSellingPlan,
    getClient,
    useGraphQLErrorToast,
} from './adminUtils';

const GET_SELLING_PLANS = gql`
    query sellingPlanGroups($productId: ID!) {
        sellingPlanGroups(first: 10) {
            edges {
                node {
                    id
                    name
                    appliesToProduct(productId: $productId)
                }
            }
        }
    }
`;

const GET_SELLING_PLANS_VARIANT = gql`
    query sellingPlanGroups($productVariantId: ID!, $productId: ID!) {
        sellingPlanGroups(first: 10) {
            edges {
                node {
                    id
                    name
                    appliesToProductVariant(productVariantId: $productVariantId)
                    appliesToProduct(productId: $productId)
                }
            }
        }
    }
`;

interface SellingPlanQueryResult {
    sellingPlanGroups: {
        edges: {
            node: SellingPlan;
        }[];
    };
}

interface SellingPlan {
    id: string;
    name: string;
    appliesToProduct: boolean;
    appliesToProductVariant?: boolean;
}

async function fetchPlans(
    sessionToken: string | undefined,
    data: {
        productId: string;
        variantId?: string;
    },
) {
    if (!data.variantId) {
        return getClient(sessionToken).query<SellingPlanQueryResult>({
            query: GET_SELLING_PLANS,
            variables: {
                productId: data.productId,
            },
        });
    }

    return getClient(sessionToken).query<SellingPlanQueryResult>({
        query: GET_SELLING_PLANS_VARIANT,
        variables: {
            productVariantId: data.variantId,
            productId: data.productId,
        },
    });
}

export default function AddSellingPlan(): JSX.Element {
    const data = useData<'Admin::Product::SubscriptionPlan::Add'>();
    const {
        close,
        done,
        setPrimaryAction,
        setSecondaryAction,
    } = useContainer<'Admin::Product::SubscriptionPlan::Add'>();

    const { show: showToast } = useToast();
    const showGraphQLError: (
        errors: readonly GraphQLError[],
    ) => void = useGraphQLErrorToast();
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(
        () =>
            // eslint-disable-next-line security/detect-object-injection
            translations[locale] || translations.en,
        [locale],
    );

    const { getSessionToken } = useSessionToken();
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [availablePlans, setAvailablePlans] = useState<SellingPlan[]>([]);

    useEffect(() => {
        const getPlans = async () => {
            const sessionToken = await getSessionToken();

            const { data: sellingPlanData, errors } = await fetchPlans(
                sessionToken,
                data,
            );

            if (errors && errors.length > 0) {
                throw Error(`GraphQLError: ${errors.join(', ')}`);
            }

            setAvailablePlans(
                sellingPlanData.sellingPlanGroups.edges.map(
                    (edge) => edge.node,
                ),
            );
        };

        getPlans().catch(() => {
            showToast(`Error fetching plans`, {
                error: true,
            });
        });
    }, [data, getSessionToken, showToast]);

    useEffect(() => {
        setPrimaryAction({
            content: 'Add to plan',
            onAction: async () => {
                try {
                    const token = await getSessionToken();
                    const { errors } = await addProductToSellingPlan(
                        token,
                        selectedPlans,
                        data.productId,
                        data.variantId,
                    );

                    if (errors && errors?.length > 0) {
                        showGraphQLError(errors);
                    } else {
                        done();
                    }
                } catch (err) {
                    showToast(`Error adding plans`, {
                        error: true,
                    });
                }
            },
        });

        setSecondaryAction({
            content: 'Cancel',
            onAction: () => close(),
        });
    }, [
        getSessionToken,
        close,
        done,
        setPrimaryAction,
        setSecondaryAction,
        showToast,
        data,
        selectedPlans,
        showGraphQLError,
    ]);

    return (
        <>
            <Text size="titleLarge">{localizedStrings.hello}!</Text>
            <Text>
                Add {`{Product id ${data.productId}}`} to an existing plan or
                existing plans
            </Text>

            <ResourceList>
                {availablePlans
                    .filter(
                        (plan) =>
                            !plan.appliesToProduct &&
                            !plan.appliesToProductVariant,
                    )
                    .map((plan) => (
                        <ResourceItem
                            onPress={() => {
                                // nop
                            }}
                            id={plan.id}
                            key={plan.id}
                        >
                            <Checkbox
                                key={plan.id}
                                label={plan.name}
                                onChange={(checked) => {
                                    const plans = checked
                                        ? selectedPlans.concat(plan.id)
                                        : selectedPlans.filter(
                                              (id) => id !== plan.id,
                                          );
                                    setSelectedPlans(plans);
                                }}
                                checked={selectedPlans.includes(plan.id)}
                            />
                        </ResourceItem>
                    ))}
            </ResourceList>
        </>
    );
}
