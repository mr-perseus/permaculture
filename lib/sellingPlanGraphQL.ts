import { gql } from 'apollo-boost';

export const CREATE_SELLING_PLAN = gql`
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

export type SellingPlanGroupCreateResult = {
    sellingPlanGroupCreate: {
        sellingPlanGroup?: { id: string };
        userErrors: {
            code: string;
            message: string;
        }[];
    };
};

export type SellingPlanGroupCreate = {
    name: string;
    description?: string;
    options: string[];
    sellingPlansToCreate: SellingPlanCreate[];
};

type SellingPlanCreate = {
    name: string;
    options: string[];
    deliveryPolicy: {
        recurring: {
            interval: string;
            intervalCount: number;
        };
    };
    billingPolicy: {
        recurring: {
            interval: string;
            intervalCount: number;
        };
    };
};

export type SellingPlanGroupAddProductResult = {
    productJoinSellingPlanGroups: {
        product?: { id: string };
        userErrors: {
            code: string;
            message: string;
        }[];
    };
};

export type SellingPlanGroupAddProductVariantResult = {
    productJoinSellingPlanGroups: {
        productVariant?: { id: string };
        userErrors: {
            code: string;
            message: string;
        }[];
    };
};

export const ADD_PRODUCT_TO_SELLING_PLAN_GROUP = gql`
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

export const ADD_VARIANT_TO_SELLING_PLAN_GROUP = gql`
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
