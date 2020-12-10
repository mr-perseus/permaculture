import gql from 'graphql-tag';
import React, { ReactElement } from 'react';
import { useMutation } from 'react-apollo';
import SellingPlanGroup from '../../components/SellingPlanGroup';

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

const CreateSellingPlanGroup = (): ReactElement => {
    const [createSellingPlanGroup] = useMutation<
        SellingPlanGroupCreateResult,
        { input: SellingPlanGroupCreate }
    >(CREATE_SELLING_PLAN);

    return (
        <SellingPlanGroup
            modifySellingPlanGroup={async (description, name) => {
                return createSellingPlanGroup({
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
                                                adjustmentType: 'PERCENTAGE',
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
            }}
        />
    );
};

export default CreateSellingPlanGroup;
