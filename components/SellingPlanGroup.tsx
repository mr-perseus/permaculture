import React, { useState } from 'react';
import {
    Button,
    Card,
    ResourceItem,
    ResourceList,
    TextField,
    TextStyle,
} from '@shopify/polaris';
import { useRouter } from 'next/router';
import { ExecutionResult } from '@apollo/react-common';
import { gidToId } from '../lib/utils';

type SellingPlanGroupProps = {
    modifySellingPlanGroup: (
        description: string,
        name: string,
    ) => Promise<ExecutionResult<any>>; // TODO types for result
    products?: ProductResult[];
    defaultName?: string;
    defaultDescription?: string;
};

export type ProductResult = {
    id: string;
    title: string;
};

const Products = ({
    products,
}: {
    products: ProductResult[];
}): React.ReactElement => {
    return (
        <Card>
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

const SellingPlanGroup: React.FC<SellingPlanGroupProps> = ({
    modifySellingPlanGroup,
    products,
    defaultName,
    defaultDescription,
}: SellingPlanGroupProps) => {
    const router = useRouter();

    const [description, setDescription] = useState<string>(
        defaultDescription || '',
    );
    const [name, setName] = useState<string>(defaultName || '');

    return (
        <>
            {products && <Products products={products} />}
            <TextField
                label="Name"
                value={name}
                onChange={(newValue) => setName(newValue)}
            />
            <TextField
                label="Description"
                value={description}
                onChange={(newValue) => setDescription(newValue)}
            />
            <Button
                onClick={async () => {
                    const result = await modifySellingPlanGroup(
                        description,
                        name,
                    );
                    // TODO error handling
                    console.log(result);
                    await router.push('/index');
                }}
            >
                Save
            </Button>
        </>
    );
};

SellingPlanGroup.defaultProps = {
    products: undefined,
    defaultName: '',
    defaultDescription: '',
};

export default SellingPlanGroup;
