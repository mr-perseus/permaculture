import React, { useState } from 'react';
import { Query, QueryResult, useMutation } from 'react-apollo';
import { useRouter } from 'next/router';
import {
    Button,
    Card,
    EmptyState,
    Frame,
    Layout,
    Page,
    ResourceItem,
    ResourceList,
    TextStyle,
    Toast,
} from '@shopify/polaris';
import { gql } from 'apollo-boost';
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

const SellingPlanGroupItem = ({
    id,
    name,
    handleDelete,
}: {
    id: string;
    name: string;
    handleDelete: () => void;
}) => {
    return (
        <ResourceItem
            id={id}
            url={`/sellingPlanGroups/${id}`}
            accessibilityLabel={`View details for ${name}`}
            shortcutActions={[
                {
                    content: 'Delete',
                    accessibilityLabel: `Delete ${name}`,
                    onAction() {
                        handleDelete();
                    },
                },
            ]}
        >
            <h3>
                <TextStyle variation="strong">{name}</TextStyle>
            </h3>
        </ResourceItem>
    );
};

const Subscriptions = ({
    sellingPlanGroups,
}: {
    sellingPlanGroups: SellingPlanGroup[];
}): React.ReactElement => {
    const router = useRouter();
    const [groups, setGroups] = useState(sellingPlanGroups);
    const [showError, setShowError] = useState(false);
    const [deleteSellingPlanGroup] = useMutation<{
        userErrors: { code: string; field: string; message: string }[];
    }>(DELETE_SELLING_PLAN_GROUP);

    const handleDelete = async (gid: string) => {
        const { errors, data } = await deleteSellingPlanGroup({
            variables: { id: gid },
        });

        if (errors && errors.length > 0) {
            setShowError(true);
        } else if (data?.userErrors && data.userErrors.length > 0) {
            setShowError(true);
        } else {
            setGroups((prevGroups) =>
                prevGroups.filter((group) => group.id !== gid),
            );
        }
    };

    return (
        <Page
            primaryAction={
                <Button
                    primary
                    onClick={async () => {
                        await router.push('/sellingPlanGroups/create');
                    }}
                >
                    Create subscription
                </Button>
            }
            title="Subscriptions"
        >
            <Frame>
                <Layout>
                    <Layout.Section>
                        {groups.length !== 0 ? (
                            <Card>
                                <ResourceList
                                    items={groups}
                                    renderItem={(
                                        sellingPlanGroup: SellingPlanGroup,
                                    ) => {
                                        const id = gidToId(sellingPlanGroup.id);
                                        return (
                                            <SellingPlanGroupItem
                                                id={id}
                                                name={sellingPlanGroup.name}
                                                handleDelete={() =>
                                                    handleDelete(
                                                        sellingPlanGroup.id,
                                                    )
                                                }
                                            />
                                        );
                                    }}
                                />
                            </Card>
                        ) : (
                            <EmptyState
                                heading="Create subscriptions"
                                action={{
                                    content: 'Create subscription',
                                    async onAction() {
                                        await router.push(
                                            '/sellingPlanGroups/create',
                                        );
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
                    </Layout.Section>
                </Layout>
                {showError && (
                    <Toast
                        error
                        content="Error deleting selling plan group"
                        onDismiss={() => setShowError(false)}
                    />
                )}
            </Frame>
        </Page>
    );
};

const IndexPage = (): React.ReactElement => {
    return (
        <>
            <Query query={GET_SELLING_PLAN_GROUPS}>
                {({ loading, error, data }: QueryResult<SellingPlanGroups>) => {
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
