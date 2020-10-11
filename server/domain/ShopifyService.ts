import SubscriptionContext from './SubscriptionContext';

// todo not tested if this works... problems with types therefore no graphql used
export default class ShopifyService {
    // eslint-disable-next-line class-methods-use-this
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
                    // todo @mr-perseus how to solve this?
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInput),
            },
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { product } = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
        return product.id;
    }
}
