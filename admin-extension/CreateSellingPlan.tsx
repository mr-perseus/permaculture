import {
    Button,
    Card,
    Stack,
    Text,
    TextField,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
} from '@shopify/argo-admin-react';
import React, { useCallback, useMemo, useState } from 'react';
import { translations, Translations } from './adminTranslations';
import {
    addProductToSellingPlan,
    getClient,
    useGraphQLErrorToast,
} from './adminUtils';
import {
    CREATE_SELLING_PLAN,
    SellingPlanGroupCreate,
    SellingPlanGroupCreateResult,
} from '../lib/sellingPlanGraphQL';

const CreateSellingPlan: React.FunctionComponent = () => {
    const data = useData<'Admin::Product::SubscriptionPlan::Create'>();
    const {
        close,
        done,
    } = useContainer<'Admin::Product::SubscriptionPlan::Create'>();

    const locale = useLocale();
    const localizedStrings: Translations = useMemo(
        () =>
            // eslint-disable-next-line security/detect-object-injection
            translations[locale] || translations.en,
        [locale],
    );

    const errorToast = useGraphQLErrorToast();

    const { getSessionToken } = useSessionToken();

    const [planTitle, setPlanTitle] = useState('');
    const [deliveryFrequency, setDeliveryFrequency] = useState<string>('1');

    const onPrimaryAction = useCallback(async () => {
        if (!planTitle) {
            errorToast(['No plan title submitted']);
            return;
        }

        const token = await getSessionToken();
        const { errors, data: createData } = await getClient(token).mutate<
            SellingPlanGroupCreateResult,
            { input: SellingPlanGroupCreate }
        >({
            mutation: CREATE_SELLING_PLAN,
            variables: {
                input: {
                    name: planTitle,
                    options: ['Basic subscription'],
                    sellingPlansToCreate: [
                        {
                            name: 'Basic plan',
                            options: ['Every week'],
                            billingPolicy: {
                                recurring: {
                                    interval: 'WEEK',
                                    intervalCount: Number(deliveryFrequency),
                                },
                            },
                            deliveryPolicy: {
                                recurring: {
                                    interval: 'WEEK',
                                    intervalCount: Number(deliveryFrequency),
                                },
                            },
                        },
                    ],
                },
            },
        });
        if (errors && errors.length > 0) {
            errorToast(errors);
            done();
        } else if (
            !createData ||
            !createData.sellingPlanGroupCreate ||
            !createData.sellingPlanGroupCreate.sellingPlanGroup ||
            !createData.sellingPlanGroupCreate.sellingPlanGroup.id
        ) {
            errorToast(['Error: Could not create selling plan']);
            done();
        } else {
            const { id } = createData.sellingPlanGroupCreate.sellingPlanGroup;
            const {
                errors: addErrors,
                data: addData,
            } = await addProductToSellingPlan(
                await getSessionToken(),
                [id],
                data.productId,
                data.variantId,
            );

            if (addErrors && addErrors.length > 0) {
                errorToast(addErrors);
            } else if (!addData || !addData.productJoinSellingPlanGroups) {
                errorToast(['Error: Could not add product to selling plan']);
                done();
            } else {
                done();
            }
        }
    }, [
        data.productId,
        data.variantId,
        deliveryFrequency,
        done,
        errorToast,
        getSessionToken,
        planTitle,
    ]);

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

            <Card title="Delivery" sectioned>
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

export default CreateSellingPlan;
