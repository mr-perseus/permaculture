import React, { ReactElement } from 'react';
import { Query, QueryResult } from 'react-apollo';
import { gql } from 'apollo-boost';
import {
    Badge,
    Card,
    EmptyState,
    ResourceItem,
    ResourceList,
    Stack,
    TextStyle,
} from '@shopify/polaris';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';
const GET_CUSTOMERS = gql`
    query {
        customers(first: 100) {
            edges {
                node {
                    id
                    displayName
                    email
                    productSubscriberStatus
                }
            }
        }
    }
`;

type Customer = {
    id: string;
    displayName: string;
    email: string;
    productSubscriberStatus: string;
};

type CustomerResult = {
    customers: {
        edges: {
            node: {
                id: string;
                displayName: string;
                email: string;
                productSubscriberStatus: string;
            };
        }[];
    };
};

const CustomerItem = ({ customer }: { customer: Customer }): ReactElement => {
    return (
        <ResourceItem
            id={customer.id}
            onClick={() => {
                // nop
            }}
        >
            <Stack>
                <Stack.Item fill>
                    <h3>
                        <TextStyle variation="strong">
                            {customer.displayName}
                        </TextStyle>
                    </h3>
                </Stack.Item>
                <Stack.Item>
                    <Badge>{customer.productSubscriberStatus}</Badge>
                </Stack.Item>
            </Stack>
        </ResourceItem>
    );
};

const Customers = ({ customers }: { customers: Customer[] }): ReactElement => {
    return (
        <>
            {customers.length !== 0 ? (
                <Card>
                    <ResourceList
                        resourceName={{
                            plural: 'Subscription contracts',
                            singular: 'Subscription contract',
                        }}
                        items={customers}
                        renderItem={(customer) => {
                            return <CustomerItem customer={customer} />;
                        }}
                    />
                </Card>
            ) : (
                <EmptyState heading="Create subscriptions" image={img}>
                    <p>No subscription was sold</p>
                </EmptyState>
            )}
        </>
    );
};

const ContractsTab = (): ReactElement => {
    return (
        <Query query={GET_CUSTOMERS}>
            {({ loading, error, data }: QueryResult<CustomerResult>) => {
                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error...</div>;
                if (!data?.customers?.edges)
                    return <div>Failed loading subscriptions</div>;
                return (
                    <Customers
                        customers={data.customers.edges.map(
                            (edge) => edge.node,
                        )}
                    />
                );
            }}
        </Query>
    );
};

export default ContractsTab;
