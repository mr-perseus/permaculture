import React, { ReactElement, useState } from 'react';
import { useMutation } from 'react-apollo';
import {
    Button,
    ButtonGroup,
    Card,
    Form,
    FormLayout,
    Frame,
    Page,
    TextField,
    Toast,
} from '@shopify/polaris';
import { gidToId } from '../../lib/utils';
import {
    CREATE_SELLING_PLAN,
    SellingPlanGroupCreate,
    SellingPlanGroupCreateResult,
} from '../../lib/sellingPlanGraphQL';
import useRouterWithShopQuery from '../../lib/useRouterWithShopQuery';

const CreateSellingPlanGroup = (): ReactElement => {
    const [createSellingPlanGroup] = useMutation<
        SellingPlanGroupCreateResult,
        { input: SellingPlanGroupCreate }
    >(CREATE_SELLING_PLAN);

    const [name, setName] = useState('New selling plan group');
    const [description, setDescription] = useState('');
    const [showError, setShowError] = useState(false);
    const router = useRouterWithShopQuery();

    const handleSubmit = async () => {
        const { data, errors } = await createSellingPlanGroup({
            variables: {
                input: {
                    name,
                    description,
                    options: ['one week'],
                    sellingPlansToCreate: [
                        {
                            name: 'Weekly selling plan',
                            options: ['1 Weekly'],
                            billingPolicy: {
                                recurring: {
                                    interval: 'WEEK',
                                    intervalCount: 1,
                                },
                            },
                            deliveryPolicy: {
                                recurring: {
                                    interval: 'WEEK',
                                    intervalCount: 1,
                                },
                            },
                        },
                    ],
                },
            },
        });

        if (
            (errors && errors.length > 0) ||
            (data && data.sellingPlanGroupCreate.userErrors.length > 0)
        ) {
            setShowError(true);
        } else if (
            !data ||
            !data.sellingPlanGroupCreate.sellingPlanGroup ||
            !data.sellingPlanGroupCreate.sellingPlanGroup.id
        ) {
            setShowError(true);
        } else {
            const id = gidToId(data.sellingPlanGroupCreate.sellingPlanGroup.id);
            await router.replace(`/sellingPlanGroups/${id}`);
        }
    };

    return (
        <>
            <Page
                title="Create new selling plan group"
                breadcrumbs={[
                    {
                        content: 'Selling plan groups',
                        url: `/?shop=${String(router.query.shop)}`,
                    },
                ]}
            >
                <Frame>
                    <Card>
                        <Card.Section>
                            <Form onSubmit={handleSubmit}>
                                <FormLayout>
                                    <TextField
                                        label="Name"
                                        value={name}
                                        onChange={setName}
                                    />
                                    <TextField
                                        label="Description"
                                        value={description}
                                        onChange={setDescription}
                                    />
                                    <ButtonGroup>
                                        <Button url="/">Cancel</Button>
                                        <Button submit primary>
                                            Create
                                        </Button>
                                    </ButtonGroup>
                                </FormLayout>
                            </Form>
                        </Card.Section>
                    </Card>
                    {showError && (
                        <Toast
                            content="Fatal error"
                            error
                            onDismiss={() => setShowError(false)}
                        />
                    )}
                </Frame>
            </Page>
        </>
    );
};

export default CreateSellingPlanGroup;
