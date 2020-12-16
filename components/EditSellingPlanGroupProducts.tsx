import React from 'react';
import { Card, ResourceItem, ResourceList, TextStyle } from '@shopify/polaris';
import { gidToId } from '../lib/utils';
import { ProductResult } from './EditSellingPlanGroup';

const EditSellingPlanGroupProducts = ({
    products,
}: {
    products: ProductResult[];
}): React.ReactElement => {
    return (
        <Card title="Products in selling plan group">
            <ResourceList
                items={products}
                renderItem={(product: ProductResult) => {
                    const id = gidToId(product.id);
                    return (
                        <ResourceItem
                            id={id}
                            onClick={() => {
                                // TODO link to product
                            }}
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
    );
};

export default EditSellingPlanGroupProducts;
