import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { useEffect, useState } from 'react';
import { ApolloError } from 'apollo-client';
import { Interval, SellingPlanGroup } from './sellingPlanGroupReducer';

type SellingPlanGroupsResult = {
    sellingPlanGroup: {
        id: string;
        name: string;
        description: string;
        sellingPlans: {
            edges: {
                node: SellingPlanResult;
            }[];
        };
    };
};

type SellingPlanResult = {
    id: string;
    name: string;
    description: string;
    deliveryPolicy: {
        interval: Interval;
        intervalCount: number;
    };
};

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
            sellingPlans(first: 99) {
                edges {
                    node {
                        id
                        name
                        description
                        deliveryPolicy {
                            ... on SellingPlanRecurringDeliveryPolicy {
                                interval
                                intervalCount
                            }
                        }
                    }
                }
            }
        }
    }
`;

function mapFromResult(data: SellingPlanGroupsResult): SellingPlanGroup {
    const loaded = data.sellingPlanGroup;
    return {
        id: loaded.id,
        name: loaded.name,
        description: loaded.description,
        sellingPlans: loaded.sellingPlans.edges.map((edge) => {
            return {
                id: edge.node.id,
                name: edge.node.name,
                description: edge.node.description,
                billingPolicy: edge.node.deliveryPolicy,
                deliveryPolicy: edge.node.deliveryPolicy,
            };
        }),
    };
}

function useLoadSellingPlanGroup(
    gid: string,
): {
    sellingPlanGroup?: SellingPlanGroup;
    error?: ApolloError;
    loading: boolean;
} {
    const [sellingPlanGroup, setSellingPlanGroup] = useState<
        SellingPlanGroup | undefined
    >(undefined);

    const { loading, error, data } = useQuery<SellingPlanGroupsResult>(
        GET_SELLING_PLAN_GROUP,
        { variables: { id: gid } },
    );

    useEffect(() => {
        if (data?.sellingPlanGroup) {
            const loadedSellingPlanGroup = mapFromResult(data);
            setSellingPlanGroup(loadedSellingPlanGroup);
        }
    }, [data]);

    return { loading, error, sellingPlanGroup };
}

export default useLoadSellingPlanGroup;
