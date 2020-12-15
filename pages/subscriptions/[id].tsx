import React, { ReactElement, useState } from 'react';
import { Badge, Button, FormLayout, Page, TextField } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import gql from 'graphql-tag';
import { Query, QueryResult } from 'react-apollo';
import { Product } from '@shopify/app-bridge/actions/ResourcePicker';
import { idToGid } from '../../lib/utils';
import withId from '../../lib/withId';

const GET_PRODUCT = gql`
    query getProduct($id: ID!) {
        product(id: $id) {
            id
            title
            createdAt
            priceRangeV2 {
                maxVariantPrice {
                    amount
                    currencyCode
                }
                minVariantPrice {
                    amount
                    currencyCode
                }
            }
            variants(first: 100) {
                edges {
                    node {
                        price
                    }
                }
            }
        }
    }
`;

const SubscriptionForm = ({ product }: { product: Product }): ReactElement => {
    const [selectProductOpen, setSelectProductOpen] = useState(false);
    const [title, setTitle] = useState<string>(product.title);

    return (
        <Page
            breadcrumbs={[{ content: 'Subscriptions', url: '/' }]}
            title={title}
            titleMetadata={<Badge status="success">Active</Badge>}
            subtitle=""
        >
            <FormLayout>
                <TextField
                    label="Subscription Title"
                    onChange={(value: string) => setTitle(value)}
                    value={title}
                />

                <TextField
                    label="Product"
                    value={`${title} (${product.id})`}
                    disabled
                />

                <Button onClick={() => setSelectProductOpen(true)}>
                    Select product
                </Button>

                <ResourcePicker
                    open={selectProductOpen}
                    onCancel={() => setSelectProductOpen(false)}
                    resourceType="Product"
                    allowMultiple={false}
                />
            </FormLayout>
        </Page>
    );
};

const Subscription: React.FC<{ id: string }> = ({ id }: { id: string }) => {
    const gid = idToGid(id, 'Product');

    return (
        <Query query={GET_PRODUCT} variables={{ id: gid }}>
            {({ loading, error, data: product }: QueryResult<Product>) => {
                if (loading) return <h4>Loading...</h4>;
                if (error) return <h4>Error...</h4>;
                if (!product) return <h4>Product {gid} not found</h4>;

                return <SubscriptionForm product={product} />;
            }}
        </Query>
    );
};

export default withId(Subscription);
