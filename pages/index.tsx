import React from 'react';
import { gql } from 'apollo-boost';
import { Query, QueryResult } from 'react-apollo';
import { useRouter } from 'next/router';
import {
    Card,
    EmptyState,
    ResourceItem,
    ResourceList,
    TextStyle,
} from '@shopify/polaris';
import { gidToId } from '../lib/utils';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const GET_SUBSCRIPTIONS = gql`
    query {
        products(first: 10) {
            edges {
                node {
                    id
                    title
                }
            }
        }
    }
`;

type ProductsResult = {
    products: {
        edges: {
            node: ProductResult;
        }[];
    };
};

type ProductResult = {
    id: string;
    title: string;
};

const Subscriptions = ({
    products,
}: {
    products: ProductResult[];
}): React.ReactElement => {
    const router = useRouter();

    return (
        <>
            {products.length !== 0 ? (
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
            ) : (
                <EmptyState
                    heading="Create subscriptions"
                    action={{
                        content: 'Create subscription',
                        onAction() {
                            // eslint-disable-next-line no-void
                            void router.push('/subscriptions/new');
                        },
                    }}
                    image={img}
                >
                    <p>
                        Select products that should be available as
                        subscriptions
                    </p>
                </EmptyState>
            )}
        </>
    );
};

// todo at the moment these are products but it should be subscriptions
const IndexPage = (): React.ReactElement => {
    return (
        <Query query={GET_SUBSCRIPTIONS}>
            {({ loading, error, data }: QueryResult<ProductsResult>) => {
                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error...</div>;
                if (!data?.products?.edges)
                    return <div>Failed loading subscriptions</div>;
                return (
                    <Subscriptions
                        products={data.products.edges.map((edge) => edge.node)}
                    />
                );
            }}
        </Query>
    );
};

export default IndexPage;
