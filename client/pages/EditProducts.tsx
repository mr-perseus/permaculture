import {
    Banner,
    Card,
    DisplayText,
    Form,
    FormLayout,
    Frame,
    Layout,
    LoadableAction,
    Page,
    PageActions,
    TextField,
    Toast,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation, MutationFunction } from 'react-apollo';
import React, { useEffect, useState } from 'react';

const UPDATE_PRICE = gql`
    mutation productVariantUpdate($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
            product {
                title
            }
            productVariant {
                id
                price
            }
        }
    }
`;

const EditProduct: React.FC = () => {
    const [name] = useState<string>();
    const [discount, setDiscount] = useState<string>('');
    const [price, setPrice] = useState<number>();
    const [variantId, setVariantId] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    console.log(showToast);

    const itemToBeConsumed = () => {
        const item = store.get<{
            variants: { edges: { node: { price: number; id: string } }[] };
        }>('item');
        const updatePrice = item.variants.edges[0].node.price;
        const updatedVariantId = item.variants.edges[0].node.id;
        const discounter = updatePrice * 0.1;
        setPrice(updatePrice);
        setVariantId(updatedVariantId);
        return (updatePrice - discounter).toFixed(2);
    };

    useEffect(() => {
        setDiscount(itemToBeConsumed());
    }, []);

    return (
        <Mutation mutation={UPDATE_PRICE}>
            {(handleSubmit: MutationFunction, { error, data }: any) => {
                /* eslint-disable @typescript-eslint/no-unsafe-member-access */
                const showError = error && (
                    <Banner status="critical">{error.message}</Banner>
                );
                const updatedShowToast = data && data.productVariantUpdate && (
                    <Toast
                        content="Sucessfully updated"
                        onDismiss={() => setShowToast(false)}
                    />
                );
                /* eslint-enable @typescript-eslint/no-unsafe-member-access */
                return (
                    <Frame>
                        <Page>
                            <Layout>
                                {updatedShowToast}
                                <Layout.Section>{showError}</Layout.Section>
                                <Layout.Section>
                                    <DisplayText size="large">
                                        {name}
                                    </DisplayText>
                                    <Form onSubmit={() => {}}>
                                        <Card sectioned>
                                            <FormLayout>
                                                <FormLayout.Group>
                                                    <TextField
                                                        prefix="$"
                                                        value={String(price)}
                                                        disabled
                                                        label="Original price"
                                                        type="currency"
                                                    />
                                                    <TextField
                                                        prefix="$"
                                                        value={discount}
                                                        onChange={(
                                                            value: string,
                                                        ) => {
                                                            setDiscount(value);
                                                        }}
                                                        label="Discounted price"
                                                        type="currency"
                                                    />
                                                </FormLayout.Group>
                                                <p>
                                                    This sale price will expire
                                                    in two weeks
                                                </p>
                                            </FormLayout>
                                        </Card>
                                        <PageActions
                                            primaryAction={
                                                [
                                                    {
                                                        content: 'Save',
                                                        onAction: () => {
                                                            const productVariableInput = {
                                                                id: variantId,
                                                                price: discount,
                                                            };
                                                            handleSubmit({
                                                                variables: {
                                                                    input: productVariableInput,
                                                                },
                                                            }).catch(() => {
                                                                // TODO
                                                            });
                                                        },
                                                    },
                                                ] as LoadableAction
                                            }
                                            secondaryActions={[
                                                {
                                                    content: 'Remove discount',
                                                },
                                            ]}
                                        />
                                    </Form>
                                </Layout.Section>
                            </Layout>
                        </Page>
                    </Frame>
                );
            }}
        </Mutation>
    );
};

export default EditProduct;
