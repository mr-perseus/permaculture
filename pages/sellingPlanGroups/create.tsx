import gql from 'graphql-tag';
import React, { ReactElement, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useRouter } from 'next/router';
import { Button, TextField } from '@shopify/polaris';

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

type SellingPlanGroupCreateResult = {
    sellingPlanGroupCreate: {
        sellingPlanGroupCreate?: SellingPlanGroupCreate;
        userErrors: {
            code: string;
            message: string;
        }[];
    };
};

type SellingPlanGroupCreate = {
    name: string;
    description?: string;
    options: string[];
    sellingPlansToCreate: any[]; // TODO replace any with SellingPlan
    products?: {
        edges: {
            node: ProductResult;
        }[];
    };
};

type ProductResult = {
    id: string;
    title: string;
};

const SellingPlanGroup = (): ReactElement => {
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createSellingPlanGroup] = useMutation<
        SellingPlanGroupCreateResult,
        { input: SellingPlanGroupCreate }
    >(CREATE_SELLING_PLAN);

    return (
        <>
            <TextField
                label="Name"
                value={name}
                onChange={(newValue) => setName(newValue)}
            />
            <TextField
                label="Description"
                value={description}
                onChange={(newValue) => setDescription(newValue)}
            />
            <Button
                onClick={async () => {
                    const createResult = await createSellingPlanGroup({
                        variables: {
                            input: {
                                description,
                                name,
                                // TODO remove this hardcoded stuff and add it to form
                                options: ['Delivery every'],
                                sellingPlansToCreate: [
                                    {
                                        name: 'Delivered every week',
                                        options: '1 Week(s)',
                                        position: 1,
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
                                        pricingPolicies: [
                                            {
                                                fixed: {
                                                    adjustmentType:
                                                        'PERCENTAGE',
                                                    adjustmentValue: {
                                                        percentage: 15.0,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    });
                    if (createResult.data?.sellingPlanGroupCreate.userErrors) {
                        // TODO Error handling
                        console.log(
                            createResult.data?.sellingPlanGroupCreate
                                .userErrors,
                        );
                    }
                    await router.push('/index');
                }}
            >
                Save
            </Button>
        </>
    );
};

export default SellingPlanGroup;
