import gql from 'graphql-tag';
import React, { ReactElement, useEffect, useReducer } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { useRouter } from 'next/router';
import {
    Badge,
    CalloutCard,
    Frame,
    Layout,
    Page,
    PageActions,
} from '@shopify/polaris';
import { gidToId, idToGid } from '../../lib/utils';
import EditSellingPlanGroup from '../../components/EditSellingPlanGroup';
import EditSellingPlans from '../../components/EditSellingPlans';
import sellingPlanGroupReducer, {
    Interval,
    SellingPlanGroup,
    Type,
} from '../../lib/sellingPlanGroupReducer';

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
                            }
                        }
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

const DELETE_SELLING_PLAN_GROUP = gql`
    mutation sellingPlanGroupDelete($id: ID!) {
        sellingPlanGroupDelete(id: $id) {
            deletedSellingPlanGroupId
            userErrors {
                code
                field
                message
            }
        }
    }
`;

export type SellingPlanGroupsResult = {
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

export type SellingPlanResult = {
    id: string;
    name: string;
    description: string;
    deliveryPolicy: {
        interval: Interval;
    };
};

const UpdateSellingPlanGroup = (): ReactElement => {
    const router = useRouter();

    const gid = idToGid(router.query.id as string, 'SellingPlanGroup');
    const { loading, error, data } = useQuery<SellingPlanGroupsResult>(
        GET_SELLING_PLAN_GROUP,
        { variables: { id: gid } },
    );

    const [updateSellingPlanGroup] = useMutation(UPDATE_SELLING_PLAN_GROUP);
    const [deleteSellingPlanGroup] = useMutation(DELETE_SELLING_PLAN_GROUP);

    const [sellingPlanGroup, dispatch] = useReducer(sellingPlanGroupReducer, {
        name: '',
        description: '',
        id: '',
        sellingPlans: [],
    });

    useEffect(() => {
        if (data) {
            const loaded = data.sellingPlanGroup;
            const loadedSellingPlanGroup = {
                id: loaded.id,
                name: loaded.name,
                description: loaded.description,
                sellingPlans: loaded.sellingPlans.edges.map(
                    (edge) => edge.node,
                ),
            };
            dispatch({ type: Type.Load, payload: loadedSellingPlanGroup });
        }
    }, [data]);

    if (loading) return <h4>Loading...</h4>;
    if (error) return <h4>Error...</h4>;
    if (!data || !data.sellingPlanGroup) {
        return <h4>Subscription {gid} not found</h4>;
    }

    const handleSave = async () => {
        // todo declare SellingPlanGroupInput type
        const init: [any[], any[], string[]] = [[], [], []];
        const [
            sellingPlansToCreate,
            sellingPlansToUpdate,
            sellingPlansToDelete,
        ] = sellingPlanGroup.sellingPlans.reduce(
            ([toCreate, toUpdate, toDelete], plan) => {
                if (plan.toDelete) {
                    toDelete.push(plan.id);
                } else {
                    const planInput = {
                        name: plan.name,
                        // description: newPlan.description,
                        billingPolicy: {
                            recurring: {
                                interval: plan.deliveryPolicy.interval,
                            },
                        },
                        deliveryPolicy: {
                            recurring: {
                                interval: plan.deliveryPolicy.interval,
                            },
                        },
                        pricingPolicies: {},
                        id: undefined,
                    };

                    if (plan.toCreate) {
                        toCreate.push(planInput);
                    } else if (plan.toUpdate) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        planInput.id = plan.id;
                        toUpdate.push(planInput);
                    }
                }
                return [toCreate, toUpdate, toDelete];
            },
            init,
        );

        await updateSellingPlanGroup({
            variables: {
                input: {
                    name: sellingPlanGroup.name,
                    description: sellingPlanGroup.description,
                    sellingPlansToDelete,
                    sellingPlansToCreate,
                    sellingPlansToUpdate,
                },
                id: data.sellingPlanGroup.id,
            },
        });
        await router.push('/index');
    };
    const handleDelete = async () => {
        await deleteSellingPlanGroup({
            variables: {
                id: data.sellingPlanGroup.id,
            },
        });
    };

    if ()

    return (
        <Page
            breadcrumbs={[{ content: 'Selling plan groups', url: '/' }]}
            title={sellingPlanGroup.name}
            subtitle={sellingPlanGroup.description}
            titleMetadata={<Badge status="success">Active</Badge>}
        >
            <Frame>
                <Layout>
                    <Layout.Section>
                        <CalloutCard
                            title="Configure products in selling plan group"
                            primaryAction={{
                                content: 'Configure products',
                                url: `/sellingPlanGroups/${gidToId(
                                    sellingPlanGroup.id,
                                )}/products`,
                            }}
                            /* eslint-disable-next-line no-secrets/no-secrets */
                            illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                        />
                        <EditSellingPlanGroup
                            sellingPlanGroup={sellingPlanGroup}
                            dispatch={dispatch}
                        />
                        <EditSellingPlans
                            sellingPlans={sellingPlanGroup.sellingPlans}
                            dispatch={dispatch}
                        />

                        <PageActions
                            primaryAction={{
                                content: 'Save',
                                async onAction() {
                                    await handleSave();
                                },
                            }}
                            secondaryActions={[
                                {
                                    content: 'Delete',
                                    destructive: true,
                                    async onAction() {
                                        await handleDelete();
                                    },
                                },
                            ]}
                        />
                    </Layout.Section>
                </Layout>
            </Frame>
        </Page>
    );
};

export default UpdateSellingPlanGroup;
