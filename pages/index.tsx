import React from 'react';
import { gql } from 'apollo-boost';
import { Query, QueryResult } from 'react-apollo';
import { useRouter } from 'next/router';
import {
    Button,
    Card,
    EmptyState,
    ResourceItem,
    ResourceList,
    TextStyle,
} from '@shopify/polaris';
import { gidToId } from '../lib/utils';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const GET_SELLING_PLAN_GROUPS = gql`
    query {
        sellingPlanGroups(first: 10) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

type SellingPlanGroups = {
    sellingPlanGroups: {
        edges: {
            node: SellingPlanGroup;
        }[];
    };
};

type SellingPlanGroup = {
    id: string;
    name: string;
};

// const GET_SUBSCRIPTIONS = gql`
//     query {
//         products(first: 10) {
//             edges {
//                 node {
//                     id
//                     title
//                 }
//             }
//         }
//     }
// `;
//
// type ProductsResult = {
//     products: {
//         edges: {
//             node: ProductResult;
//         }[];
//     };
// };
//
// type ProductResult = {
//     id: string;
//     title: string;
// };

const Subscriptions = ({
    sellingPlanGroups,
}: {
    sellingPlanGroups: SellingPlanGroup[];
}): React.ReactElement => {
    const router = useRouter();

    return (
        <>
            {sellingPlanGroups.length !== 0 ? (
                <>
                    <Button
                        onClick={async () => {
                            await router.push('/sellingPlanGroups/new');
                        }}
                    >
                        Create Subscription
                    </Button>
                    <Card>
                        <ResourceList
                            items={sellingPlanGroups}
                            renderItem={(
                                sellingPlanGroup: SellingPlanGroup,
                            ) => {
                                const id = gidToId(sellingPlanGroup.id);
                                return (
                                    <ResourceItem
                                        id={id}
                                        url={`/sellingPlanGroups/${id}`}
                                        accessibilityLabel={`View details for ${sellingPlanGroup.name}`}
                                    >
                                        <h3>
                                            <TextStyle variation="strong">
                                                {sellingPlanGroup.name}
                                            </TextStyle>
                                        </h3>
                                    </ResourceItem>
                                );
                            }}
                        />
                    </Card>
                </>
            ) : (
                <EmptyState
                    heading="Create subscriptions"
                    action={{
                        content: 'Create subscription',
                        async onAction() {
                            await router.push('/sellingPlanGroups/new');
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

const IndexPage = (): React.ReactElement => {
    return (
        <>
            {/* <div>Products</div> */}
            {/* <Query query={GET_SUBSCRIPTIONS}> */}
            {/*    {({ loading, error, data }: QueryResult<ProductsResult>) => { */}
            {/*        if (loading) return <div>Loading...</div>; */}
            {/*        if (error) return <div>Error...</div>; */}
            {/*        if (!data?.products?.edges) */}
            {/*            return <div>Failed loading subscriptions</div>; */}
            {/*        return ( */}
            {/*            <Subscriptions */}
            {/*                products={data.products.edges.map( */}
            {/*                    (edge) => edge.node, */}
            {/*                )} */}
            {/*            /> */}
            {/*        ); */}
            {/*    }} */}
            {/* </Query> */}
            {/* <div>Selling plans</div> */}
            <Query query={GET_SELLING_PLAN_GROUPS}>
                {({ loading, error, data }: QueryResult<SellingPlanGroups>) => {
                    console.log('loading, error, data');
                    console.log(loading, error, data);

                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error...</div>;
                    if (!data?.sellingPlanGroups?.edges)
                        return <div>Failed loading subscriptions</div>;
                    return (
                        <Subscriptions
                            sellingPlanGroups={data.sellingPlanGroups.edges.map(
                                (edge) => edge.node,
                            )}
                        />
                    );
                }}
            </Query>
        </>
    );
};

export default IndexPage;
