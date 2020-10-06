import gql from 'graphql-tag';
import { Query, QueryResult } from 'react-apollo';
import {
    Card,
    ResourceList,
    Stack,
    TextStyle,
    Thumbnail,
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import React, { useContext } from 'react';
import { ResourceItem } from '@shopify/polaris/dist/types/latest/src/components/ResourceItem';
import { IAppBridgeContext } from '@shopify/app-bridge-react/context';
import { ClientApplication } from '@shopify/app-bridge/client';

const GET_PRODUCTS_BY_ID = gql`
    query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
            ... on Product {
                title
                handle
                descriptionHtml
                id
                images(first: 1) {
                    edges {
                        node {
                            originalSrc
                            altText
                        }
                    }
                }
                variants(first: 1) {
                    edges {
                        node {
                            price
                            id
                        }
                    }
                }
            }
        }
    }
`;

const ResourceListWithProducts: React.FC = () => {
    const app = useContext<IAppBridgeContext>(Context);
    const redirectToProduct = () => {
        const redirect = Redirect.create(app as ClientApplication<any>);
        redirect.dispatch(Redirect.Action.APP, '/edit-products');
    };

    const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();
    return (
        <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
            {({
                data,
                loading,
                error,
            }: QueryResult<{ nodes: typeof ResourceItem[] }>) => {
                // TODO fix typing here
                if (loading) {
                    return <div>Loading…</div>;
                }
                if (error) {
                    return <div>{error.message}</div>;
                }
                if (!data) {
                    return <div>Data not found...</div>;
                }
                console.log(data);
                return (
                    <Card>
                        <ResourceList
                            showHeader
                            resourceName={{
                                singular: 'Product',
                                plural: 'Products',
                            }}
                            items={data.nodes}
                            renderItem={(item: any) => {
                                /* eslint-disable @typescript-eslint/no-unsafe-member-access */
                                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                                const media = (
                                    <Thumbnail
                                        source={
                                            item.images.edges[0]
                                                ? item.images.edges[0].node
                                                      .originalSrc
                                                : ''
                                        }
                                        alt={
                                            item.images.edges[0]
                                                ? item.images.edges[0].node
                                                      .altText
                                                : ''
                                        }
                                    />
                                );
                                const { price } = item.variants.edges[0].node;
                                return (
                                    <ResourceList.Item
                                        id={item.id}
                                        media={media}
                                        accessibilityLabel={`View details for ${String(
                                            item.title,
                                        )}`}
                                        onClick={() => {
                                            store.set('item', item);
                                            redirectToProduct();
                                        }}
                                    >
                                        <Stack>
                                            <Stack.Item fill>
                                                <h3>
                                                    <TextStyle variation="strong">
                                                        {item.title}
                                                    </TextStyle>
                                                </h3>
                                            </Stack.Item>
                                            <Stack.Item>
                                                <p>${price}</p>
                                            </Stack.Item>
                                            <Stack.Item>
                                                <p>
                                                    Expires on {twoWeeksFromNow}{' '}
                                                </p>
                                            </Stack.Item>
                                        </Stack>
                                    </ResourceList.Item>
                                );
                                /* eslint-enable @typescript-eslint/no-unsafe-member-access */
                                /* eslint-enable @typescript-eslint/no-unsafe-assignment */
                            }}
                        />
                    </Card>
                );
            }}
        </Query>
    );
};

export default ResourceListWithProducts;
