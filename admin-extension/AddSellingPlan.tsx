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
import { translations, Translations } from './adminTranslations';
import { getClient, useGraphQLErrorToast } from './adminUtils';

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

const ADD_SELLING_PLAN = gql`
    mutation productJoinSellingPlanGroups(
        $id: ID!
        $sellingPlanGroupIds: [ID!]!
    ) {
        productJoinSellingPlanGroups(
            id: $id
            sellingPlanGroupIds: $sellingPlanGroupIds
        ) {
            product {
                id
            }
            userErrors {
                code
                field
                message
            }
        }
    }
`;

const ADD_SELLING_PLAN_VARIANT = gql`
    mutation productJoinSellingPlanGroups(
        $id: ID!
        $sellingPlanGroupIds: [ID!]!
    ) {
        productVariantJoinSellingPlanGroups(
            id: $id
            sellingPlanGroupIds: $sellingPlanGroupIds
        ) {
            productVariant {
                id
            }
            userErrors {
                code
                field
                message
            }
        }
    }
`;

async function addRemote(
    token: string | undefined,
    selectedPlans: string[],
    productId: string,
    variantId?: string,
) {
    if (variantId) {
        return getClient(token).mutate({
            mutation: ADD_SELLING_PLAN_VARIANT,
            variables: {
                id: variantId,
                sellingPlanGroupIds: selectedPlans,
            },
        });
    }

    return getClient(token).mutate({
        mutation: ADD_SELLING_PLAN,
        variables: {
            id: productId,
            sellingPlanGroupIds: selectedPlans,
        },
    });
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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {
        close,
        done,
        setPrimaryAction,
        setSecondaryAction,
    } = useContainer<'Admin::Product::SubscriptionPlan::Add'>();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { show: showToast } = useToast();
    const showGraphQLError = useGraphQLErrorToast();
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

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
                    const { errors } = await addRemote(
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
