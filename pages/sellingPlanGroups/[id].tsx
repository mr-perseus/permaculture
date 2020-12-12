import gql from 'graphql-tag';
import React, { ReactElement, useReducer } from 'react';
import { useMutation } from 'react-apollo';
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
} from '../../lib/sellingPlanGroupReducer';

import useSellingPlanGroup from '../../lib/useSellingPlanGroup';

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

type SellingPlanGroupInput = {
    name: string;
    description: string;

    sellingPlansToUpdate: SellingPlanInput[];
    sellingPlansToCreate: SellingPlanInput[];
    sellingPlansToDelete: string[];
};

type SellingPlanInput = {
    id?: string;
    name: string;
    description: string;
    billingPolicy: {
        recurring: {
            interval: Interval;
            intervalCount: number;
        };
    };
    deliveryPolicy: {
        recurring: {
            interval: Interval;
            intervalCount: number;
        };
    };
};

function mapToInput(sellingPlanGroup: SellingPlanGroup) {
    const sellingPlansToCreate: SellingPlanInput[] = [];
    const sellingPlansToUpdate: SellingPlanInput[] = [];
    const sellingPlansToDelete: string[] = [];

    sellingPlanGroup.sellingPlans.forEach((plan) => {
        if (plan.toDelete) {
            sellingPlansToDelete.push(plan.id);
        } else {
            const planInput: SellingPlanInput = {
                name: plan.name,
                description: plan.description,
                billingPolicy: {
                    recurring: {
                        interval: plan.deliveryPolicy.interval,
                        intervalCount: 1,
                    },
                },
                deliveryPolicy: {
                    recurring: {
                        interval: plan.deliveryPolicy.interval,
                        intervalCount: 1,
                    },
                },
            };

            if (plan.toCreate) {
                sellingPlansToCreate.push(planInput);
            } else if (plan.toUpdate) {
                planInput.id = plan.id;
                sellingPlansToUpdate.push(planInput);
            }
        }
    });

    const input: SellingPlanGroupInput = {
        name: sellingPlanGroup.name,
        description: sellingPlanGroup.description,
        sellingPlansToDelete,
        sellingPlansToCreate,
        sellingPlansToUpdate,
    };
    return input;
}

const UpdateSellingPlanGroup = ({
    initialSellingPlanGroup,
    gid,
}: {
    initialSellingPlanGroup: SellingPlanGroup;
    gid: string;
}): ReactElement => {
    const router = useRouter();
    const [updateSellingPlanGroup] = useMutation(UPDATE_SELLING_PLAN_GROUP);
    const [deleteSellingPlanGroup] = useMutation(DELETE_SELLING_PLAN_GROUP);

    const [sellingPlanGroup, dispatch] = useReducer(
        sellingPlanGroupReducer,
        initialSellingPlanGroup,
    );

    const handleSave = async () => {
        const input = mapToInput(sellingPlanGroup);

        await updateSellingPlanGroup({
            variables: {
                input,
                id: sellingPlanGroup.id,
            },
        });
        await router.push('/index');
    };

    const handleDelete = async () => {
        await deleteSellingPlanGroup({
            variables: {
                id: gid,
            },
        });
    };

    const id = gidToId(sellingPlanGroup.id);
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
                                url: `/sellingPlanGroups/${id}/products`,
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

const SellingPlanGroupContainer: React.FunctionComponent = () => {
    const router = useRouter();
    const gid = idToGid(router.query.id as string, 'SellingPlanGroup');
    const { loading, error, sellingPlanGroup } = useSellingPlanGroup(gid);

    if (loading) return <h4>Loading...</h4>;
    if (error) return <h4>Error...</h4>;
    if (!sellingPlanGroup || !sellingPlanGroup.id) {
        return <h4>Subscription {gid} not found</h4>;
    }

    return (
        <UpdateSellingPlanGroup
            initialSellingPlanGroup={sellingPlanGroup}
            gid={gid}
        />
    );
};

export default SellingPlanGroupContainer;
