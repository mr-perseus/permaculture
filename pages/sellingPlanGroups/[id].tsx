import gql from 'graphql-tag';
import React, { ReactElement } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { useRouter } from 'next/router';
import { idToGid } from '../../lib/utils';
import SellingPlanGroup, {
    ProductResult,
} from '../../components/SellingPlanGroup';

const GET_SELLING_PLAN_GROUP = gql`
    query getSellingPlanGroup($id: ID!) {
        sellingPlanGroup(id: $id) {
            id
            name
            createdAt
            appId
            createdAt
            description
            merchantCode
            options
            position
            productCount
            productVariantCount
            summary
            products(first: 100) {
                edges {
                    node {
                        id
                        title
                    }
                }
            }
            productVariants(first: 100) {
                edges {
                    node {
                        id
                        title
                    }
                }
            }
        }
    }
`;

const UPDATE_SELLING_PLAN_GROUP = gql`
    mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
        sellingPlanGroupUpdate(id: $id, input: $input) {
            deletedSellingPlanIds
            sellingPlanGroup {
                id
                name
            }
            userErrors {
                code
                field
                message
            }
        }
    }
`;

type SellingPlanGroupsResult = {
    sellingPlanGroup: {
        id: string;
        description: string;
        name: string;
        products: {
            edges: {
                node: ProductResult;
            }[];
        };
    };
};

const UpdateSellingPlanGroup = (): ReactElement => {
    const router = useRouter();

    const gid = idToGid(router.query.id as string, 'SellingPlanGroup');
    const { loading, error, data } = useQuery<SellingPlanGroupsResult>(
        GET_SELLING_PLAN_GROUP,
        {
            variables: { id: gid },
        },
    );

    const [updateSellingPlanGroup] = useMutation(UPDATE_SELLING_PLAN_GROUP);

    if (loading) return <h4>Loading...</h4>;
    if (error) return <h4>Error...</h4>;
    if (!data) return <h4>Product {gid} not found</h4>;

    return (
        <SellingPlanGroup
            modifySellingPlanGroup={async (description, name) => {
                return updateSellingPlanGroup({
                    variables: {
                        input: {
                            name,
                            description,
                        },
                        id: data.sellingPlanGroup.id,
                    },
                });
            }}
            products={data.sellingPlanGroup.products.edges.map(
                (edge) => edge.node,
            )}
            defaultDescription={data.sellingPlanGroup.description}
            defaultName={data.sellingPlanGroup.name}
        />
    );
};

export default UpdateSellingPlanGroup;
