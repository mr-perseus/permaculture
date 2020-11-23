import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Checkbox,
    extend,
    render,
    Stack,
    Text,
    TextField,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
    useToast,
} from '@shopify/argo-admin-react';
import ApolloClient, { gql } from 'apollo-boost';
import { GraphQLError } from 'graphql';

const getClient = (sessionToken?: string) => {
    return new ApolloClient({
        // todo shop could be read from the url
        uri: 'https://perma-subs.eu.ngrok.io/graphql',
        fetchOptions: {
            credentials: 'include',
            headers: {
                'Some-Auth-Token': sessionToken,
            },
        },
    });
};

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

const CREATE_SELLING_PLAN = gql`
    mutation($input: SellingPlanGroupInput!) {
        sellingPlanGroupCreate(input: $input) {
            sellingPlanGroup {
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

const ADD_SELLING_PLAN = gql`
    mutation addSellingPlan($id: ID!, $planIds: [ID!]!) {
        productJoinSellingPlanGroups(id: $id, sellingPlanGroupIds: $planIds) {
            product {
                title
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

interface Translations {
    [key: string]: string;
}

const translations: {
    [locale: string]: Translations;
} = {
    de: {
        hello: 'Guten Tag',
    },
    en: {
        hello: 'Hello',
    },
    fr: {
        hello: 'Bonjour',
    },
};

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

function Add() {
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
                showToast(`Error fetching plans: ${err as string}`, {
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
                    const { errors } = await getClient(token).mutate({
                        mutation: ADD_SELLING_PLAN,
                        variables: {
                            id: data.productId,
                            planIds: selectedPlans,
                        },
                    });

                    if (errors && errors?.length > 0) {
                        showGraphQlErrors({
                            showToast,
                            errors,
                        });
                    } else {
                        done();
                    }
                } catch (err) {
                    showToast(`Error adding plans: ${err as string}`, {
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
        data.productId,
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

function Create() {
    const data = useData<'Admin::Product::SubscriptionPlan::Create'>();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { close, done } = useContainer<
        'Admin::Product::SubscriptionPlan::Create'
    >();

    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

    // Mock plan settings
    const [planTitle, setPlanTitle] = useState('');
    const [percentageOff, setPercentageOff] = useState('');
    const [deliveryFrequency, setDeliveryFrequency] = useState('');

    const onPrimaryAction = useCallback(() => {
        // todo create plan on API
        done();
    }, [done]);

    const actions = useMemo(
        () => (
            <Stack spacing="none" distribution="fill">
                <Button title="Cancel" onPress={() => close()} />
                <Stack distribution="trailing">
                    <Button
                        title="Create plan"
                        onPress={onPrimaryAction}
                        primary
                    />
                </Stack>
            </Stack>
        ),
        [onPrimaryAction, close],
    );

    return (
        <>
            <Stack spacing="none">
                <Text size="titleLarge">
                    {localizedStrings.hello}! Create subscription plan
                </Text>
            </Stack>

            <Card
                title={`Create subscription plan for Product id ${data.productId}`}
                sectioned
            >
                <TextField
                    label="Plan title"
                    value={planTitle}
                    onChange={setPlanTitle}
                />
            </Card>

            <Card title="Delivery and discount" sectioned>
                <Stack>
                    <TextField
                        type="number"
                        label="Delivery frequency (in weeks)"
                        value={deliveryFrequency}
                        onChange={setDeliveryFrequency}
                    />
                    <TextField
                        type="number"
                        label="Percentage off (%)"
                        value={percentageOff}
                        onChange={setPercentageOff}
                    />
                </Stack>
            </Card>

            {actions}
        </>
    );
}

// 'Remove' mode should remove the current product from a selling plan.
// This should not delete the selling plan.
// [Shopify admin renders this mode inside a modal container]
function Remove() {
    const data = useData<'Admin::Product::SubscriptionPlan::Remove'>();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { close, done, setPrimaryAction, setSecondaryAction } = useContainer<
        'Admin::Product::SubscriptionPlan::Remove'
    >();
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

    const { getSessionToken } = useSessionToken();

    useEffect(() => {
        setPrimaryAction({
            content: 'Remove from plan',
            onAction: () => {
                // todo remove plan
                done();
            },
        });

        setSecondaryAction({
            content: 'Cancel',
            onAction: () => close(),
        });
    }, [getSessionToken, done, close, setPrimaryAction, setSecondaryAction]);

    return (
        <>
            <Text size="titleLarge">{localizedStrings.hello}!</Text>
            <Text>
                Remove {`{Product id ${data.productId}}`} from{' '}
                {`{Plan group id ${data.sellingPlanGroupId}}`}
            </Text>
        </>
    );
}

function Edit() {
    const data = useData<'Admin::Product::SubscriptionPlan::Edit'>();
    const [planTitle, setPlanTitle] = useState('Current plan');
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

    const { getSessionToken } = useSessionToken();

    const [percentageOff, setPercentageOff] = useState('10');
    const [deliveryFrequency, setDeliveryFrequency] = useState('1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { close, done } = useContainer<
        'Admin::Product::SubscriptionPlan::Edit'
    >();

    const onPrimaryAction = useCallback(async () => {
        const token = await getSessionToken();
        await getClient(token).mutate({
            mutation: CREATE_SELLING_PLAN,
            variables: {},
        });
        done();
        // todo modify selling plan -> should affects products which have this plan applied...
    }, [getSessionToken, done]);

    const actions = useMemo(
        () => (
            <Stack spacing="none" distribution="fill">
                <Button title="Cancel" onPress={() => close()} />
                <Stack distribution="trailing">
                    <Button
                        title="Edit plan"
                        onPress={onPrimaryAction}
                        primary
                    />
                </Stack>
            </Stack>
        ),
        [onPrimaryAction, close],
    );

    return (
        <>
            <Stack spacing="none">
                <Text size="titleLarge">
                    {localizedStrings.hello}! Edit subscription plan
                </Text>
            </Stack>

            <Card
                title={`Edit subscription plan for Product id ${data.productId}`}
                sectioned
            >
                <TextField
                    label="Plan title"
                    value={planTitle}
                    onChange={setPlanTitle}
                />
            </Card>

            <Card title="Delivery and discount" sectioned>
                <Stack>
                    <TextField
                        type="number"
                        label="Delivery frequency (in weeks)"
                        value={deliveryFrequency}
                        onChange={setDeliveryFrequency}
                    />
                    <TextField
                        type="number"
                        label="Percentage off (%)"
                        value={percentageOff}
                        onChange={setPercentageOff}
                    />
                </Stack>
            </Card>

            {actions}
        </>
    );
}

// Your extension must render all four modes
extend(
    'Admin::Product::SubscriptionPlan::Add',
    render(() => <Add />),
);
extend(
    'Admin::Product::SubscriptionPlan::Create',
    render(() => <Create />),
);
extend(
    'Admin::Product::SubscriptionPlan::Remove',
    render(() => <Remove />),
);
extend(
    'Admin::Product::SubscriptionPlan::Edit',
    render(() => <Edit />),
);
