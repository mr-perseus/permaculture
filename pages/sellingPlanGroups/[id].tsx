import gql from 'graphql-tag';
import React, { ReactElement, useState } from 'react';
import { Query, QueryResult } from 'react-apollo';
import { useRouter } from 'next/router';
import {
    Button,
    Card,
    ResourceItem,
    ResourceList,
    TextField,
    TextStyle,
} from '@shopify/polaris';
import { gidToId, idToGid } from '../../lib/utils';

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
        description: string;
        products: {
            edges: {
                node: ProductResult;
            }[];
        };
    };
};

type ProductResult = {
    id: string;
    title: string;
};

const Products = ({
    products,
}: {
    products: ProductResult[];
}): React.ReactElement => {
    return (
        <Card>
            <ResourceList
                items={products}
                renderItem={(product: ProductResult) => {
                    const id = gidToId(product.id);
                    return (
                        <ResourceItem
                            id={id}
                            url={`/subscriptions/${id}`}
                            accessibilityLabel={`View details for ${product.title}`}
                        >
                            <h3>
                                <TextStyle variation="strong">
                                    {product.title}
                                </TextStyle>
                            </h3>
                        </ResourceItem>
                    );
                }}
            />
        </Card>
    );
};

const Test = (): ReactElement => {
    const router = useRouter();
    const gid = idToGid(router.query.id as string, 'SellingPlanGroup');
    const [description, setDescription] = useState('');
    // const updateSellingPlanGroup = useMutation(UPDATE_SELLING_PLAN_GROUP, {
    //     fetchPolicy: 'network-only',
    // });

    return (
        <Query query={GET_SELLING_PLAN_GROUP} variables={{ id: gid }}>
            {({
                loading,
                error,
                data,
            }: QueryResult<SellingPlanGroupsResult>) => {
                console.log('loading, error, data');
                console.log(loading, error, data);

                if (loading) return <h4>Loading...</h4>;
                if (error) return <h4>Error...</h4>;
                if (!data) return <h4>Product {gid} not found</h4>;

                setDescription(data.sellingPlanGroup.description);

                return (
                    <>
                        Products
                        <Products
                            products={data.sellingPlanGroup.products.edges.map(
                                (edge) => edge.node,
                            )}
                        />
                        TODO ProductVariants
                        <TextField
                            label="Description"
                            value={description}
                            onChange={setDescription}
                        />
                        <Button
                            onClick={async () => {
                                // await updateSellingPlanGroup({
                                //     variables: { description },
                                // });
                            }}
                        >
                            Save
                        </Button>
                    </>
                );
            }}
        </Query>
    );
};

export default Test;
