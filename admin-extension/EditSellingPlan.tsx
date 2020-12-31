import React, { ReactElement } from 'react';
import {
    Button,
    Card,
    CardSection,
    Link,
    Stack,
    Text,
    useContainer,
} from '@shopify/argo-admin-react';

const EditSellingPlan = (): ReactElement => {
    const { close } = useContainer<'Admin::Product::SubscriptionPlan::Edit'>();

    return (
        <>
            <Stack spacing="none">
                <Text size="titleLarge">Edit subscription plan</Text>
            </Stack>

            <Card sectioned>
                <CardSection>
                    <Text size="medium">
                        For more control over your selling plan configurations,
                        visit the perma subs selling plan management page
                    </Text>
                </CardSection>
                <CardSection>
                    <Stack spacing="loose" distribution="trailing">
                        <Button title="Cancel" onPress={() => close()} />
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <Link url="/admin/apps/perma-subs">
                            <Button title="Edit selling plans" primary />
                        </Link>
                    </Stack>
                </CardSection>
            </Card>
        </>
    );
};

export default EditSellingPlan;
