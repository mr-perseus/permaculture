import React, { ReactElement } from 'react';
import { Badge, Layout, Page } from '@shopify/polaris';
import { useQuery } from 'react-apollo';
import { gql } from 'apollo-boost';
import { useRouter } from 'next/router';
import { idToGid } from '../../../lib/utils';
import EditSellingPlanGroupProducts from '../../../components/EditSellingPlanGroupProducts';

const GET_SELLING_PLAN_PRODUCTS = gql`
    query getSellingsPlanGroup($id: ID!) {
        sellingPlanGroup(id: $id) {
            name
            description
            products(first: 99) {
                edges {
                    node {
                        title
                        description
                        id
                    }
                }
            }
        }
    }
`;

const EditProducts = (): ReactElement => {
    const router = useRouter();
    const { id } = router.query;
    const gid = idToGid(id as string, 'SellingPlanGroup');
    const { data, loading, error } = useQuery<{
        sellingPlanGroup: {
            name: string;
            description: string;
            products: {
                edges: {
                    node: {
                        title: string;
                        description: string;
                        id: string;
                    };
                }[];
            };
        };
    }>(GET_SELLING_PLAN_PRODUCTS, { variables: { id: gid } });

    if (error) {
        return <>Error...</>;
    }
    if (loading) {
        return <>Loading...</>;
    }
    if (!data) {
        return <>No data... </>;
    }

    return (
        <Page
            breadcrumbs={[
                { content: 'Selling plan groups', url: '/' },
                {
                    content: data.sellingPlanGroup.name,
                    url: `/sellingPlanGroups/${id as string}`,
                },
            ]}
            title={data.sellingPlanGroup.name}
            subtitle={data.sellingPlanGroup.description}
            titleMetadata={<Badge status="success">Active</Badge>}
        >
            <Layout>
                <Layout.Section>
                    {/* {loading && !error && <Loading />} */}
                    {!error && !loading && data && (
                        <EditSellingPlanGroupProducts
                            products={data.sellingPlanGroup.products.edges.map(
                                (edge) => edge.node,
                            )}
                        />
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default EditProducts;
