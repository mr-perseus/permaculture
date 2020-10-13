import SubscriptionContext from './SubscriptionContext';

// todo not tested if this works... problems with types therefore no graphql used
export default class ShopifyService {
    async createProduct(
        title: string,
        { shop, accessToken }: SubscriptionContext,
    ): Promise<string> {
        const productInput = {
            title,
            body_html: `<strong>Subscription</strong>`,
            product_type: 'subscription',
            published: false,
        };
        const response = await fetch(
            `https://${shop}.myshopify.com/admin/api/2020-10/products.json`,
            {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInput),
            },
        );

        const { product } = (await response.json()) as {
            product: { id: string };
        };

        return product.id;
    }
}
