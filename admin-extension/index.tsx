import React, { useCallback, useMemo, useState } from 'react';
import {
    Button,
    Card,
    extend,
    render,
    Stack,
    Text,
    TextField,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
} from '@shopify/argo-admin-react';
import { gql } from 'apollo-boost';
import AddSellingPlan from './AddSellingPlan';
import { getClient } from './adminUtils';
import { Translations, translations } from './adminTranslations';
import Remove from './RemoveSellingPlan';

const TEST_CREATE_SELLING_PLAN = gql`
    mutation {
        sellingPlanGroupCreate(
            input: {
                name: "Subscribe and save"
                merchantCode: "subscribe-and-save"
                options: ["Delivery every"]
                position: 1
                sellingPlansToCreate: [
                    {
                        name: "Delivered every week"
                        options: "1 Week(s)"
                        position: 1
                        billingPolicy: {
                            recurring: { interval: WEEK, intervalCount: 1 }
                        }
                        deliveryPolicy: {
                            recurring: { interval: WEEK, intervalCount: 1 }
                        }
                        pricingPolicies: [
                            {
                                fixed: {
                                    adjustmentType: PERCENTAGE
                                    adjustmentValue: { percentage: 15.0 }
                                }
                            }
                        ]
                    }
                    {
                        name: "Delivered every two weeks"
                        options: "2 Week(s)"
                        position: 2
                        billingPolicy: {
                            recurring: { interval: WEEK, intervalCount: 2 }
                        }
                        deliveryPolicy: {
                            recurring: { interval: WEEK, intervalCount: 2 }
                        }
                        pricingPolicies: [
                            {
                                fixed: {
                                    adjustmentType: PERCENTAGE
                                    adjustmentValue: { percentage: 10.0 }
                                }
                            }
                        ]
                    }
                    {
                        name: "Delivered every three weeks"
                        options: "3 Week(s)"
                        position: 3
                        billingPolicy: {
                            recurring: { interval: WEEK, intervalCount: 3 }
                        }
                        deliveryPolicy: {
                            recurring: { interval: WEEK, intervalCount: 3 }
                        }
                        pricingPolicies: [
                            {
                                fixed: {
                                    adjustmentType: PERCENTAGE
                                    adjustmentValue: { percentage: 5.0 }
                                }
                            }
                        ]
                    }
                ]
            }
            resources: { productIds: [], productVariantIds: [] }
        ) {
            sellingPlanGroup {
                id
            }
            userErrors {
                field
                message
            }
        }
    }
`;

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

    const { getSessionToken } = useSessionToken();

    // Mock plan settings
    const [planTitle, setPlanTitle] = useState('');
    const [percentageOff, setPercentageOff] = useState('');
    const [deliveryFrequency, setDeliveryFrequency] = useState('');

    const onPrimaryAction = useCallback(async () => {
        const token = await getSessionToken();
        await getClient(token).mutate({
            mutation: TEST_CREATE_SELLING_PLAN,
            variables: {
                id: data.productId,
            },
        });
        done();
    }, [data.productId, done, getSessionToken]);

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
    render(() => <AddSellingPlan />),
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
