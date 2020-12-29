import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Stack,
    Text,
    TextField,
    useContainer,
    useData,
    useSessionToken,
} from '@shopify/argo-admin-react';
import { getClient } from './adminUtils';
import { CREATE_SELLING_PLAN } from '../lib/sellingPlanGraphQL';

const EditSellingPlan = (): ReactElement => {
    const data = useData<'Admin::Product::SubscriptionPlan::Edit'>();
    const [planTitle, setPlanTitle] = useState('Current plan');
    const [deliveryFrequency, setDeliveryFrequency] = useState('1');

    const { getSessionToken } = useSessionToken();

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
                <Text size="titleLarge">Edit subscription plan</Text>
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

            <Card title="Delivery options" sectioned>
                <Stack>
                    <TextField
                        type="number"
                        label="Delivery frequency (in weeks)"
                        value={deliveryFrequency}
                        onChange={setDeliveryFrequency}
                    />
                </Stack>
            </Card>

            {actions}
        </>
    );
};

export default EditSellingPlan;
