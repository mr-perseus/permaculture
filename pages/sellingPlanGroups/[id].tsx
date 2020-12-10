import gql from 'graphql-tag';
import React, { ReactElement, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
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
                            onClick={() => {
                                // TODO link to product
                            }}
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

const SellingPlanGroup = (): ReactElement => {
    const router = useRouter();

    const gid = idToGid(router.query.id as string, 'SellingPlanGroup');
    const { loading, error, data } = useQuery<SellingPlanGroupsResult>(
        GET_SELLING_PLAN_GROUP,
        {
            variables: { id: gid },
        },
    );

    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [updateSellingPlanGroup] = useMutation(UPDATE_SELLING_PLAN_GROUP);

    useEffect(() => {
        if (data) {
            setDescription(data.sellingPlanGroup.description);
            setName(data.sellingPlanGroup.name);
        }
    }, [data]);

    if (loading) return <h4>Loading...</h4>;
    if (error) return <h4>Error...</h4>;
    if (!data) return <h4>Product {gid} not found</h4>;

    return (
        <>
            Products
            <Products
                products={data.sellingPlanGroup.products.edges.map(
                    (edge) => edge.node,
                )}
            />
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
                    await updateSellingPlanGroup({
                        variables: {
                            input: {
                                name,
                                description,
                            },
                            id: data.sellingPlanGroup.id,
                        },
                    });
                    await router.push('/index');
                }}
            >
                Save
            </Button>
        </>
    );
};

export default SellingPlanGroup;
