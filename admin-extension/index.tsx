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
import AddSellingPlan from './AddSellingPlan';
import { getClient } from './adminUtils';
import { Translations, translations } from './adminTranslations';
import Remove from './RemoveSellingPlan';

import { CREATE_SELLING_PLAN } from '../lib/sellingPlanGraphQL';
import CreateSellingPlan from './CreateSellingPlan';

function Edit() {
    const data = useData<'Admin::Product::SubscriptionPlan::Edit'>();
    const [planTitle, setPlanTitle] = useState('Current plan');
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(
        () =>
            // eslint-disable-next-line security/detect-object-injection
            translations[locale] || translations.en,
        [locale],
    );

    const { getSessionToken } = useSessionToken();

    const [percentageOff, setPercentageOff] = useState('10');
    const [deliveryFrequency, setDeliveryFrequency] = useState('1');
    const {
        close,
        done,
    } = useContainer<'Admin::Product::SubscriptionPlan::Edit'>();

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
    render(() => <CreateSellingPlan />),
);
extend(
    'Admin::Product::SubscriptionPlan::Remove',
    render(() => <Remove />),
);
extend(
    'Admin::Product::SubscriptionPlan::Edit',
    render(() => <Edit />),
);
