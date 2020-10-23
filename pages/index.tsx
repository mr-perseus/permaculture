import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import React, { useState } from 'react';
import { SelectPayload } from '@shopify/app-bridge/actions/ResourcePicker';
import ResourceListWithProducts from '../components/ResourceList';
import Clock from '../components/Clock';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);

    const handleSelection = (resources: SelectPayload) => {
        const idsFromResources = resources.selection.map(
            (product) => product.id,
        );
        setOpen(false);
        store.set('ids', idsFromResources);
    };

    const emptyState = !store.get('ids');
    return (
        <div>
            <Clock />
            <Page>
                <TitleBar
                    title="Sample App"
                    primaryAction={{
                        content: 'Select products',
                        onAction: () => setOpen(true),
                    }}
                />
                <ResourcePicker
                    resourceType="Product"
                    showVariants={false}
                    open={open}
                    onSelection={(resources) => handleSelection(resources)}
                    onCancel={() => setOpen(false)}
                />
                {emptyState ? (
                    <Layout>
                        <EmptyState
                            heading="Discount your products temporarily"
                            action={{
                                content: 'Select products',
                                onAction: () => setOpen(true),
                            }}
                            image={img}
                        >
                            <p>
                                Select products to change their price
                                temporarily.
                            </p>
                        </EmptyState>
                    </Layout>
                ) : (
                    <ResourceListWithProducts />
                )}
            </Page>
        </div>
    );
};

export default Index;
