import { gql } from 'apollo-boost';
import { GraphQLError } from 'graphql';
import {
    Checkbox,
    Stack,
    Text,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
    useToast,
} from '@shopify/argo-admin-react';
import React, { useEffect, useMemo, useState } from 'react';
import { translations, Translations } from './adminTranslations';
import { getClient } from './adminUtils';

const GET_SELLING_PLANS = gql`
    query {
        sellingPlanGroups(first: 10) {
            edges {
                node {
                    id
                    name
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

interface SellingPlan {
    id: string;
    name: string;
}

interface ShowGraphQlErrorsParams {
    showToast: (message: string, { error }?: { error: boolean }) => void;
    errors: readonly GraphQLError[];
}

const showGraphQlErrors = ({ showToast, errors }: ShowGraphQlErrorsParams) => {
    showToast(
        `Error in request: <br /> ${errors
            .map((err) => err.message)
            .join(' - ')} `,
        { error: true },
    );
};

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

export default function AddSellingPlan(): JSX.Element {
    const data = useData<'Admin::Product::SubscriptionPlan::Add'>();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { close, done, setPrimaryAction, setSecondaryAction } = useContainer<
        'Admin::Product::SubscriptionPlan::Add'
    >();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { show: showToast } = useToast();
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

    const { getSessionToken } = useSessionToken();
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [availablePlans, setAvailablePlans] = useState<SellingPlan[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const sessionToken = await getSessionToken();
                const { data: sellingPlanData, errors } = await getClient(
                    sessionToken,
                ).query<SellingPlanQueryResult>({
                    query: GET_SELLING_PLANS,
                });
                if (errors && errors.length > 0) {
                    showGraphQlErrors({ showToast, errors });
                } else {
                    setAvailablePlans(
                        sellingPlanData.sellingPlanGroups.edges.map(
                            (edge) => edge.node,
                        ),
                    );
                }
            } catch (err) {
                showToast(`Error fetching plans`, {
                    error: true,
                });
            }
        };
        // eslint-disable-next-line no-void
        void fetchPlans();
    }, [getSessionToken, showToast]);

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
                        showGraphQlErrors({
                            showToast,
                            errors,
                        });
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
    ]);

    return (
        <>
            <Text size="titleLarge">{localizedStrings.hello}!</Text>
            <Text>
                Add {`{Product id ${data.productId}}`} to an existing plan or
                existing plans
            </Text>

            <Stack>
                {availablePlans.map((plan) => (
                    <Checkbox
                        key={plan.id}
                        label={plan.name}
                        onChange={(checked) => {
                            const plans = checked
                                ? selectedPlans.concat(plan.id)
                                : selectedPlans.filter((id) => id !== plan.id);
                            setSelectedPlans(plans);
                        }}
                        checked={selectedPlans.includes(plan.id)}
                    />
                ))}
            </Stack>
        </>
    );
}
