import {
    Button,
    Card,
    Form,
    FormLayout,
    Layout,
    Page,
    SettingToggle,
    Stack,
    TextField,
    TextStyle,
} from '@shopify/polaris';
import React, { useState } from 'react';

const AnnotatedLayout: React.FC = () => {
    const [discount, setDiscount] = useState<string>('10%');
    const [enabled, setEnabled] = useState<boolean>(false);

    const contentStatus = enabled ? 'Disable' : 'Enable';
    const textStatus = enabled ? 'enabled' : 'disabled';

    const handleSubmit = () => {
        console.log('submission', discount, enabled);
    };

    return (
        <Page>
            <Layout>
                <Layout.AnnotatedSection
                    title="Default discount"
                    description="Add a product to Sample App, it will automatically be discounted."
                >
                    <Card sectioned>
                        <Form onSubmit={handleSubmit}>
                            <FormLayout>
                                <TextField
                                    value={discount}
                                    onChange={(value: string) => {
                                        setDiscount(value);
                                    }}
                                    label="Discount percentage"
                                    // type="discount"
                                />
                                <Stack distribution="trailing">
                                    <Button primary submit>
                                        Save
                                    </Button>
                                </Stack>
                            </FormLayout>
                        </Form>
                    </Card>
                </Layout.AnnotatedSection>
                <Layout.AnnotatedSection
                    title="Price updates"
                    description="Temporarily disable all Sample App price updates"
                >
                    <SettingToggle
                        action={{
                            content: contentStatus,
                            onAction: () => {
                                setEnabled(!enabled);
                            },
                        }}
                        enabled={enabled}
                    >
                        This setting is{' '}
                        <TextStyle variation="strong">{textStatus}</TextStyle>.
                    </SettingToggle>
                </Layout.AnnotatedSection>
            </Layout>
        </Page>
    );
};

export default AnnotatedLayout;
