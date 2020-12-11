import { gql } from 'apollo-boost';
import {
    Text,
    useContainer,
    useData,
    useLocale,
    useSessionToken,
} from '@shopify/argo-admin-react';
import React, { useEffect, useMemo, useState } from 'react';
import { translations, Translations } from './adminTranslations';
import { getClient } from './adminUtils';

// eslint-disable-next-line no-secrets/no-secrets
const REMOVE_PRODUCT_FROM_GROUP = gql`
    mutation productLeaveSellingPlanGroups(
        $id: ID!
        $productVariantIds: [ID!]!
        $sellingPlanGroupIds: [ID!]!
        $sellingPlanGroupId: ID!
    ) {
        productLeaveSellingPlanGroups(
            id: $id
            sellingPlanGroupIds: $sellingPlanGroupIds
        ) {
            product {
                id
            }
            userErrors {
                code
                field
                message
            }
        }
        sellingPlanGroupRemoveProductVariants(
            id: $sellingPlanGroupId
            productVariantIds: $productVariantIds
        ) {
            removedProductVariantIds
            userErrors {
                code
                field
                message
            }
        }
    }
`;

// eslint-disable-next-line no-secrets/no-secrets
const REMOVE_VARIANTS_FROM_GROUP = gql`
    mutation sellingPlanGroupRemoveProductVariants(
        $id: ID!
        $productVariantIds: [ID!]!
    ) {
        sellingPlanGroupRemoveProductVariants(
            id: $id
            productVariantIds: $productVariantIds
        ) {
            removedProductVariantIds
            userErrors {
                code
                field
                message
            }
        }
    }
`;

export default function Remove(): JSX.Element {
    const data = useData<'Admin::Product::SubscriptionPlan::Remove'>();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { close, done, setPrimaryAction, setSecondaryAction } = useContainer<
        'Admin::Product::SubscriptionPlan::Remove'
    >();
    const locale = useLocale();
    const localizedStrings: Translations = useMemo(() => {
        // eslint-disable-next-line security/detect-object-injection
        return translations[locale] || translations.en;
    }, [locale]);

    const { getSessionToken } = useSessionToken();
    const [error, setError] = useState(undefined);

    useEffect(() => {
        setPrimaryAction({
            content: 'Remove from plan',
            onAction: () => {
                async function remove() {
                    if (data.variantId) {
                        await getClient(await getSessionToken()).mutate({
                            mutation: REMOVE_VARIANTS_FROM_GROUP,
                            variables: {
                                id: data.sellingPlanGroupId,
                                productVariantIds: [data.variantId],
                            },
                        });
                    } else {
                        await getClient(await getSessionToken()).mutate({
                            mutation: REMOVE_PRODUCT_FROM_GROUP,
                            variables: {
                                id: data.productId,
                                sellingPlanGroupIds: [data.sellingPlanGroupId],
                                productVariantIds: data.variantIds,
                                sellingPlanGroupId: data.sellingPlanGroupId,
                            },
                        });
                    }
                    done();
                }

                try {
                    // eslint-disable-next-line no-void
                    void remove();
                } catch (err) {
                    setError(err);
                }
            },
        });

        setSecondaryAction({
            content: 'Cancel',
            onAction: () => close(),
        });
    }, [
        getSessionToken,
        done,
        close,
        setPrimaryAction,
        setSecondaryAction,
        data.variantId,
        data.variantIds,
        data.sellingPlanGroupId,
        data.productId,
    ]);

    if (error) {
        return (
            <>
                <Text size="titleLarge">Error</Text>
                <Text>There was an error - refresh page</Text>
            </>
        );
    }

    return (
        <>
            <Text size="titleLarge">{localizedStrings.hello}!</Text>
            <Text>
                Remove {`{Product id ${data.productId}}`} from{' '}
                {`{Plan group id ${data.sellingPlanGroupId}}`}
            </Text>
        </>
    );
}
