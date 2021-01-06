import gql from 'graphql-tag';
import React, { ReactElement, useReducer } from 'react';
import { useMutation } from 'react-apollo';
import { useRouter } from 'next/router';
import { Badge, Frame, Layout, Page, PageActions } from '@shopify/polaris';
import { idToGid } from '../../lib/utils';
import EditSellingPlanGroup from '../../components/EditSellingPlanGroup';
import SellingPlans from '../../components/SellingPlans';
import sellingPlanGroupReducer, {
    Interval,
    SellingPlanGroup,
} from '../../lib/sellingPlanGroupReducer';

import useSellingPlanGroup from '../../lib/useSellingPlanGroup';
import withId from '../../lib/withId';

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
                        <EditSellingPlanGroup
                            sellingPlanGroup={sellingPlanGroup}
                            dispatch={dispatch}
                        />
                        <SellingPlans
                            sellingPlanGroup={sellingPlanGroup}
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
const SellingPlanGroupContainer: React.FC<{ id: string }> = ({
    id,
}: {
    id: string;
}) => {
    const gid = idToGid(id, 'SellingPlanGroup');
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

export default withId(SellingPlanGroupContainer);
